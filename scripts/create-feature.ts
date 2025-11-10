#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import readline from "readline";
import inquirer from "inquirer";

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
function lowerize(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function selectModel(models: PrismaModel[]): Promise<PrismaModel> {
  const choices = models.map((model, index) => ({
    name: `${model.name} (${model.fields.length} campos)`,
    value: model,
    short: model.name
  }));

  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Selecione o modelo do Prisma:',
      choices,
      pageSize: 10,
      loop: false
    }
  ]);

  return selectedModel;
}

interface PrismaField {
  name: string;
  type: string;
  isOptional: boolean;
  isArray: boolean;
  isRelation: boolean;
  relationModel?: string;
}

interface PrismaModel {
  name: string;
  fields: PrismaField[];
}

function parsePrismaSchema(schemaPath: string): PrismaModel[] {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const models: PrismaModel[] = [];
  
  // Regex para encontrar modelos
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let match;
  
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    const fields: PrismaField[] = [];
    
    // Regex para encontrar campos
    const fieldRegex = /(\w+)\s+([^@\n]+)(?:@[^@\n]*)?/g;
    let fieldMatch;
    
    while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
      const fieldName = fieldMatch[1].trim();
      const fieldType = fieldMatch[2].trim();
      
      // Pular linhas vazias e comentários
      if (!fieldName || fieldName.startsWith('//') || fieldName.startsWith('/*')) {
        continue;
      }
      
      // Verificar se é opcional
      const isOptional = fieldType.includes('?');
      
      // Verificar se é array
      const isArray = fieldType.includes('[]');
      
      // Verificar se é relação
      const isRelation = /[A-Z]\w+/.test(fieldType) && !fieldType.includes('@');
      
      // Extrair tipo base
      let baseType = fieldType.replace(/\?/g, '').replace(/\[\]/g, '').trim();
      
      // Se for relação, extrair o modelo relacionado
      let relationModel: string | undefined;
      if (isRelation) {
        relationModel = baseType;
        baseType = 'string'; // IDs de relação são sempre string
      }
      
      fields.push({
        name: fieldName,
        type: baseType,
        isOptional,
        isArray,
        isRelation,
        relationModel
      });
    }
    
    models.push({
      name: modelName,
      fields
    });
  }
  
  return models;
}

function getTypeScriptType(prismaType: string): string {
  const typeMap: { [key: string]: string } = {
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Decimal': 'number',
    'Boolean': 'boolean',
    'DateTime': 'Date',
    'Json': 'any',
    'BigInt': 'bigint',
    'Bytes': 'Buffer'
  };
  
  return typeMap[prismaType] || 'string';
}

function generateInterfaces(model: PrismaModel): string {
  const modelName = model.name;
  const fields = model.fields;
  
  // Interface para criação (sem campos obrigatórios do sistema)
  const createFields = fields
    .filter(field => 
      !['id', 'createdAt', 'updatedAt'].includes(field.name) && 
      !field.isRelation
    )
    .map(field => {
      const tsType = getTypeScriptType(field.type);
      const optional = field.isOptional ? '?' : '';
      return `  ${field.name}${optional}: ${tsType}${field.isArray ? '[]' : ''}`;
    });
  
  // Interface para atualização (todos os campos opcionais)
  const updateFields = fields
    .filter(field => 
      !['id', 'createdAt', 'updatedAt'].includes(field.name) && 
      !field.isRelation
    )
    .map(field => {
      const tsType = getTypeScriptType(field.type);
      return `  ${field.name}?: ${tsType}${field.isArray ? '[]' : ''}`;
    });
  
  // Interface para resposta completa
  const responseFields = fields
    .filter(field => !field.isRelation)
    .map(field => {
      const tsType = getTypeScriptType(field.type);
      const optional = field.isOptional ? '?' : '';
      return `  ${field.name}${optional}: ${tsType}${field.isArray ? '[]' : ''}`;
    });
  
  return `// Interfaces para ${modelName}
export interface Create${modelName}Request {
${createFields.join('\n')}
}

export interface Update${modelName}Request {
${updateFields.join('\n')}
}

export interface Get${modelName}Request {
  Params: { id: string }
}

export interface List${modelName}sRequest {
  Querystring: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
  }
}

export interface Delete${modelName}Request {
  Params: { id: string }
}

export interface ${modelName}Response {
${responseFields.join('\n')}
}`;
}

