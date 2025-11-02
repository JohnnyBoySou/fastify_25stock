# Use Bun como base (menor tamanho e mais rápido)
FROM oven/bun:1-alpine AS base

# Instalar dependências necessárias para o Alpine
RUN apk add --no-cache libc6-compat openssl openssl-dev

# Configurar diretório de trabalho
WORKDIR /app

# ================================
# STAGE 1: Dependencies
# ================================
FROM base AS deps

# Copiar arquivos de dependências
COPY package.json bun.lockb* ./

# Instalar dependências de produção
RUN bun install --frozen-lockfile --production

# ================================
# STAGE 2: Build
# ================================
FROM base AS builder

# Copiar código fonte ANTES de instalar dependências
# Isso garante que o schema.prisma esteja disponível
COPY prisma ./prisma

# Copiar arquivos de dependências
COPY package.json bun.lockb* ./

# Instalar todas as dependências (dev + prod)
RUN bun install --frozen-lockfile

# Copiar o resto do código fonte
COPY . .

# Gerar cliente Prisma com o engine correto para Alpine Linux
RUN bun exec prisma generate

# Compilar TypeScript
RUN bun run build

# ================================
# STAGE 3: Production
# ================================
FROM oven/bun:1-alpine AS runner

# Instalar dependências necessárias para o Alpine
RUN apk add --no-cache libc6-compat openssl openssl-dev

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Configurar diretório de trabalho
WORKDIR /app

# Copiar dependências de produção do stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copiar código compilado do builder
COPY --from=builder /app/dist ./dist

# Copiar o diretório gerado do Prisma (com engines corretas para Alpine)
COPY --from=builder /app/src/generated ./src/generated

# Copiar package.json
COPY package.json ./

# Configurar permissões
RUN chown -R fastify:nodejs /app

# Mudar para usuário não-root
USER fastify

# Expor porta
EXPOSE 3000

# Configurar variáveis de ambiente
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Comando de inicialização
CMD ["node", "dist/server.js"]
