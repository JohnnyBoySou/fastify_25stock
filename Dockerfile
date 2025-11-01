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

# Copiar código fonte ANTES de instalar dependências
# Isso garante que o schema.prisma esteja disponível
COPY prisma ./prisma

# Instalar todas as dependências (dev + prod)
RUN pnpm install --no-frozen-lockfile

# Copiar o resto do código fonte
COPY . .

# Gerar cliente Prisma com o engine correto para Alpine Linux
# Forçar geração no local correto
RUN pnpm exec prisma generate

# Compilar TypeScript
RUN pnpm run build

# Verificar onde o Prisma foi gerado
RUN echo "=== Verificando localização do Prisma gerado ===" && \
    find /app -name ".prisma" -type d 2>/dev/null && \
    echo "=== Listando conteúdo do .prisma ===" && \
    find /app -path "*/.prisma/client" -type d -exec ls -la {} \; 2>/dev/null || true

# ================================
# STAGE 3: Production
# ================================
FROM node:22-alpine AS runner

# Instalar dependências necessárias para o Alpine
RUN apk add --no-cache libc6-compat openssl openssl-dev

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Configurar diretório de trabalho
WORKDIR /app

# Copiar package.json e pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml* ./

# Copiar schema do Prisma ANTES de instalar dependências
COPY --from=builder /app/prisma ./prisma

# Instalar APENAS dependências de produção e gerar Prisma
# Isso garante que o Prisma seja gerado corretamente no ambiente final
RUN pnpm install --prod --no-frozen-lockfile && \
    pnpm exec prisma generate && \
    echo "=== Prisma gerado no runner ===" && \
    ls -la /app/node_modules/.prisma 2>/dev/null || echo "Tentando localizar .prisma..." && \
    find /app -name ".prisma" -type d 2>/dev/null

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Configurar variáveis de ambiente para o Prisma encontrar o engine
ENV PRISMA_QUERY_ENGINE_LIBRARY="/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node"
ENV PRISMA_QUERY_ENGINE_BINARY="/app/node_modules/.prisma/client/query-engine-linux-musl-openssl-3.0.x"

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
