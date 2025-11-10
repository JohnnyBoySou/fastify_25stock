import fs from 'node:fs'
import path from 'node:path'

/**
 * Script para consolidar todos os arquivos .prisma do diretório prisma/
 * em um único arquivo schema.prisma
 */

const PRISMA_DIR = path.join(__dirname, '..', 'prisma')
const OUTPUT_FILE = path.join(PRISMA_DIR, 'schema.prisma')

// Ordem dos arquivos baseada nas dependências
const FILE_ORDER = [
  'schema.prisma', // arquivo base (começa com generator e datasource)
  'user.prisma',
  'store.prisma',
  'product.prisma',
  'category.prisma',
  'supplier.prisma',
  'movement.prisma',
  'billing.prisma',
  'quote.prisma',
  'notification.prisma',
  'audit.prisma',
  'media.prisma',
  'roadmap.prisma',
  'crm.prisma',
  'flow.prisma',
  'chat.prisma',
]

function generateSchema() {
  console.log('🔄 Consolidando arquivos .prisma...\n')

  let schemaContent = ''
  let baseContent = ''
  let modelsContent = ''
  let fileCount = 0

  // Primeiro, pega o arquivo base (schema.prisma)
  const basePath = path.join(PRISMA_DIR, 'schema.prisma')
  if (fs.existsSync(basePath)) {
    baseContent = fs.readFileSync(basePath, 'utf-8')
    // Remove models se existirem no arquivo base
    baseContent = baseContent.split('\n').filter(line => {
      const trimmed = line.trim()
      return !trimmed.startsWith('model ') && !trimmed.startsWith('enum ')
    }).join('\n')
    console.log('✓ Lido: schema.prisma (base)')
    fileCount++
  }

  // Depois, processa os outros arquivos na ordem
  for (const filename of FILE_ORDER) {
    // Pula o arquivo base, já foi processado
    if (filename === 'schema.prisma') {
      continue
    }

    const filePath = path.join(PRISMA_DIR, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Não encontrado: ${filename}`)
      continue
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    
    // Remove comentários de inicio que já foram adicionados
    const cleanContent = content.trim()
    
    modelsContent += `\n// ========== ${filename} ==========\n${cleanContent}\n\n`
    
    console.log(`✓ Lido: ${filename}`)
    fileCount++
  }

  // Monta o arquivo final
  schemaContent = baseContent + modelsContent

  // Salva o arquivo
  fs.writeFileSync(OUTPUT_FILE, schemaContent, 'utf-8')
  
  console.log(`   Arquivos processados: ${fileCount}`)
  console.log(`   Arquivo gerado: ${OUTPUT_FILE}\n`)
}

try {
  generateSchema()
} catch (error) {
  console.error('❌ Erro ao gerar schema:', error.message)
  process.exit(1)
}

