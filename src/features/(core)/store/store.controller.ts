import type { FastifyReply, FastifyRequest } from 'fastify'
import { StoreCommands } from './commands/store.commands'
import { StoreQueries } from './queries/store.queries'
import type {
  CreateStoreRequest,
  DeleteStoreRequest,
  GetStoreRequest,
  UpdateStoreRequest,
} from './store.interfaces'
import dns from "node:dns/promises";
import { createCloudflareCustomHostname, getCloudflareHostnameInfo } from '@/plugins/cloudflare';


async function validateDomain(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveCname(domain);
    console.log(records)
    return records.some(r => r.includes("app.25stock.com"));
  } catch (e: any) {
    // Trata erros DNS (ENOTFOUND, ETIMEDOUT, etc.)
    if (e.code === 'ENOTFOUND' || e.code === 'ETIMEDOUT' || e.code === 'ESERVFAIL') {
      console.log(`DNS error for domain ${domain}:`, e.code)
      return false;
    }
    // Para outros erros, também retorna false mas loga o erro completo
    console.log(`Error validating domain ${domain}:`, e)
    return false;
  }
}

export const StoreController = {
  async create(request: CreateStoreRequest, reply: FastifyReply) {
    try {
      const { name, cnpj, email, phone, cep, city, state, address, status } = request.body
      const ownerId = request.user?.id

      const result = await StoreCommands.create({
        ownerId,
        name,
        cnpj,
        email,
        phone,
        cep,
        city,
        state,
        address,
        status,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'CNPJ already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      if (error.message === 'Owner not found') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetStoreRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id

      const result = await StoreQueries.getById(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Store not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: UpdateStoreRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id
      const updateData = { ...request.body }

      const result = await StoreCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Store not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'CNPJ already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: DeleteStoreRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id

      await StoreCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Store not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Cannot delete store with existing products') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id

      const result = await StoreQueries.getStats(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async createCustomDomain(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id
      const { customDomain } = request.body as { customDomain: string }

      // 1️⃣ Validar DNS
      const isValid = await validateDomain(customDomain)
      
      if (!isValid) {
        return reply.status(400).send({ error: 'Invalid domain' })
      }

      // 2️⃣ Criar Custom Hostname no Cloudflare
      const cf = await createCloudflareCustomHostname(customDomain)

      if (!cf.id) {
        return reply.status(500).send({
          error: 'Failed to create custom hostname',
          details: 'Cloudflare API did not return a hostname ID',
        })
      }

      // cf.id  → ID do hostname
      // cf.status → pending_validation, ssl_pending, active, etc.

      // 3️⃣ Salvar no banco
      
     await StoreCommands.createCustomDomain(id, customDomain, cf.id, cf.status)
      
      // 4️⃣ Retornar ao front
      // O SSL validation será buscado via GET /custom-domain quando necessário
      return reply.send({
        success: true,
        domain: customDomain,
        cloudflareHostnameId: cf.id,
        txt: cf,
        cloudflareStatus: cf.status,
      })
    } catch (error: any) {
      console.error('[StoreController] Error in createCustomDomain:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
        details: error.message,
      })
    }
  },

  async getCloudflareHostnameInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storeId = request.store?.id

      // 1️⃣ Buscar a store para pegar o cloudflareHostnameId
      const store = await StoreQueries.getById(storeId)

      if (!store) {
        return reply.status(404).send({
          error: 'Store not found',
        })
      }
      if (!store.cloudflareHostnameId) {
        return reply.status(404).send({
          error: 'Custom domain not configured',
        })
      }

      // 2️⃣ Buscar informações do hostname no Cloudflare
      let cfInfo: any
      try {
        cfInfo = await getCloudflareHostnameInfo(store.cloudflareHostnameId)
      } catch (error: any) {
        // Se o hostname não foi encontrado (404), limpar dados inválidos do banco
        if (error.statusCode === 404 || error.code === 1436) {
          console.error('[StoreController] Hostname not found in Cloudflare, clearing invalid data:', {
            storeId: store.id,
            cloudflareHostnameId: store.cloudflareHostnameId,
            customDomain: store.customDomain,
          })

          // Limpar o cloudflareHostnameId inválido do banco
          await StoreCommands.createCustomDomain(
            store.id,
            store.customDomain || null,
            null, // cloudflareHostnameId = null
            'not_found' // cloudflareStatus = 'not_found'
          )

          return reply.status(404).send({
            error: 'Custom hostname not found in Cloudflare',
            message: 'The custom hostname was deleted or never existed in Cloudflare. Please recreate it.',
            domain: store.customDomain,
            cloudflareHostnameId: store.cloudflareHostnameId,
          })
        }
        // Re-throw outros erros
        throw error
      }
      
      console.log('[StoreController] Cloudflare hostname info retrieved:', {
        id: cfInfo.id,
        hostname: cfInfo.hostname,
        status: cfInfo.status,
        hasSsl: !!cfInfo.ssl,
        hasValidationRecords: !!cfInfo.ssl?.validation_records,
      })

      // 3️⃣ Extrair registros de validação SSL (TXT)
      const sslValidation = cfInfo.ssl?.validation_records?.[0]

      // 4️⃣ Formatar resposta com o TXT de validação
      const txtName = sslValidation?.txt_name || `_acme-challenge.${store.customDomain}`
      const txtValue = sslValidation?.txt_value || ''

      return reply.send({
        domain: store.customDomain,
        status: cfInfo.status || store.cloudflareStatus,
        validationRecord: sslValidation
          ? {
              name: txtName,
              type: 'TXT',
              value: txtValue,
              // Formato legível para exibir ao usuário
              formatted: `${txtName} TXT ${txtValue}`,
            }
          : null,
        cloudflareInfo: {
          id: cfInfo.id,
          status: cfInfo.status,
          hostname: cfInfo.hostname,
        },
      })
    } catch (error: any) {
      console.error('[StoreController] Error in getCloudflareHostnameInfo:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      })
      request.log.error(error)

      if (error.message?.includes('Cloudflare API error')) {
        return reply.status(500).send({
          error: 'Failed to fetch Cloudflare hostname info',
          details: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
        details: error.message,
      })
    }
  },
}
