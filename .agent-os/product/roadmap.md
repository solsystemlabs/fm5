# Product Roadmap

## Phase 1: Core Foundation

**Goal:** Establish core file and model management capabilities with basic inventory tracking
**Success Criteria:** Users can upload, organize, and manage 3D model files with basic product tracking

### Features

- [ ] Project initialization and development environment setup `S`
- [ ] Basic model file upload and storage to S3 `M`
- [ ] ZIP file extraction for 3MF and STL files `M`
- [ ] 3MF metadata extraction and display `L`
- [ ] Model variations management (linking sliced files to base models) `L`
- [ ] Basic product creation and editing tied to model variations `M`
- [ ] Simple filament type management `S`

### Dependencies

- Docker PostgreSQL setup for local development
- Supabase staging environment configuration
- AWS S3 bucket setup and integration

## Phase 2: Inventory and Business Management

**Goal:** Complete inventory tracking system with expense management and sales event planning
**Success Criteria:** Users can track physical inventory, record expenses, and plan vendor events

### Features

- [ ] Physical product inventory tracking with stock levels `L`
- [ ] Physical filament inventory management `M`
- [ ] Low stock alerts and notifications `M`
- [ ] Expense tracking for filament purchases and hardware `L`
- [ ] Sales event management (scheduling, costs, locations) `L`
- [ ] Receipt upload and management system `M`
- [ ] Mileage tracking for events `S`

### Dependencies

- Image upload system for receipts
- Notification system implementation

## Phase 3: Enhanced Features and AI Integration

**Goal:** Add advanced features including AI-powered event discovery and analytics
**Success Criteria:** Users can discover local events automatically and gain insights into business performance

### Features

- [ ] AI-powered local event discovery `XL`
- [ ] Advanced search and filtering across all entities `M`
- [ ] Business analytics and reporting dashboard `L`
- [ ] Bulk operations for models and products `M`
- [ ] Advanced file organization with tags and categories `L`
- [ ] Export capabilities for business data `M`

### Dependencies

- AI service integration (OpenAI or similar)
- Analytics database design
- Advanced search infrastructure