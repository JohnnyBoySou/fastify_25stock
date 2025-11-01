# Use Node.js 22 Alpine como base (menor tamanho)
FROM node:22-alpine AS base

# Instalar dependências necessárias para o Alpine
RUN apk add --no-cache libc6-compat

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json pnpm-lock.yaml* ./

# Instalar pnpm globalmente
RUN npm install -g pnpm

# ================================
# STAGE 1: Dependencies
# ================================
FROM base AS deps

# Instalar dependências de produção
RUN pnpm install --no-frozen-lockfile --prod

# ================================
# STAGE 2: Build
# ================================
FROM base AS builder

# Configurar variáveis de ambiente para o Prisma gerar a engine correta
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x"

# Copiar código fonte ANTES de instalar dependências
# Isso garante que o schema.prisma esteja disponível
COPY prisma ./prisma

# Instalar todas as dependências (dev + prod)
RUN pnpm install --no-frozen-lockfile

# Copiar o resto do código fonte
COPY . .

# Gerar cliente Prisma com o engine correto para Alpine Linux (irá para src/generated/prisma)
RUN pnpm exec prisma generate && \
    echo "=== Verificando Prisma gerado no builder ===" && \
    ls -la /app/src/generated/prisma/ 2>/dev/null && \
    echo "=== Verificando engines no builder ===" && \
    ls -la /app/src/generated/prisma/*.so.node 2>/dev/null || \
    ls -la /app/src/generated/prisma/libquery* 2>/dev/null || \
    echo "WARNING: Engines não encontradas no builder!"

# Compilar TypeScript
RUN pnpm run build

# ================================
# STAGE 3: Production
# ================================
FROM node:22-alpine AS runner

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

# Verificar se o Prisma foi copiado corretamente
RUN echo "=== Verificando Prisma copiado para produção ===" && \
    ls -la /app/src/generated/prisma/ 2>/dev/null && \
    echo "=== Verificando engines Alpine ===" && \
    ls -la /app/src/generated/prisma/*.so.node 2>/dev/null || \
    ls -la /app/src/generated/prisma/libquery* 2>/dev/null || \
    echo "WARNING: Engines não encontradas!"

# Configurar variáveis de ambiente para o Prisma encontrar o engine no output customizado
ENV PRISMA_QUERY_ENGINE_LIBRARY="/app/src/generated/prisma/libquery_engine-linux-musl-openssl-3.0.x.so.node"
ENV PRISMA_QUERY_ENGINE_BINARY="/app/src/generated/prisma/query-engine-linux-musl-openssl-3.0.x"

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
