# Makefile para gerenciar o projeto Fastify

.PHONY: help build up down dev logs clean migrate

# Variáveis
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml

# Ajuda
help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Produção
build: ## Constrói a imagem Docker
	docker-compose -f $(COMPOSE_FILE) build

up: ## Inicia os serviços em produção
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Para os serviços em produção
	docker-compose -f $(COMPOSE_FILE) down

logs: ## Mostra os logs dos serviços
	docker-compose -f $(COMPOSE_FILE) logs -f

# Desenvolvimento
dev-build: ## Constrói a imagem Docker para desenvolvimento
	docker-compose -f $(COMPOSE_DEV_FILE) build

dev-up: ## Inicia os serviços em desenvolvimento
	docker-compose -f $(COMPOSE_DEV_FILE) up -d

dev-down: ## Para os serviços em desenvolvimento
	docker-compose -f $(COMPOSE_DEV_FILE) down

dev-logs: ## Mostra os logs dos serviços em desenvolvimento
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

# Banco de dados
migrate: ## Executa as migrações do Prisma
	docker-compose -f $(COMPOSE_FILE) exec app npx prisma migrate deploy

migrate-dev: ## Executa as migrações do Prisma em desenvolvimento
	docker-compose -f $(COMPOSE_DEV_FILE) exec app-dev npx prisma migrate deploy

# Limpeza
clean: ## Remove containers, volumes e imagens
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	docker-compose -f $(COMPOSE_DEV_FILE) down -v --rmi all

# Status
status: ## Mostra o status dos containers
	docker-compose -f $(COMPOSE_FILE) ps
	docker-compose -f $(COMPOSE_DEV_FILE) ps

# Testes
test: ## Executa os testes
	docker-compose -f $(COMPOSE_FILE) exec app npm test

# Linting
lint: ## Executa o linting
	docker-compose -f $(COMPOSE_FILE) exec app npm run lint

# Restart
restart: ## Reinicia os serviços
	docker-compose -f $(COMPOSE_FILE) restart

restart-dev: ## Reinicia os serviços em desenvolvimento
	docker-compose -f $(COMPOSE_DEV_FILE) restart