function generateSchemas(model: PrismaModel): string {
  const modelName = model.name;
  const fields = model.fields;
  
  // Campos para criação (sem campos obrigatórios do sistema)
  const createFields = fields
    .filter(field => 
      !['id', 'createdAt', 'updatedAt'].includes(field.name) && 
      !field.isRelation
    )
    .map(field => {
      const tsType = getTypeScriptType(field.type);
      let jsonSchemaType = '';
      
      switch (tsType) {
        case 'string':
          jsonSchemaType = '{ type: \'string\' }';
          break;
        case 'number':
          jsonSchemaType = '{ type: \'number\' }';
          break;
        case 'boolean':
          jsonSchemaType = '{ type: \'boolean\' }';
          break;
        case 'Date':
          jsonSchemaType = '{ type: \'string\', format: \'date-time\' }';
          break;
        case 'any':
          jsonSchemaType = '{ type: \'object\' }';
          break;
        default:
          jsonSchemaType = '{ type: \'string\' }';
      }
      
      if (field.isArray) {
        jsonSchemaType = `{ type: 'array', items: ${jsonSchemaType} }`;
      }
      
      return `      ${field.name}: ${jsonSchemaType}`;
    });

  const requiredFields = fields
    .filter(field => 
      !['id', 'createdAt', 'updatedAt'].includes(field.name) && 
      !field.isRelation && 
      !field.isOptional
    )
    .map(field => field.name);

  // Campos para atualização (todos opcionais)
  const updateFields = fields
    .filter(field => 
      !['id', 'createdAt', 'updatedAt'].includes(field.name) && 
      !field.isRelation
    )
    .map(field => {
      const tsType = getTypeScriptType(field.type);
      let jsonSchemaType = '';
      
      switch (tsType) {
        case 'string':
          jsonSchemaType = '{ type: \'string\' }';
          break;
        case 'number':
          jsonSchemaType = '{ type: \'number\' }';
          break;
        case 'boolean':
          jsonSchemaType = '{ type: \'boolean\' }';
          break;
        case 'Date':
          jsonSchemaType = '{ type: \'string\', format: \'date-time\' }';
          break;
        case 'any':
          jsonSchemaType = '{ type: \'object\' }';
          break;
        default:
          jsonSchemaType = '{ type: \'string\' }';
      }
      
      if (field.isArray) {
        jsonSchemaType = `{ type: 'array', items: ${jsonSchemaType} }`;
      }
      
      return `      ${field.name}: ${jsonSchemaType}`;
    });
  
  return `import { FastifySchema } from 'fastify';

export const create${modelName}Schema: FastifySchema = {
  body: {
    type: 'object',
    required: [${requiredFields.map(f => `'${f}'`).join(', ')}],
    properties: {
${createFields.join('\n')}
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

export const update${modelName}Schema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  body: {
    type: 'object',
    properties: {
${updateFields.join('\n')}
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

export const get${modelName}Schema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

export const list${modelName}sSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      status: { type: 'boolean' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  }
};

export const delete${modelName}Schema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  response: {
    204: { type: 'null' },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

export const ${modelName}Schemas = {
  create: create${modelName}Schema,
  update: update${modelName}Schema,
  get: get${modelName}Schema,
  delete: delete${modelName}Schema,
  list: list${modelName}sSchema
};`;
}

function generateCommands(model: PrismaModel): string {
  const modelName = model.name;
  const entity = modelName.toLowerCase();
  
  return `export const ${modelName}Commands = {
  async create(prisma: any, data: any) {
    return await prisma.${entity}.create({ data })
  },

  async update(prisma: any, id: string, data: any) {
    return await prisma.${entity}.update({ 
      where: { id }, 
      data 
    })
  },

  async delete(prisma: any, id: string) {
    return await prisma.${entity}.delete({ 
      where: { id } 
    })
  },

  async updateStatus(prisma: any, id: string, status: boolean) {
    return await prisma.${entity}.update({
      where: { id },
      data: { status }
    })
  }
}`;
}

