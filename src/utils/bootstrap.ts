import os from 'node:os'
import chalk from 'chalk'
import type { FastifyInstance } from 'fastify'
import ora, { type Ora } from 'ora'

export interface BootstrapStep {
  name: string
  action: () => Promise<void> | void
  optional?: boolean
}

class BootstrapUI {
  private spinner: Ora | null = null
  private steps: BootstrapStep[] = []
  private currentStep = 0
  private startTime = Date.now()
  private logMode = false
  private logBuffer: string[] = []
  private maxLogLines = 50
  private renderTimeout: NodeJS.Timeout | null = null
  private originalConsoleLog: typeof console.log | null = null
  private originalConsoleError: typeof console.error | null = null
  private originalConsoleWarn: typeof console.warn | null = null
  private originalConsoleInfo: typeof console.info | null = null
  private keyListener: (() => void) | null = null
  private fastifyInstance: FastifyInstance | null = null
  private hooksSetup = false
  private requestStartTimes = new Map<string, number>()

  private colors = {
    primary: chalk.cyanBright,
    success: chalk.greenBright,
    error: chalk.redBright,
    warning: chalk.yellowBright,
    info: chalk.blueBright,
    dim: chalk.dim,
  }

  private formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
    }

    const colors = {
      info: this.colors.info,
      success: this.colors.success,
      error: this.colors.error,
      warning: this.colors.warning,
    }

    console.log(`${icons[type]} ${colors[type](message)}`)
  }

  async executeStep(step: BootstrapStep): Promise<boolean> {
    const startTime = Date.now()
    this.currentStep++

    const stepLabel = `${this.currentStep}/${this.steps.length}`
    const prefix = this.colors.dim(`[${stepLabel}]`)

    this.spinner = ora({
      text: `${prefix} ${this.colors.primary(step.name)}...`,
      spinner: 'dots',
      color: 'cyan',
    }).start()

    try {
      await step.action()
      const duration = Date.now() - startTime
      this.spinner.succeed(
        `${prefix} ${this.colors.success(step.name)} ${this.colors.dim(`(${this.formatTime(duration)})`)}`
      )
      return true
    } catch (error: any) {
      const duration = Date.now() - startTime
      if (step.optional) {
        this.spinner.warn(
          `${prefix} ${this.colors.warning(step.name)} ${this.colors.dim(`(opcional - ${this.formatTime(duration)})`)}`
        )
        return true
      }
      this.spinner.fail(
        `${prefix} ${this.colors.error(step.name)} ${this.colors.dim(`(${this.formatTime(duration)})`)}`
      )
      this.log(`Erro: ${error.message}`, 'error')
      return false
    } finally {
      this.spinner = null
    }
  }

  async run(steps: BootstrapStep[]): Promise<boolean> {
    this.steps = steps
    this.currentStep = 0
    this.startTime = Date.now()

    // Header
    console.log('\n')
    console.log(
      this.colors.primary('╔═══════════════════════════════════════════════════════════╗')
    )
    console.log(
      this.colors.primary('║') +
        this.colors.info('           Iniciando Servidor Fastify') +
        this.colors.primary('                      ║')
    )
    console.log(
      this.colors.primary('╚═══════════════════════════════════════════════════════════╝')
    )
    console.log('')

    // Execute steps
    for (const step of steps) {
      const success = await this.executeStep(step)
      if (!success && !step.optional) {
        return false
      }
    }

    const totalTime = Date.now() - this.startTime
    console.log('')
    this.log(
      `Colocando o servidor em execução concluído em ${this.formatTime(totalTime)}`,
      'success'
    )
    console.log('')

    return true
  }

  setupFastifyHooks(fastify: FastifyInstance) {
    // Configurar hooks do Fastify ANTES de iniciar o servidor
    // Evitar configurar múltiplas vezes
    if (this.hooksSetup) {
      return
    }

    this.hooksSetup = true
    this.fastifyInstance = fastify
    const requestId = () => `${Date.now()}-${Math.random()}`

    fastify.addHook('onRequest', async (request) => {
      const id = requestId()
      ;(request as any).__logId = id
      this.requestStartTimes.set(id, Date.now())

      // Sempre capturar no buffer, mas só renderizar se estiver em modo de logs
      const timestamp = new Date().toISOString()
      const method = request.method
      const url = request.url
      this.addLog(`[${timestamp}] ${method} ${url}`, 'info', this.logMode)
    })

    fastify.addHook('onResponse', async (request, reply) => {
      const id = (request as any).__logId
      const startTime = this.requestStartTimes.get(id || '')

      if (startTime) {
        const timestamp = new Date().toISOString()
        const method = request.method
        const url = request.url
        const statusCode = reply.statusCode
        const responseTime = Date.now() - startTime
        this.requestStartTimes.delete(id || '')

        // Sempre capturar no buffer
        this.addLog(
          `[${timestamp}] ${method} ${url} ${statusCode} ${responseTime.toFixed(2)}ms`,
          statusCode >= 400 ? 'error' : 'info',
          this.logMode
        )
      }
    })
  }

  private setupConsoleInterception() {
    // Evitar configurar múltiplas vezes
    if (this.originalConsoleLog !== null) {
      return
    }

    // Salvar funções originais
    this.originalConsoleLog = console.log
    this.originalConsoleError = console.error
    this.originalConsoleWarn = console.warn
    this.originalConsoleInfo = console.info

    // Interceptar console.log
    console.log = (...args: any[]) => {
      // Sempre capturar no buffer
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ')
      this.addLog(message, 'log', false) // false = não renderizar agora

      // Se não estiver em modo de logs, mostrar normalmente
      if (!this.logMode) {
        this.originalConsoleLog?.apply(console, args)
      }
    }

    // Interceptar console.error
    console.error = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ')
      this.addLog(message, 'error', false)

      if (!this.logMode) {
        this.originalConsoleError?.apply(console, args)
      }
    }

    // Interceptar console.warn
    console.warn = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ')
      this.addLog(message, 'warn', false)

      if (!this.logMode) {
        this.originalConsoleWarn?.apply(console, args)
      }
    }

    // Interceptar console.info
    console.info = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ')
      this.addLog(message, 'info', false)

      if (!this.logMode) {
        this.originalConsoleInfo?.apply(console, args)
      }
    }
  }

  private restoreConsole() {
    if (this.originalConsoleLog) console.log = this.originalConsoleLog
    if (this.originalConsoleError) console.error = this.originalConsoleError
    if (this.originalConsoleWarn) console.warn = this.originalConsoleWarn
    if (this.originalConsoleInfo) console.info = this.originalConsoleInfo
  }

  private addLog(
    message: string,
    type: 'log' | 'error' | 'warn' | 'info' = 'log',
    shouldRender = true
  ) {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    const colors = {
      log: this.colors.info,
      error: this.colors.error,
      warn: this.colors.warning,
      info: this.colors.info,
    }

    const coloredMessage = `[${timestamp}] ${colors[type](message)}`
    this.logBuffer.push(coloredMessage)

    // Manter apenas as últimas N linhas
    if (this.logBuffer.length > this.maxLogLines) {
      this.logBuffer.shift()
    }

    // Atualizar tela se estiver em modo de logs e shouldRender for true
    // Usar debounce para evitar renderizações excessivas
    if (this.logMode && shouldRender) {
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout)
      }
      this.renderTimeout = setTimeout(() => {
        this.renderLogs()
        this.renderTimeout = null
      }, 50) // Debounce de 50ms
    }
  }

  private clearScreen() {
    process.stdout.write('\x1b[2J')
    process.stdout.write('\x1b[0f')
  }

  private renderLogs() {
    this.clearScreen()

    // Header
    console.log('')
    console.log(
      this.colors.primary('╔═══════════════════════════════════════════════════════════╗')
    )
    console.log(
      `${this.colors.primary('║')}${this.colors.info('              📋 Logs em Tempo Real')}${this.colors.primary('                     ║')}`
    )
    console.log(
      this.colors.primary('╠═══════════════════════════════════════════════════════════╣')
    )
    console.log(
      `${this.colors.primary('║')}  ${this.colors.dim('Pressione L para voltar à visualização normal')}${this.colors.primary('  ║')}`
    )
    console.log(
      this.colors.primary('╠═══════════════════════════════════════════════════════════╣')
    )
    console.log('')

    // Mostrar logs (últimas linhas do buffer)
    const logsToShow = this.logBuffer.slice(-this.maxLogLines)
    if (logsToShow.length === 0) {
      console.log(this.colors.dim('  Aguardando logs...'))
    } else {
      for (const log of logsToShow) {
        console.log(`  ${log}`)
      }
    }

    console.log('')
    console.log(
      this.colors.primary('╠═══════════════════════════════════════════════════════════╣')
    )
    console.log(
      `${this.colors.primary('║')}  ${this.colors.dim('Total de logs:')} ${this.colors.info(String(this.logBuffer.length))}${this.colors.primary('                                 ║')}`
    )
    console.log(
      this.colors.primary('╚═══════════════════════════════════════════════════════════╝')
    )
  }

  private setupKeyboardListener() {
    // Configurar stdin para modo raw (captura teclas sem Enter)
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.setEncoding('utf8')

      this.keyListener = () => {
        process.stdin.on('data', (key: string) => {
          // Ctrl+C para sair
          if (key === '\u0003') {
            this.restoreConsole()
            process.exit(0)
          }

          // Tecla 'l' ou 'L' para alternar modo de logs
          if (key === 'l' || key === 'L') {
            this.toggleLogMode()
          }
        })
      }

      this.keyListener()
    }
  }

  private toggleLogMode() {
    this.logMode = !this.logMode

    if (this.logMode) {
      // Entrar no modo de logs
      // Limpar qualquer timeout pendente e renderizar imediatamente
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout)
        this.renderTimeout = null
      }
      this.renderLogs()
    } else {
      // Voltar para visualização normal
      // Limpar timeout pendente
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout)
        this.renderTimeout = null
      }
      this.clearScreen()
      // Reexibir informações do servidor
      if (this.fastifyInstance) {
        const port = Number(process.env.PORT) || 3000
        const host = '0.0.0.0'
        this.showServerInfo(this.fastifyInstance, port, host)
      }
    }
  }

  showServerInfo(fastify: FastifyInstance, port: number, host: string) {
    this.fastifyInstance = fastify

    // Configurar listener de teclado e interceptação de console
    if (!this.keyListener) {
      this.setupKeyboardListener()
      this.setupConsoleInterception()
    }

    // Obter endereços de rede
    const networkInterfaces = os.networkInterfaces()
    const addresses: string[] = []

    // Coletar endereços IPv4
    for (const netInterface of Object.values(networkInterfaces)) {
      if (netInterface) {
        for (const iface of netInterface) {
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address)
          }
        }
      }
    }

    // Remover duplicatas
    const uniqueAddresses = Array.from(new Set(addresses))

    console.log('')
    console.log(
      this.colors.primary('╔═══════════════════════════════════════════════════════════╗')
    )
    console.log(
      `${this.colors.primary('║')}${this.colors.success('              ✅ Servidor em Execução')}${this.colors.primary('                      ║')}`
    )
    console.log(
      this.colors.primary('╠═══════════════════════════════════════════════════════════╣')
    )

    // Local URL
    const localUrl = `http://127.0.0.1:${port}`
    const localPadding = ' '.repeat(Math.max(0, 47 - localUrl.length))
    console.log(
      `${this.colors.primary('║')}  ${this.colors.info('Local:')}    ${this.colors.success(localUrl)}${localPadding}${this.colors.primary('║')}`
    )

    // Main URL (0.0.0.0 mostra como rede)
    if (host === '0.0.0.0') {
      const networkUrl = `http://${host}:${port}`
      const networkPadding = ' '.repeat(Math.max(0, 47 - networkUrl.length))
      console.log(
        `${this.colors.primary('║')}  ${this.colors.info('Rede:')}     ${this.colors.success(networkUrl)}${networkPadding}${this.colors.primary('║')}`
      )
    }

    // Additional network addresses (máximo 3 para não poluir)
    for (const addr of uniqueAddresses.slice(0, 3)) {
      const url = `http://${addr}:${port}`
      const padding = ' '.repeat(Math.max(0, 47 - url.length))
      console.log(
        `${this.colors.primary('║')}  ${this.colors.info('Rede:')}     ${this.colors.success(url)}${padding}${this.colors.primary('║')}`
      )
    }

    console.log(
      this.colors.primary('╠═══════════════════════════════════════════════════════════╣')
    )
    const healthUrl = `http://127.0.0.1:${port}/health`
    const healthPadding = ' '.repeat(Math.max(0, 23 - '/health'.length))
    console.log(
      `${this.colors.primary('║')}  ${this.colors.dim('Healthcheck:')} ${this.colors.info(healthUrl)}${healthPadding}${this.colors.primary('║')}`
    )
    console.log(
      this.colors.primary('╚═══════════════════════════════════════════════════════════╝')
    )
    console.log('')
    console.log(this.colors.dim('Pressione Ctrl+C para encerrar o servidor'))
    console.log(this.colors.dim('Pressione L para visualizar logs em tempo real'))
    console.log('')
  }

  showError(message: string, error?: any) {
    console.log('')
    this.log(message, 'error')
    if (error) {
      console.log(this.colors.error(error.stack || error.message))
    }
    console.log('')
  }
}

export const bootstrapUI = new BootstrapUI()
