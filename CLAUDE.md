# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Express Bun API is a photo package management system ("foto pack") built with Express.js running on Bun runtime, using TypeScript and following Hexagonal Architecture (Ports and Adapters pattern). The system handles user accounts, photo packages, orders, and photo uploads to AWS S3.

**Runtime**: Bun v1.2.21
**Database**: MySQL (via Prisma ORM)
**Storage**: AWS S3
**Architecture**: Hexagonal (Clean Architecture)

## Essential Commands

### Development
```bash
# Install dependencies
bun install

# Start development server with watch mode
bun run dev

# Start production server
bun run start

# Build the application
bun run build

# Run tests
bun run test
```

### Database
```bash
# Start MySQL with Docker
docker compose up -d

# Apply Prisma migrations
bunx prisma db push

# Generate Prisma client
bunx prisma generate

# Open Prisma Studio (database GUI)
bunx prisma studio

# Access phpMyAdmin (if running)
# http://localhost:8080
```

## Architecture

The codebase follows Hexagonal Architecture with clear separation of concerns:

```
src/
├── domain/          # Business entities and port interfaces
│   ├── entities/    # Domain models (Usuario, Pedido, Paquete, etc.)
│   └── ports/       # Repository interfaces (.port.ts files)
├── application/     # Use cases (business logic orchestration)
│   └── use-cases/   # One file per use case (crear-usuario, login, etc.)
├── infrastructure/  # External adapters and frameworks
│   ├── repositories/  # Prisma repository implementations
│   ├── controllers/   # Express route handlers
│   ├── routes/        # Express route definitions
│   ├── services/      # External services (S3, etc.)
│   ├── config/        # Configuration (Swagger, auth, etc.)
│   ├── database/      # Prisma client initialization
│   └── server/        # Express app setup
└── shared/          # Shared utilities
```

### Key Architectural Patterns

1. **Repository Pattern**: Domain defines port interfaces (`*.repository.port.ts`), infrastructure provides Prisma implementations (`prisma-*.repository.ts`)

2. **Use Case Pattern**: Each business operation is a separate use case class in `application/use-cases/`. Use cases orchestrate domain entities and repository ports.

3. **Dependency Flow**:
   - Routes → Controllers → Use Cases → Repository Ports
   - Infrastructure depends on Domain, not vice versa
   - Use `@domain/*`, `@application/*`, `@infrastructure/*` path aliases

4. **Entity Mapping**: Repositories use `toDomain()` and `toPrisma()` methods to convert between Prisma models and domain entities

## User Type System

The application has a special user type system where the base `usuarios` table is extended through relationships:

- **CLIENTE**: Base user (default)
- **ADMIN**: User with `administradores` relation (nivel_acceso: 1)
- **SUPER_ADMIN**: User with `administradores` relation (nivel_acceso: 2)
- **VENDEDOR_VENTANILLA**: User with `stores` relation (codigo_empleado)

When creating users through repositories:
- The user type is determined by checking related tables during reads
- Creating ADMIN/SUPER_ADMIN automatically creates an `administradores` record
- Creating VENDEDOR_VENTANILLA automatically creates a `stores` record

## Database Schema

Key tables:
- `usuarios`: Base user table (email, password_hash, nombre, apellido)
- `direcciones`: User shipping addresses
- `categorias`: Product categories
- `paquetes_predefinidos`: Predefined photo packages
- `pedidos`: Orders (with Stripe integration fields)
- `items_pedido`: Order line items
- `fotos`: Uploaded photos (stored in S3)
- `administradores`: Admin users (extends usuarios with nivel_acceso)
- `stores`: Window seller users (extends usuarios with codigo_empleado)
- `tipo_paquete`: Package type definitions
- `estados_pedido`: Order status definitions
- `calendario_fotos`: Calendar photos mapping (for photo calendar products)

## Environment Configuration

Required `.env` variables:
- `DATABASE_URL`: MySQL connection string
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `S3_BUCKET_NAME`: S3 bucket for photo storage
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT token generation (defaults to 'default_secret_key_for_dev' if not set)
- `JWT_EXPIRES_IN`: Token expiration time (default: '24h', supports formats like '1h', '7d', '60m')
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for verifying webhook events

## API Documentation

Swagger UI available at: `http://localhost:3001/api-docs`

All API routes are under `/api` prefix except general routes (`/`, `/health`).

Routes are configured in `infrastructure/routes/index.ts` which imports individual route modules.

## Development Workflow

1. **Adding a new feature**:
   - Create domain entity in `domain/entities/`
   - Create port interface in `domain/ports/`
   - Create Prisma repository in `infrastructure/repositories/`
   - Create use case in `application/use-cases/`
   - Create controller in `infrastructure/controllers/`
   - Create routes in `infrastructure/routes/`
   - Add route to `infrastructure/routes/index.ts`

2. **Database changes**:
   - Modify `prisma/schema.prisma`
   - Run `bunx prisma db push` (development)
   - Update domain entities to match
   - Update repository mappers (`toDomain`/`toPrisma`)

3. **File uploads**: Use Multer middleware, then S3Service for storage (`infrastructure/services/s3.service.ts`)

4. **Payment Processing**:
   - Use `StripeService` (`infrastructure/services/stripe.service.ts`) for payment operations
   - Checkout flow: Create session with `createCheckoutSession()`, redirect user to Stripe
   - Verification: Use `retrieveSession()` to verify payment status
   - Webhooks: Use `constructWebhookEventAsync()` to validate Stripe webhook events
   - All amounts are handled in MXN currency, converted to cents (multiply by 100) for Stripe

5. **Authentication and Authorization**:
   - Password hashing: Uses `PasswordService` (bcrypt) in `infrastructure/services/password.service.ts`
   - Token generation: Uses `TokenService` (JWT) in `infrastructure/services/token.service.ts`
   - Authentication patterns: Check `crear-usuario.use-case.ts` and `login.use-case.ts`
   - Route protection: Use middleware from `infrastructure/middlewares/auth.middleware.ts`:
     - `authenticateToken`: Verifies JWT and attaches user to request
     - `requireRole(...roles)`: Requires specific user roles
     - `requireAdmin`, `requireSuperAdmin`, `requireVendedor`, `requireCliente`: Role-specific shortcuts

## TypeScript Configuration

- Path aliases configured in `tsconfig.json`: `@domain/*`, `@application/*`, `@infrastructure/*`, `@shared/*`
- Target: ES2020
- Module: NodeNext (ESM)
- Strict mode enabled
- Output: `./dist`
