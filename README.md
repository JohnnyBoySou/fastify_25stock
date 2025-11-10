# 📦 Sistema de Gestão de Estoque - Fastify API

Uma API robusta para gestão de estoque desenvolvida com **Fastify**, **TypeScript** e **Prisma**, seguindo o padrão **CQRS** com arquitetura funcional.

## 🚀 Tecnologias Principais

### Backend
- **Fastify 5.6.0** - Framework web rápido e eficiente
- **TypeScript 5.8.3** - Tipagem estática para JavaScript
- **Prisma 6.15.0** - ORM moderno para TypeScript
- **PostgreSQL 16** - Banco de dados relacional

### Autenticação & Segurança
- **JWT** - Tokens de autenticação
- **bcrypt** - Hash seguro de senhas
- **FastifySchema** - Validação de schemas JSON

### Observabilidade
- **OpenTelemetry** - Rastreamento distribuído
- **Uptrace** - Monitoramento e observabilidade (opcional)

### Desenvolvimento
- **ESLint** - Linter para qualidade de código
- **tsx** - Execução de TypeScript
- **nodemon** - Hot reload em desenvolvimento

## 🏗️ Arquitetura do Projeto

### Padrão CQRS Funcional
O projeto implementa o padrão **Command Query Responsibility Segregation** com abordagem funcional:

```
src/features/{entity}/
├── commands/
│   └── {entity}.commands.ts    # Operações de escrita (CREATE, UPDATE, DELETE)
├── queries/
│   └── {entity}.queries.ts     # Operações de leitura (GET, LIST, SEARCH)
├── {entity}.controller.ts      # Controller principal (objeto com funções)
├── {entity}.interfaces.ts      # Interfaces TypeScript
├── {entity}.routes.ts          # Definição das rotas
└── {entity}.schema.ts          # Schemas de validação FastifySchema
```

### Estrutura Completa
```
src/
├── features/                   # Features modulares
│   ├── auth/                  # Autenticação e autorização
│   ├── user/                  # Gestão de usuários
│   ├── product/               # Gestão de produtos
│   ├── store/                 # Gestão de lojas
│   ├── supplier/              # Gestão de fornecedores
│   ├── category/              # Gestão de categorias
│   └── movement/              # Movimentações de estoque
├── plugins/                   # Plugins do Fastify
│   ├── prisma.ts             # Plugin do Prisma
│   └── tracing.ts            # Plugin de rastreamento
├── utils/                     # Utilitários
├── types/                     # Tipos TypeScript globais
└── generated/                 # Código gerado pelo Prisma
```

## 🗄️ Modelo de Dados

### Entidades Principais
- **User** - Usuários do sistema com roles e permissões
- **Store** - Lojas/filiais do negócio
- **Product** - Produtos com controle de estoque
- **Supplier** - Fornecedores de produtos
- **Category** - Categorias hierárquicas de produtos
- **Movement** - Movimentações de entrada/saída/perda
- **AuditLog** - Log de auditoria para rastreabilidade

### Relacionamentos
- Usuários podem ter múltiplas lojas (relação many-to-many)
- Produtos pertencem a uma loja, categoria e fornecedor
- Movimentações registram entrada/saída de produtos
- Sistema de auditoria completa para todas as operações

## 🔧 Configuração e Instalação

### Pré-requisitos
- **Node.js 22.x** ou **Bun >=1.0.0** (recomendado)
- **PostgreSQL 16**
- **pnpm** (recomendado) ou npm ou bun

### Instalação

#### Com Bun (Recomendado - Mais rápido)
```bash
# Clone o repositório
git clone <repository-url>
cd fastify_20stock

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
bunx prisma migrate dev

# Inicie o servidor de desenvolvimento
bun dev
```

#### Com Node.js
```bash
# Clone o repositório
git clone <repository-url>
cd fastify_20stock

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
pnpm prisma migrate dev

# Inicie o servidor de desenvolvimento
pnpm dev:node
```

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://fastify_user:fastify_pass@localhost:5432/fastify_db"
JWT_SECRET="sua_chave_secreta_muito_forte_aqui"
NODE_ENV="development"
```

### Docker (Opcional)
```bash
# Inicie o PostgreSQL com Docker
docker-compose up -d postgres

