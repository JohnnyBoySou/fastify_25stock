import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

// === CONFIGURAÇÕES ===
// Usar STORAGE_PATH se definido (volume montado), senão usar o padrão
const STORAGE_PATH = process.env.STORAGE_PATH || '/uploads'
const UPLOAD_DIR = STORAGE_PATH.startsWith('/')
  ? STORAGE_PATH // Caminho absoluto (volume montado)
  : path.join(process.cwd(), STORAGE_PATH) // Caminho relativo ao projeto
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]

// === INTERFACES ===
export interface UploadedFile {
  fieldname: string
  filename: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  destination: string
  path: string
  url: string
}

export interface UploadResult {
  id: string
  url: string
  name: string
  type: string
  size: number
  path: string
}

export interface UploadConfig {
  entityType?: 'product' | 'supplier' | 'user' | 'store' | 'general'
  userId?: string
  maxFiles?: number
  allowedTypes?: string[]
  maxFileSize?: number
}

// === SERVIÇO DE UPLOAD ===
export class UploadService {
  private static instance: UploadService
  private uploadDir: string

  constructor() {
    this.uploadDir = UPLOAD_DIR
    console.log(`[UploadService] Diretório de upload configurado: ${this.uploadDir}`)
    console.log(`[UploadService] STORAGE_PATH: ${process.env.STORAGE_PATH || 'não definido (usando padrão)'}`)
    // Inicialização assíncrona não bloqueante - diretórios serão criados quando necessário
    this.ensureUploadDirectories().catch((error) => {
      console.error('[UploadService] Erro na inicialização de diretórios:', error.message)
      // Não lançar erro aqui - os diretórios serão criados de forma lazy quando necessário
    })
  }

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService()
    }
    return UploadService.instance
  }

  // === INICIALIZAÇÃO ===
  private async ensureUploadDirectories() {
    // Apenas logar o diretório configurado - não criar nada
    // O volume já deve estar montado e os diretórios já devem existir
    console.log(`[UploadService] Diretório de upload configurado: ${UPLOAD_DIR}`)
    console.log('[UploadService] Os diretórios devem já existir no volume montado')
  }

  // === OBTER CAMINHO DO DIRETÓRIO DO USUÁRIO ===
  private getUserDirectoryPath(userId: string): string {
    // Apenas construir o caminho - o diretório já deve existir no volume
    return path.join(UPLOAD_DIR, 'users', userId)
  }

  // === VALIDAÇÃO ===
  private validateFile(file: UploadedFile, config: UploadConfig = {}): void {
    const allowedTypes = config.allowedTypes || ALLOWED_TYPES
    const maxFileSize = config.maxFileSize || MAX_FILE_SIZE

    // Validar tipo
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.mimetype}`)
    }

    // Validar tamanho
    if (file.size > maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo permitido: ${maxFileSize / 1024 / 1024}MB`)
    }
  }

  // === GERAR NOME ÚNICO ===
  private generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName)
    const name = path.basename(originalName, ext)
    const uuid = randomUUID()
    return `${name}-${uuid}${ext}`
  }

  // === UPLOAD ÚNICO ===
  async uploadSingle(file: UploadedFile, config: UploadConfig = {}): Promise<UploadResult> {
    try {
      // Validar arquivo
      this.validateFile(file, config)

      // Validar se o path do arquivo existe
      if (!file.path || typeof file.path !== 'string') {
        throw new Error('Caminho do arquivo inválido ou não fornecido')
      }

      // Verificar se o arquivo temporário existe
      try {
        await fs.access(file.path)
      } catch (error) {
        throw new Error(`Arquivo temporário não encontrado: ${file.path} ${error}`)
      }

      // Determinar diretório de destino
      const entityType = config.entityType || 'general'
      let destinationDir: string
      let publicUrl: string

      if (config.userId) {
        // Usar estrutura organizada por usuário: uploads/users/userId/entityType/
        const userDir = this.getUserDirectoryPath(config.userId)
        destinationDir = path.join(userDir, entityType)
        publicUrl = `/uploads/users/${config.userId}/${entityType}`
      } else {
        // Estrutura tradicional: uploads/entityType/
        destinationDir = path.join(this.uploadDir, entityType)
        publicUrl = `/uploads/${entityType}`
      }

      // Gerar nome único
      const uniqueFilename = this.generateUniqueFilename(file.originalname)
      const destination = path.join(destinationDir, uniqueFilename)

      // Salvar arquivo diretamente - o diretório já deve existir no volume montado
      try {
        await fs.copyFile(file.path, destination)
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          throw new Error(
            `Diretório não existe: ${destinationDir}. Certifique-se de que o volume está montado corretamente no Railway.`
          )
        }
        
        if (error.code === 'EACCES') {
          throw new Error(
            `Sem permissão para escrever em ${destinationDir}. Verifique as permissões do volume montado.`
          )
        }
        
        throw error
      }

      // Completar URL pública
      publicUrl = `${publicUrl}/${uniqueFilename}`

      // Criar resultado
      const result: UploadResult = {
        id: randomUUID(),
        url: publicUrl,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        path: destination,
      }

      return result
    } catch (error) {
      throw new Error(`Erro no upload: ${error.message}`)
    }
  }

  // === UPLOAD MÚLTIPLOS ===
  async uploadMultiple(files: UploadedFile[], config: UploadConfig = {}): Promise<UploadResult[]> {
    const maxFiles = config.maxFiles || 10

    if (files.length > maxFiles) {
      throw new Error(`Máximo de ${maxFiles} arquivos permitidos`)
    }

    const results: UploadResult[] = []

    for (const file of files) {
      try {
        const result = await this.uploadSingle(file, config)
        results.push(result)
      } catch (error) {
        // Se um arquivo falhar, deletar os que já foram salvos
        await this.cleanupFailedUploads(results)
        throw error
      }
    }

    return results
  }

  // === LIMPEZA DE ARQUIVOS FALHADOS ===
  private async cleanupFailedUploads(uploadedFiles: UploadResult[]): Promise<void> {
    for (const file of uploadedFiles) {
      try {
        await fs.unlink(file.path)
      } catch (error) {
        console.error(`Erro ao deletar arquivo ${file.path}:`, error)
      }
    }
  }

  // === DELETAR ARQUIVO ===
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`)
    }
  }

  // === DELETAR MÚLTIPLOS ARQUIVOS ===
  async deleteMultipleFiles(filePaths: string[]): Promise<{ deleted: number; failed: number }> {
    let deleted = 0
    let failed = 0

    for (const filePath of filePaths) {
      try {
        await this.deleteFile(filePath)
        deleted++
      } catch (error) {
        failed++
        console.error(`Erro ao deletar ${filePath}:`, error)
      }
    }

    return { deleted, failed }
  }

  // === OBTER INFORMAÇÕES DO ARQUIVO ===
  async getFileInfo(filePath: string): Promise<{ exists: boolean; size?: number; stats?: any }> {
    try {
      const stats = await fs.stat(filePath)
      return {
        exists: true,
        size: stats.size,
        stats,
      }
    } catch (error) {
      console.error(error)
      return { exists: false }
    }
  }

  // === LISTAR ARQUIVOS DE UMA ENTIDADE ===
  async listEntityFiles(entityType: string): Promise<string[]> {
    try {
      const entityDir = path.join(this.uploadDir, entityType)
      const files = await fs.readdir(entityDir)
      return files.filter((file) => {
        const filePath = path.join(entityDir, file)
        const stats = fs.stat(filePath)
        return stats.then((s) => s.isFile()).catch(() => false)
      })
    } catch (error) {
      console.error(error)
      throw new Error(`Erro ao listar arquivos da entidade: ${error.message}`)
    }
  }

  // === LIMPEZA DE ARQUIVOS ÓRFÃOS ===
  async cleanupOrphanedFiles(
    usedFilePaths: string[]
  ): Promise<{ deleted: number; failed: number }> {
    const allFiles: string[] = []

    // Coletar todos os arquivos
    const directories = ['product', 'supplier', 'user', 'store', 'general']
    for (const dir of directories) {
      const files = await this.listEntityFiles(dir)
      allFiles.push(...files.map((file) => path.join(this.uploadDir, dir, file)))
    }

    // Encontrar arquivos órfãos
    const orphanedFiles = allFiles.filter((file) => !usedFilePaths.includes(file))

    // Deletar arquivos órfãos
    return await this.deleteMultipleFiles(orphanedFiles)
  }

  // === OBTER ESTATÍSTICAS ===
  async getStats(): Promise<{
    totalFiles: number
    totalSize: number
    byEntityType: Record<string, { count: number; size: number }>
    byFileType: Record<string, number>
  }> {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      byEntityType: {} as Record<string, { count: number; size: number }>,
      byFileType: {} as Record<string, number>,
    }

    const directories = ['product', 'supplier', 'user', 'store', 'general']

    for (const dir of directories) {
      const files = await this.listEntityFiles(dir)
      let dirSize = 0

      for (const file of files) {
        const filePath = path.join(this.uploadDir, dir, file)
        const fileInfo = await this.getFileInfo(filePath)

        if (fileInfo.exists && fileInfo.size) {
          dirSize += fileInfo.size
          stats.totalSize += fileInfo.size
          stats.totalFiles++

          // Contar por tipo de arquivo
          const ext = path.extname(file).toLowerCase()
          stats.byFileType[ext] = (stats.byFileType[ext] || 0) + 1
        }
      }

      stats.byEntityType[dir] = {
        count: files.length,
        size: dirSize,
      }
    }

    return stats
  }

  // === UTILITÁRIOS ===

  // Verificar se é imagem
  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/')
  }

  // Verificar se é vídeo
  isVideo(mimetype: string): boolean {
    return mimetype.startsWith('video/')
  }

  // Verificar se é documento
  isDocument(mimetype: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]
    return documentTypes.includes(mimetype)
  }

  // Formatar tamanho do arquivo
  formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`
  }

  // Obter ícone baseado no tipo
  getUploadDir(): string {
    return this.uploadDir
  }

  getFileIcon(mimetype: string): string {
    if (mimetype.startsWith('image/')) return '🖼️'
    if (mimetype.startsWith('video/')) return '🎥'
    if (mimetype.startsWith('audio/')) return '🎵'
    if (mimetype === 'application/pdf') return '📕'
    if (mimetype.includes('word')) return '📝'
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊'
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️'
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦'
    return '📄'
  }
}

// === EXPORTAR INSTÂNCIA SINGLETON ===
export const uploadService = UploadService.getInstance()
