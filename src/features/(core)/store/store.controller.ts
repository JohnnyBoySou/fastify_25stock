import type { FastifyReply, FastifyRequest } from 'fastify'
import { StoreCommands } from './commands/store.commands'
import { StoreQueries } from './queries/store.queries'
import type {
  CreateStoreRequest,
  DeleteStoreRequest,
  GetStoreRequest,
  UpdateStoreRequest,
} from './store.interfaces'
import dns from 'node:dns/promises'
import { createCloudflareCustomHostname, getCloudflareHostnameInfo } from '@/plugins/cloudflare'

async function validateDomain(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveCname(domain)
    console.log(records)
    return records.some((r) => r.includes('app.25stock.com'))
  } catch (e: any) {
    // Trata erros DNS (ENOTFOUND, ETIMEDOUT, etc.)
    if (e.code === 'ENOTFOUND' || e.code === 'ETIMEDOUT' || e.code === 'ESERVFAIL') {
      console.log(`DNS error for domain ${domain}:`, e.code)
      return false
    }
    // Para outros erros, também retorna false mas loga o erro completo
    console.log(`Error validating domain ${domain}:`, e)
    return false
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

  async verifyDns(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { domain } = request.body as { domain: string }
      const isValid = await validateDomain(domain)
      return reply.send({ isValid })
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
      console.log('cf', cf)

      if (!cf.id) {
        return reply.status(500).send({
          error: 'Failed to create custom hostname',
          details: 'Cloudflare API did not return a hostname ID',
        })
      }

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
          console.error(
            '[StoreController] Hostname not found in Cloudflare, clearing invalid data:',
            {
              storeId: store.id,
              cloudflareHostnameId: store.cloudflareHostnameId,
              customDomain: store.customDomain,
            }
          )

          // Limpar o cloudflareHostnameId inválido do banco
          await StoreCommands.createCustomDomain(
            store.id,
            store.customDomain || null,
            null, // cloudflareHostnameId = null
            'not_found' // cloudflareStatus = 'not_found'
          )

          return reply.status(404).send({
            error: 'Custom hostname not found in Cloudflare',
            message:
              'The custom hostname was deleted or never existed in Cloudflare. Please recreate it.',
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
        sslStatus: cfInfo.ssl?.status,
        sslMethod: cfInfo.ssl?.method,
        sslType: cfInfo.ssl?.type,
        hasValidationRecords: !!cfInfo.ssl?.validation_records,
        validationRecordsCount: cfInfo.ssl?.validation_records?.length || 0,
        sslKeys: cfInfo.ssl ? Object.keys(cfInfo.ssl) : [],
        fullSsl: JSON.stringify(cfInfo.ssl, null, 2),
      })

      // 3️⃣ Extrair registros de validação SSL (TXT)
      // Quando o SSL está ativo, os registros podem não estar mais disponíveis
      const sslValidation = cfInfo.ssl?.validation_records?.[0]

      // Se não houver validation_records, verificar se há outros campos com dados de validação
      let txtName = sslValidation?.txt_name
      let txtValue = sslValidation?.txt_value

      // Se o status é "active", pode ser que o certificado já foi validado
      // e os registros de validação não estão mais disponíveis
      if (!sslValidation && cfInfo.status === 'active') {
        console.log(
          '[StoreController] SSL is active but no validation records found - certificate already validated'
        )
      }

      // 4️⃣ Formatar resposta com o TXT de validação
      txtName = txtName || `_acme-challenge.${store.customDomain}`
      txtValue = txtValue || ''

      return reply.send({
        domain: store.customDomain,
        status: cfInfo.status || store.cloudflareStatus,
        validationRecord:
          sslValidation && txtValue
            ? {
                name: txtName,
                type: 'TXT',
                value: txtValue,
                // Formato legível para exibir ao usuário
                formatted: `${txtName} TXT ${txtValue}`,
              }
            : null,
        sslInfo: {
          status: cfInfo.ssl?.status,
          method: cfInfo.ssl?.method,
          type: cfInfo.ssl?.type,
          // Se o SSL está ativo, não há mais registros de validação necessários
          needsValidation: cfInfo.status !== 'active' && !sslValidation,
        },
        cloudflareInfo: {
          id: cfInfo.id,
          status: cfInfo.status,
          hostname: cfInfo.hostname,
        },
        message:
          cfInfo.status === 'active'
            ? 'SSL certificate is active. No validation records needed.'
            : sslValidation
              ? 'Please add the TXT record to your DNS to validate the SSL certificate.'
              : 'Waiting for SSL validation records to be generated.',
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

  async verifySslCertificate(request: FastifyRequest, reply: FastifyReply) {
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
          message: 'No custom domain has been configured for this store.',
        })
      }

      // 2️⃣ Buscar informações do hostname no Cloudflare
      let cfInfo: any
      try {
        cfInfo = await getCloudflareHostnameInfo(store.cloudflareHostnameId)
      } catch (error: any) {
        // Se o hostname não foi encontrado (404), limpar dados inválidos do banco
        if (error.statusCode === 404 || error.code === 1436) {
          console.error(
            '[StoreController] Hostname not found in Cloudflare during SSL verification:',
            {
              storeId: store.id,
              cloudflareHostnameId: store.cloudflareHostnameId,
              customDomain: store.customDomain,
            }
          )

          // Limpar o cloudflareHostnameId inválido do banco
          await StoreCommands.createCustomDomain(
            store.id,
            store.customDomain || null,
            null, // cloudflareHostnameId = null
            'not_found' // cloudflareStatus = 'not_found'
          )

          return reply.status(404).send({
            error: 'Custom hostname not found in Cloudflare',
            message:
              'The custom hostname was deleted or never existed in Cloudflare. Please recreate it.',
            isValid: false,
          })
        }
        // Re-throw outros erros
        throw error
      }

      // 3️⃣ Verificar o status do certificado SSL
      const hostnameStatus = cfInfo.status // 'active', 'pending_validation', 'pending_deployment', etc.
      const sslStatus = cfInfo.ssl?.status // 'active', 'pending_validation', 'pending_issuance', etc.

      // O certificado está validado quando o status do hostname é 'active'
      const isCertificateValid = hostnameStatus === 'active'

      // 4️⃣ Atualizar o status no banco de dados se mudou
      if (store.cloudflareStatus !== hostnameStatus) {
        await StoreCommands.createCustomDomain(
          store.id,
          store.customDomain || null,
          store.cloudflareHostnameId,
          hostnameStatus
        )
        console.log('[StoreController] Updated cloudflareStatus in database:', {
          storeId: store.id,
          oldStatus: store.cloudflareStatus,
          newStatus: hostnameStatus,
        })
      }

      // 5️⃣ Preparar resposta detalhada
      const response = {
        isValid: isCertificateValid,
        domain: store.customDomain,
        hostnameStatus,
        sslStatus,
        sslMethod: cfInfo.ssl?.method,
        sslType: cfInfo.ssl?.type,
        cloudflareHostnameId: cfInfo.id,
        message: isCertificateValid
          ? 'SSL certificate is active and validated successfully.'
          : hostnameStatus === 'pending_validation'
            ? 'SSL certificate is pending validation. Please add the TXT record to your DNS.'
            : hostnameStatus === 'pending_deployment'
              ? 'SSL certificate is validated but pending deployment.'
              : `SSL certificate status: ${hostnameStatus}`,
        // Informações adicionais para debug
        details: {
          hostname: cfInfo.hostname,
          createdAt: cfInfo.created_at,
          sslValidationRecords: cfInfo.ssl?.validation_records || [],
        },
      }

      console.log('[StoreController] SSL certificate verification result:', {
        storeId: store.id,
        domain: store.customDomain,
        isValid: isCertificateValid,
        hostnameStatus,
        sslStatus,
      })

      return reply.send(response)
    } catch (error: any) {
      console.error('[StoreController] Error in verifySslCertificate:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      })
      request.log.error(error)

      if (error.message?.includes('Cloudflare API error')) {
        return reply.status(500).send({
          error: 'Failed to verify SSL certificate',
          details: error.message,
          isValid: false,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
        details: error.message,
        isValid: false,
      })
    }
  },
}