# Para incluir o Uptrace (observabilidade)
docker-compose up -d
```

## 🚀 Scripts Disponíveis

### Com Bun (Recomendado)
```bash
# Desenvolvimento
bun dev                 # Servidor com hot reload (Bun)
bun start               # Servidor de produção (Bun)
bun typecheck           # Verificação de tipos

# Qualidade de código
bun lint                # Verificar problemas de lint
bun lint:fix            # Corrigir problemas automaticamente

# Features
bun create-feature      # Gerar nova feature com estrutura CQRS
```

### Com Node.js
```bash
# Desenvolvimento
pnpm dev:node           # Servidor com hot reload (Node.js)
pnpm start:node         # Servidor de produção (Node.js)
pnpm typecheck          # Verificação de tipos

# Qualidade de código
pnpm lint               # Verificar problemas de lint
pnpm lint:fix           # Corrigir problemas automaticamente

# Features
pnpm create-feature:node # Gerar nova feature com estrutura CQRS
```

> **💡 Dica**: O Bun oferece performance superior e execução nativa de TypeScript, sendo até 3x mais rápido que Node.js para desenvolvimento.

## 📡 Endpoints da API

### Autenticação (`/auth`)
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `POST /auth/logout` - Fazer logout
- `POST /auth/forgot-password` - Solicitar reset de senha
- `POST /auth/reset-password` - Resetar senha

### Usuários (`/users`)
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário por ID
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Produtos (`/products`)
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `GET /products/:id` - Buscar produto por ID
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Deletar produto
- `GET /products/search` - Buscar produtos
- `GET /products/stats` - Estatísticas de produtos

### Lojas (`/stores`)
- `GET /stores` - Listar lojas
- `POST /stores` - Criar loja
- `GET /stores/:id` - Buscar loja por ID
- `PUT /stores/:id` - Atualizar loja
- `DELETE /stores/:id` - Deletar loja

### Fornecedores (`/suppliers`)
- `GET /suppliers` - Listar fornecedores
- `POST /suppliers` - Criar fornecedor
- `GET /suppliers/:id` - Buscar fornecedor por ID
- `PUT /suppliers/:id` - Atualizar fornecedor
- `DELETE /suppliers/:id` - Deletar fornecedor

### Categorias (`/categories`)
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria
- `GET /categories/:id` - Buscar categoria por ID
- `PUT /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Deletar categoria

### Movimentações (`/movements`)
- `GET /movements` - Listar movimentações
- `POST /movements` - Registrar movimentação
- `GET /movements/:id` - Buscar movimentação por ID
- `GET /movements/product/:productId` - Movimentações de um produto
- `GET /movements/stats` - Estatísticas de movimentações

## 🔒 Segurança

### Recursos Implementados
- ✅ Autenticação JWT com expiração
- ✅ Hash seguro de senhas com bcrypt
- ✅ Validação de dados com FastifySchema
- ✅ Sistema de roles e permissões
- ✅ Logs de auditoria completos
- ✅ Proteção contra SQL injection (Prisma)
- ✅ Validação de entrada em todas as rotas

### Próximas Implementações
- 📧 Serviço de email para notificações
- 🔒 Rate limiting para proteção contra ataques
- 🔐 Autenticação de dois fatores (2FA)
- 📱 Refresh token rotation
- 🛡️ CORS e headers de segurança

## 🎯 Padrões e Convenções

### Padrão CQRS Funcional
- **Controllers**: Objetos com funções (nunca classes)
- **Commands**: Operações de escrita (classes para encapsular Prisma)
- **Queries**: Operações de leitura (classes para encapsular Prisma)
- **Separation of Concerns**: Lógica separada por responsabilidade

### Nomenclatura
- **Entidades**: Singular em inglês (User, Product, Store)
- **Funções**: Concisas (create, get, list, update, delete)
- **Arquivos**: Seguem padrão `{entity}.{type}.ts`

### Qualidade de Código
- **ESLint**: Configurado com regras TypeScript rigorosas
- **TypeScript**: Tipagem estática em todo o projeto
- **Validação**: Schemas FastifySchema para entrada e saída
- **Error Handling**: Tratamento consistente de erros

## 📊 Observabilidade

### Rastreamento (OpenTelemetry)
- Instrumentação automática de requisições
- Rastreamento distribuído de operações
- Métricas de performance e latência
- Logs estruturados com contexto

### Monitoramento (Uptrace - Opcional)
- Dashboard de métricas em tempo real
- Alertas automáticos
- Análise de performance
- Rastreamento de erros

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
