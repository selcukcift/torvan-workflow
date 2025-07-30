# Product Requirements Document (PRD)

## Product Overview

Develop a **Workflow Management Web Application** to digitize and streamline the production process of TORVAN MEDICAL CLEANSTATION REPROCESSING SINKS. This web application must provide clear, efficient management and tracking of production workflows from initial order creation to final shipment.

## Goals and Objectives

- Digitize manual production workflows.
- Enhance communication and clarity across different user roles.
- Ensure accurate tracking and management of production processes.
- Provide dynamic, tailored task lists, BOMs, and instructions based on configurations.
- Simplify parts ordering and inventory management.

## Users and Roles

- **Production Coordinator**
  - Creates and manages detailed production orders.
  - Finalizes shipment status.

- **Procurement Specialist**
  - Reviews and approves orders and BOM.
  - Manages parts procurement and tracks external manufacturing status.

- **Quality Control (QC) Specialist**
  - Conducts pre-production and final quality inspections.

- **Assembler**
  - Executes production tasks, testing, packaging, and preparation for shipment.

- **Admin**
  - Full system oversight and management authorization.

- **Service Department User**
  - Orders spare parts using an intuitive interface, without pricing.

## Key Features and Functionalities

### 1. Order Creation
- Detailed form capturing:
  - Customer Information
  - Desired delivery date
  - PO number
  - Sales representative details
  - Sink quantities and configuration specifics (legs, pegboards, basin types/sizes, faucets, placements, accessories)
- Document uploads (drawings, PO documents, order confirmations)
- Unique PO generation

### 2. Procurement and BOM Management
- Automatic generation of tailored BOM based on order configurations.
- Review, modification, and approval capabilities for procurement.
- Status updates tracking external parts procurement.

### 3. Quality Control Management
- Pre-QC verification against detailed documentation and physical components.
- Final QC with distinct checklists to ensure product readiness for shipment.

### 4. Assembly and Task Management
- Automated generation of task lists, parts lists, tool requirements, and detailed work instructions.
- Task progress tracking and mandatory testing phases.
- Automated packaging instructions based on product configurations.

### 5. Shipment Management
- Final status update to "Shipped" upon completion.

### 6. Service Department Module
- Simplified parts ordering system without pricing.
- Orders visibility for Procurement and Production teams.

## Database Architecture

### Database Pools
- **Order Details Pool**: Stores comprehensive order information, documents, configurations, and statuses.
- **Inventory Pool**: Manages inventory of parts, assemblies, and subassemblies.
- **Work Instructions Pool**: Detailed instructions for assembly tasks.
- **Task List Pool**: Customized task sequences.
- **Tools Pool**: Tool listings for assembly tasks.

### Dynamic Interactions
- Automated generation of BOMs and task lists.
- Real-time inventory updates and usage tracking.
- Visual representation of hierarchical component relationships.

## Inventory and Component Management
- Clear hierarchical data management from CSV provided, including:
  - 19 Categories
  - 219 Assemblies
  - 481 Subassemblies (Verify counts)
- Dedicated detail pages for assemblies and subassemblies featuring:
  - Photos
  - Technical drawings
  - Assembly instructions
  - QR code generation

## Technical Requirements

- **Frontend Technology Stack**:
  - Next.js
  - ShadCN UI
  - Tailwind CSS
  - Lucide-react icons
  - Framer Motion animations

- **Performance and Optimization**:
  - Implement Server-Side Rendering (SSR) for optimal performance and improved SEO.

## UI/UX Design Guidelines

- **Layout Strategy**:
  - Dashboard-style interface with fixed sidebar navigation, top toolbar, and responsive content areas.
  - Utilize `flex` and `grid` layouts for structured alignment and clear presentation.

- **Visual and Interaction Design**:
  - Neutral base colors (`#f9fafb`, `#f1f5f9`) with a single accent color (blue, green, or indigo).
  - Consistent typography: `text-xl` for headings, `text-base` for body, `font-semibold` for labels, `font-medium` for descriptions.
  - Breadcrumb navigation for clarity in workflow progression.
  - Comprehensive filtering, search, and tagging options.
  - Animations and interactive feedback to enhance user experience without overwhelming users.

- **Accessibility**:
  - Compliance with standard accessibility guidelines to ensure usability for all users.

- **Design Benchmarks**:
  - Achieve UX quality comparable to leading SaaS platforms such as Notion, Linear, ClickUp, or Superhuman.

## Constraints and Considerations

- Avoid cluttered interfaces, excessive modals, inconsistent spacing, overly vibrant colors, and non-standard components.

This PRD clearly defines the project's scope, features, and technical specifications, ensuring clarity for subsequent development phases, including implementation by an AI coding agent.