function generateQueries(model: PrismaModel): string {
  const modelName = model.name;
  const entity = modelName.toLowerCase();
  
  // Encontrar campos de texto para busca
  const textFields = model.fields
    .filter(field => 
      field.type === 'String' && 
      !['id', 'createdAt', 'updatedAt'].includes(field.name)
    )
    .map(field => field.name);
  
  const searchFields = textFields.length > 0 
    ? textFields.map(field => `${field}: { contains: term, mode: 'insensitive' }`).join(', ')
    : 'name: { contains: term, mode: "insensitive" }';
  
  return `export const ${modelName}Queries = {
  async getById(prisma: any, id: string) {
    return await prisma.${entity}.findUnique({ 
      where: { id } 
    })
  },

  async list(prisma: any, params: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
  }) {
    const { page = 1, limit = 10, search, status } = params
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status !== undefined) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        ${textFields.map(field => `{ ${field}: { contains: search, mode: 'insensitive' } }`).join(',\n        ')}
      ]
    }

    const [items, total] = await Promise.all([
      prisma.${entity}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.${entity}.count({ where })
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  async search(prisma: any, term: string, limit: number = 10) {
    return await prisma.${entity}.findMany({
      where: {
        OR: [
          ${textFields.map(field => `{ ${field}: { contains: term, mode: 'insensitive' } }`).join(',\n          ')}
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  },

  async getActive(prisma: any) {
    return await prisma.${entity}.findMany({
      where: { status: true },
      orderBy: { createdAt: 'desc' }
    })
  },

  async getStats(prisma: any) {
    const [total, active, inactive] = await Promise.all([
      prisma.${entity}.count(),
      prisma.${entity}.count({ where: { status: true } }),
      prisma.${entity}.count({ where: { status: false } })
    ])

    return {
      total,
      active,
      inactive
    }
  }
}`;
}

function generateController(model: PrismaModel): string {
  const modelName = model.name;
  const entity = modelName.toLowerCase();
  
  return `import { FastifyRequest, FastifyReply } from 'fastify'
import { ${modelName}Commands } from './commands/${entity}.commands'
import { ${modelName}Queries } from './queries/${entity}.queries'
import {
  Create${modelName}Request,
  Get${modelName}Request,
  Update${modelName}Request,
  Delete${modelName}Request,
  List${modelName}sRequest
} from './${entity}.interfaces'

export const ${modelName}Controller = {
  // === CRUD BÁSICO ===
  async create(request: Create${modelName}Request, reply: FastifyReply) {
    try {
  
      const result = await ${modelName}Commands.create(request.body)

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)
      
      if (error.message === 'Specific error message') {
        return reply.status(400).send({
          error: error.message
        })
      }

      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  async get(request: Get${modelName}Request, reply: FastifyReply) {
    try {
      const { id } = request.params
      const prisma = (request.server as any).prisma

      const result = await ${modelName}Queries.getById(prisma, id)

      if (!result) {
        return reply.status(404).send({
          error: '${modelName} not found'
        })
      }

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)
      
      if (error.message === '${modelName} not found') {
        return reply.status(404).send({
          error: error.message
        })
      }

      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  async update(request: Update${modelName}Request, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }
      const prisma = (request.server as any).prisma

      const result = await ${modelName}Commands.update(prisma, id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)
      
      if (error.message === '${modelName} not found') {
        return reply.status(404).send({
          error: error.message
        })
      }

      if (error.message === 'Validation error') {
        return reply.status(400).send({
          error: error.message
        })
      }

      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  async delete(request: Delete${modelName}Request, reply: FastifyReply) {
    try {
      const { id } = request.params
      const prisma = (request.server as any).prisma

      await ${modelName}Commands.delete(prisma, id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)
      
      if (error.message === '${modelName} not found') {
        return reply.status(404).send({
          error: error.message
        })
      }

      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  async list(request: List${modelName}sRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status } = request.query
      const prisma = (request.server as any).prisma

      const result = await ${modelName}Queries.list(prisma, {
        page,
        limit,
        search,
        status
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (QUERIES) ===
  async getActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const prisma = (request.server as any).prisma

      const result = await ${modelName}Queries.getActive(prisma)

      return reply.send({ ${entity}s: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const prisma = (request.server as any).prisma

      const result = await ${modelName}Queries.getStats(prisma)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  async search(request: FastifyRequest<{ Querystring: { q: string; limit?: number } }>, reply: FastifyReply) {
    try {
      const { q, limit = 10 } = request.query
      const prisma = (request.server as any).prisma

      const result = await ${modelName}Queries.search(prisma, q, limit)

      return reply.send({ ${entity}s: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async updateStatus(request: FastifyRequest<{ Params: { id: string }; Body: { status: boolean } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const { status } = request.body
      const prisma = (request.server as any).prisma

      const result = await ${modelName}Commands.updateStatus(prisma, id, status)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)
      
      if (error.message === '${modelName} not found') {
        return reply.status(404).send({
          error: error.message
        })
      }

      return reply.status(500).send({
        error: 'Internal server error'
      })
    }
  }
}`;
}

