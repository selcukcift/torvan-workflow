# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TORVAN Medical Cleanstation Workflow Management System - A comprehensive manufacturing workflow system for medical equipment reprocessing sinks with complex BOM generation and order management.

## Essential Commands

### Development
```bash
npm run dev                # Start development server with Turbopack
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
```

### Database Operations
```bash
npm run db:generate       # Generate Prisma client after schema changes
npm run db:migrate        # Create and apply database migrations
npm run db:seed           # Seed database with initial inventory data
npm run db:studio         # Open Prisma Studio database GUI
```

### Build & Deployment
- Database uses SQLite by default (`prisma/dev.db`)
- Change `DATABASE_URL` in `.env` for PostgreSQL in production
- Run `npm run db:generate` after any Prisma schema changes
- Always run `npm run db:seed` on fresh databases

## Core Architecture

### Order Creation System (6-Step Wizard)
The heart of the application is a complex multi-step order creation system located in `src/components/orders/create/`:

1. **Customer Information** (`customer-info-step.tsx`) - Basic order details and document upload
2. **Sink Selection** (`sink-selection-step.tsx`) - Family selection with build numbers and quantities  
3. **Sink Configuration** (`sink-config-step.tsx`) - Detailed sink body configuration with real-time assembly calculations
4. **Basin & Faucets** (`basin-faucet-step.tsx`) - Basin types, faucet configuration with conditional logic
5. **Accessories** (`accessories-step.tsx`) - Catalog-based accessory selection with shopping cart
6. **Order Review** (`order-review.tsx`) - BOM generation, CSV export, and final submission

### BOM Generation Engine (`src/lib/bom-generator.ts`)
Critical component that transforms sink configurations into Bills of Materials:
- Implements complex business rules from `sink configuration and bom.txt`
- Maps dimensional ranges to assembly codes (e.g., 48-60" length → 709.82 T2-BODY-48-60-HA)
- Calculates pegboard assemblies, control boxes, and accessory requirements
- Integrates with Prisma database for part lookup and validation

### Database Schema Architecture
- **Orders**: Main order entity with customer information and status tracking
- **OrderConfiguration**: JSON-based storage for complex sink configurations per build number
- **Assembly/Part/Category**: Hierarchical inventory system with BOM relationships
- **User/Role System**: 6 user roles (PRODUCTION_COORDINATOR, PROCUREMENT_SPECIALIST, QC_SPECIALIST, ASSEMBLER, ADMIN, SERVICE_DEPARTMENT)
- **Tasks/QC/WorkInstructions**: Manufacturing workflow management

### Form Validation System (`src/lib/validations/order.ts`)
Zod schemas for each step:
- `customerInfoSchema` - Basic order validation
- `sinkSelectionSchema` - Family and build number validation
- `sinkConfigSchema` - Comprehensive sink configuration validation
- `basinConfigSchema` - Basin and faucet configuration with conditional rules

### Key Configuration Files
- **Business Requirements**: `sink configuration and bom.txt` contains detailed specification
- **Inventory Data**: `assemblies.json`, `categories.json`, `parts.json` - preloaded inventory
- **Database Seed**: `prisma/seed.ts` imports and creates inventory relationships

## Important Implementation Details

### Build Number System
Each sink configuration gets a unique build number that serves as the primary identifier throughout the system. All configuration data is stored with this key, allowing multiple sink configurations per order.

### Conditional BOM Logic
The BOM generator implements complex conditional logic:
- Assembly selection based on dimensional ranges
- Control box determination based on basin types (E-Sink, E-Drain combinations)
- Pegboard assembly calculation with size-dependent part selection
- Accessory integration with quantity tracking

### Multi-Configuration Support
Orders can contain multiple sink configurations, each with:
- Unique build number identifier
- Independent configuration settings
- Separate BOM generation
- Individual quantity tracking

### State Management Pattern
Order wizard uses a centralized state pattern:
- Each step saves data to shared `orderData` object
- Configuration data keyed by build number
- Progress tracking with `completedSteps` set
- Validation before step transitions

### Database Relationships
Key relationships to understand:
- `Assembly → AssemblyComponent → Part` (BOM structure)
- `Order → OrderConfiguration` (one-to-many with JSON data)
- `Order → BOMEntry → Assembly` (generated BOM items)
- `Category → Subcategory → Assembly` (inventory hierarchy)

## Common Development Patterns

### Adding New Assembly Logic
1. Update business rules in BOM generator
2. Add new assemblies to `assemblies.json`
3. Run `npm run db:seed` to update database
4. Test BOM generation in order review step

### Extending Form Steps
1. Create new step component in `src/components/orders/create/`
2. Add validation schema to `src/lib/validations/order.ts`
3. Update step array in `src/app/orders/create/page.tsx`
4. Handle new data in order review BOM generation

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:generate` to update Prisma client
4. Update seed data if needed with `npm run db:seed`