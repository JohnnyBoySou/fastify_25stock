# Use Bun como base (menor tamanho e mais rápido)
FROM oven/bun:1-alpine AS base

# Instalar dependências necessárias para o Alpine
RUN apk add --no-cache libc6-compat openssl openssl-dev

# Criar usuário não-root para segurança (uma vez, reutilizado)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

# Configurar diretório de trabalho
WORKDIR /app

# ================================
# STAGE 1: Dependencies
# ================================
FROM base AS deps

# Copiar arquivos de dependências
COPY package.json bun.lockb* ./

# Instalar dependências de produção (com cache mount para acelerar builds)
RUN --mount=type=cache,id=bun-cache-prod,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

# ================================
# STAGE 2: Build
# ================================
FROM base AS builder

# Copiar arquivos de dependências primeiro (melhor cache)
COPY package.json bun.lockb* ./

# Instalar todas as dependências (dev + prod) primeiro (com cache mount)
RUN --mount=type=cache,id=bun-cache-dev,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copiar schema do Prisma (necessário para generate)
COPY prisma ./prisma

# Gerar cliente Prisma com o engine correto para Alpine Linux
RUN bunx prisma generate

# Copiar o resto do código fonte (após instalar deps e gerar Prisma)
COPY . .

# Compilar TypeScript
RUN bun run build

# ================================
# STAGE 3: Production
# ================================
FROM base AS runner

# Mudar para usuário não-root ANTES de copiar arquivos
USER fastify

# Copiar dependências de produção do stage deps com permissões corretas
COPY --from=deps --chown=fastify:nodejs /app/node_modules ./node_modules

# Copiar código compilado do builder com permissões corretas
COPY --from=builder --chown=fastify:nodejs /app/dist ./dist

# Copiar o diretório gerado do Prisma com permissões corretas
COPY --from=builder --chown=fastify:nodejs /app/src/generated ./src/generated

# Copiar package.json com permissões corretas
COPY --chown=fastify:nodejs package.json ./

# Expor porta
EXPOSE 3000

# Configurar variáveis de ambiente
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Comando de inicialização
CMD ["node", "dist/server.js"]