function generateRoutes(model: PrismaModel): string {
  const modelName = model.name;
  const entity = modelName.toLowerCase();
  
  return `import { FastifyInstance } from 'fastify'
import { ${modelName}Controller } from './${entity}.controller'
import { ${modelName}Schemas } from './${entity}.schema'

export async function ${modelName}Routes(fastify: FastifyInstance) {
  // CRUD básico
  fastify.post('/', {
    schema: ${modelName}Schemas.create,
    handler: ${modelName}Controller.create
  })

  fastify.get('/', {
    schema: ${modelName}Schemas.list,
    handler: ${modelName}Controller.list
  })

  fastify.get('/:id', {
    schema: ${modelName}Schemas.get,
    handler: ${modelName}Controller.get
  })

  fastify.put('/:id', {
    schema: ${modelName}Schemas.update,
    handler: ${modelName}Controller.update
  })

  fastify.delete('/:id', {
    schema: ${modelName}Schemas.delete,
    handler: ${modelName}Controller.delete
  })

  // Funções adicionais
  fastify.get('/active', {
    handler: ${modelName}Controller.getActive
  })

  fastify.get('/stats', {
    handler: ${modelName}Controller.getStats
  })

  fastify.get('/search', {
    handler: ${modelName}Controller.search
  })

  fastify.patch('/:id/status', {
    handler: ${modelName}Controller.updateStatus
  })
}`;
}

async function main() {
  let entityArg = process.argv[2];
  let modelArg = process.argv[3];

  // Se não tiver argumento, pergunta ao usuário
  if (!entityArg) {
    entityArg = await ask("Digite o nome da feature: ");
    if (!entityArg) {
      console.error("❌ Nenhuma feature fornecida.");
      process.exit(1);
    }
  }

  // Carregar modelos do Prisma
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  if (!fs.existsSync(schemaPath)) {
    console.error("❌ Schema do Prisma não encontrado em: prisma/schema.prisma");
    process.exit(1);
  }

  const models = parsePrismaSchema(schemaPath);
  const modelNames = models.map(m => m.name);

  let selectedModel: PrismaModel;

  // Se não tiver argumento do modelo, usa menu interativo
  if (!modelArg) {
    console.log("\n📋 Selecionando modelo do Prisma...");
    selectedModel = await selectModel(models);
  } else {
    // Verificar se o modelo existe
    const foundModel = models.find(m => m.name.toLowerCase() === modelArg.toLowerCase());
    if (!foundModel) {
      console.error(`❌ Modelo '${modelArg}' não encontrado no schema do Prisma.`);
      console.error("Modelos disponíveis:", modelNames.join(", "));
      process.exit(1);
    }
    selectedModel = foundModel;
  }

  const Entity = capitalize(entityArg);
  const entity = lowerize(entityArg);

  console.log(`\n🎯 Criando feature '${Entity}' baseada no modelo '${selectedModel.name}'`);
  console.log(`📊 Campos encontrados: ${selectedModel.fields.length}`);

  const featureDir = path.join(process.cwd(), "src", "features", entity);

  function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  function writeFile(filePath: string, content: string) {
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  File already exists: ${filePath}`);
      return;
    }
    fs.writeFileSync(filePath, content);
  }

  // Criar diretórios
  ensureDir(featureDir);
  ensureDir(path.join(featureDir, "commands"));
  ensureDir(path.join(featureDir, "queries"));

  // commands
  writeFile(
    path.join(featureDir, "commands", `${entity}.commands.ts`),
    generateCommands(selectedModel)
  );

  // queries
  writeFile(
    path.join(featureDir, "queries", `${entity}.queries.ts`),
    generateQueries(selectedModel)
  );

  // controller
  writeFile(
    path.join(featureDir, `${entity}.controller.ts`),
    generateController(selectedModel)
  );

  // routes
  writeFile(
    path.join(featureDir, `${entity}.routes.ts`),
    generateRoutes(selectedModel)
  );

  // interfaces
  writeFile(
    path.join(featureDir, `${entity}.interfaces.ts`),
    generateInterfaces(selectedModel)
  );

  // schema
  writeFile(
    path.join(featureDir, `${entity}.schema.ts`),
    generateSchemas(selectedModel)
  );

  console.log(`🎉 Feature '${Entity}' criada com sucesso!`);
}

main();
