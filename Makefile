.PHONY: help dev dev-up dev-down dev-logs prod prod-up prod-down prod-logs \
        install dev-local dev-backend dev-frontend \
        test test-backend test-frontend lint clean status

# Help
help:
	@echo ""
	@echo "Easy Gen App - Available Commands"
	@echo ""
	@echo "Development (Docker with hot reload):"
	@echo "  make dev            Start all services"
	@echo "  make dev-down       Stop services"
	@echo "  make dev-logs       View logs"
	@echo ""
	@echo "Production (Docker):"
	@echo "  make prod           Build and start"
	@echo "  make prod-down      Stop services"
	@echo "  make prod-logs      View logs"
	@echo ""
	@echo "Local Development (no Docker for app):"
	@echo "  make install        Install dependencies"
	@echo "  make dev-local      Start MongoDB only"
	@echo "  make dev-backend    Run backend (port 3001)"
	@echo "  make dev-frontend   Run frontend (port 5173)"
	@echo ""
	@echo "Testing:"
	@echo "  make test           Run all tests"
	@echo "  make test-backend   Run backend tests"
	@echo "  make test-frontend  Run frontend tests"
	@echo "  make lint           Run ESLint"
	@echo ""
	@echo "Utility:"
	@echo "  make clean          Remove containers and volumes"
	@echo "  make status         Show container status"
	@echo "  make shell-db       Open MongoDB shell"
	@echo ""

# Docker Development
dev: dev-up
	@echo ""
	@echo "Development environment started"
	@echo ""
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:3001"
	@echo "  Swagger:  http://localhost:3001/api/docs"
	@echo "  MongoDB:  mongodb://localhost:27017"
	@echo ""

dev-up:
	@echo "Starting development environment..."
	docker compose -f docker/docker-compose.dev.yml --env-file .env.development up -d --build

dev-down:
	@echo "Stopping development environment..."
	docker compose -f docker/docker-compose.dev.yml --env-file .env.development down

dev-logs:
	docker compose -f docker/docker-compose.dev.yml --env-file .env.development logs -f

dev-logs-backend:
	docker compose -f docker/docker-compose.dev.yml --env-file .env.development logs -f backend

dev-logs-frontend:
	docker compose -f docker/docker-compose.dev.yml --env-file .env.development logs -f frontend

# Docker Production
prod: prod-check prod-up
	@echo ""
	@echo "Production environment started"
	@echo ""
	@echo "  Application: http://localhost"
	@echo "  API:         http://localhost/api"
	@echo ""

prod-check:
	@if [ ! -f .env.production ]; then \
		echo "Error: .env.production not found"; \
		echo "Copy .env.production.example to .env.production and fill in values."; \
		exit 1; \
	fi

prod-up:
	@echo "Starting production environment..."
	docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d --build

prod-down:
	@echo "Stopping production environment..."
	docker compose -f docker/docker-compose.prod.yml down

prod-logs:
	docker compose -f docker/docker-compose.prod.yml logs -f

# Local Development
install:
	@echo "Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install
	@echo "Done"

dev-local:
	@echo "Starting MongoDB..."
	docker compose -f docker/docker-compose.dev.yml --env-file .env.development up -d mongodb
	@echo ""
	@echo "MongoDB ready at localhost:27017"
	@echo ""
	@echo "Run in separate terminals:"
	@echo "  make dev-backend"
	@echo "  make dev-frontend"
	@echo ""

dev-backend:
	@echo "Starting backend..."
	cd backend && MONGODB_URI=mongodb://localhost:27017/easy-gen-app npm run start:dev

dev-frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

# Testing
test: test-backend test-frontend
	@echo "All tests passed"

test-backend:
	@echo "Running backend tests..."
	docker run --rm -v $(PWD)/backend:/app -w /app node:20-alpine sh -c "npm install --silent && npm test"

test-frontend:
	@echo "Running frontend tests..."
	docker run --rm -v $(PWD)/frontend:/app -w /app node:20-alpine sh -c "npm install --silent && npm test"

test-cov:
	@echo "Running backend tests with coverage..."
	docker run --rm -v $(PWD)/backend:/app -w /app node:20-alpine sh -c "npm install --silent && npm run test:cov"

lint:
	@echo "Running ESLint..."
	docker run --rm -v $(PWD)/frontend:/app -w /app node:20-alpine sh -c "npm install --silent && npm run lint"

# Utility
clean:
	@echo "Cleaning up..."
	docker compose -f docker/docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
	docker compose -f docker/docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
	@echo "Done"

status:
	@echo "Development containers:"
	@docker compose -f docker/docker-compose.dev.yml ps 2>/dev/null || echo "  Not running"
	@echo ""
	@echo "Production containers:"
	@docker compose -f docker/docker-compose.prod.yml ps 2>/dev/null || echo "  Not running"

shell-db:
	docker compose -f docker/docker-compose.dev.yml --env-file .env.development exec mongodb mongosh -u easygen -p easygen_dev_password --authenticationDatabase admin easy-gen-app

shell-backend:
	docker compose -f docker/docker-compose.dev.yml exec backend sh

shell-frontend:
	docker compose -f docker/docker-compose.dev.yml exec frontend sh
