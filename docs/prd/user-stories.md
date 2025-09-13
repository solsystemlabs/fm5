# User Stories

## Epic 0: Foundation Setup

**Epic Goal**: Establish development environment, core infrastructure, and foundational services required for all subsequent features based on the full-stack architecture specification.

**Prerequisites**: Must complete before any other epic can begin.

**Story 0.1: Project Scaffolding and Tanstack Start Setup**
As a developer,
I want to initialize the Tanstack Start project with proper TypeScript configuration,
so that development can proceed with the specified tech stack and folder structure.

**Acceptance Criteria:**
1. Tanstack Start project created with TypeScript 5.0+ configuration
2. Folder structure follows frontend specification: app/routes/, components/, lib/, hooks/, types/
3. Package.json configured with all dependencies from tech stack: Tanstack ecosystem, React Aria, TailwindCSS
4. Node.js 20+ environment verified and documented
5. Initial routing structure created with __root.tsx and index.tsx

**Technical Requirements:**
- Tanstack Start latest version installed
- TypeScript strict mode enabled
- ESLint and Prettier configured for consistency
- Git repository initialized with appropriate .gitignore
- Hot reload and development server functional

**Story 0.2: Docker Development Environment Setup**
As a developer,
I want the complete Docker development environment from the architecture specification,
so that PostgreSQL, Redis, and MinIO services are available for local development.

**Acceptance Criteria:**
1. Docker Compose configuration creates PostgreSQL 18 Beta container with extensions
2. Redis 7 Alpine container configured for session/cache storage during development
3. MinIO container configured for local Cloudflare R2 simulation
4. Database initialization script creates proper extensions (uuid-ossp, pg_stat_statements)
5. All services accessible on specified ports with health checks

**Technical Requirements:**
- PostgreSQL accessible on localhost:5432 with printmgmt_dev database
- Redis accessible on localhost:6379 with append-only persistence
- MinIO accessible on localhost:9000/9001 with development credentials
- Environment variables template (.env.example) includes all configurations
- Services start reliably with docker-compose up

**Story 0.3: Database Schema and Prisma Setup**
As a developer,
I want the complete database schema implemented with PrismaORM,
so that all entities and relationships from the architecture are available for development.

**Acceptance Criteria:**
1. PrismaORM 5.0+ installed and configured with PostgreSQL connection
2. All tables created per architecture: models, model_variants, filaments, filament_inventory, etc.
3. Proper indexes implemented including GIN indexes for full-text search
4. Database triggers for updated_at timestamps and filament demand counting
5. Initial migration successfully creates all structures

**Technical Requirements:**
- Schema matches full-stack architecture specification exactly
- All foreign key constraints and relationships properly configured
- Indexes optimized for expected query patterns (search under 2 seconds)
- Migration scripts are idempotent and handle schema evolution
- Database seeding capability for development data

**Story 0.4: tRPC and ArkType Integration**
As a developer,
I want tRPC configured with ArkType schemas for end-to-end type safety,
so that API procedures have runtime validation matching TypeScript interfaces.

**Acceptance Criteria:**
1. tRPC server configured with router structure from architecture specification
2. ArkType schemas defined for all entities: ModelSchema, FilamentSchema, etc.
3. tRPC procedures use ArkType for input/output validation
4. Client-side tRPC configured with proper error handling
5. Type inference working from database to UI components

**Technical Requirements:**
- Runtime validation exactly matches TypeScript types (1:1 mapping)
- API routes follow architecture router structure (models, variants, filaments, queue)
- Error handling consistent across all procedures
- Performance optimized validation as specified in architecture
- Development server serves tRPC endpoints correctly

**Story 0.5: Tanstack DB Collections and State Management**
As a developer,
I want Tanstack DB collections configured with live queries,
so that reactive client-side data management works as specified in the architecture.

**Acceptance Criteria:**
1. Tanstack Query v5 configured with cache settings from architecture
2. Tanstack DB collections created for all major entities (models, filaments, inventory)
3. Live query patterns implemented per architecture examples
4. Collection sync with tRPC backend configured
5. Optimistic mutations working with automatic rollback on failure

**Technical Requirements:**
- Collections follow architecture examples exactly (modelsCollection, filamentsCollection, etc.)
- Live queries provide sub-millisecond performance as specified
- Optimistic updates integrate properly with tRPC mutations
- QueryClient configured with architecture cache settings (staleTime, gcTime)
- State management replaces traditional useQuery patterns per specification

## Epic 1: Digital Asset Management Foundation

**Epic Goal**: Establish core file management capabilities that replace Windows folder chaos with systematic digital asset organization.

**Dependencies**: Must complete Epic 0 entirely before beginning.

**Story 1.0: Cloudflare R2 Integration and File Storage Setup**
As a developer,
I want secure file storage integration with Cloudflare R2,
so that model and sliced files can be uploaded, stored, and accessed reliably.

**Acceptance Criteria:**
1. Cloudflare R2 SDK integrated with proper authentication
2. Signed URL generation for secure file uploads working with MinIO locally
3. File upload API endpoints accept .3mf, .gcode, and .stl files with size validation
4. File integrity verification after upload completion
5. Error handling for upload failures with retry mechanisms

**Technical Requirements:**
- File size limits enforced (100MB max per architecture spec)
- Upload progress tracking implemented
- Secure credential management for R2 access keys
- File path organization follows logical structure (/models/{modelId}/variants/{variantId}/)
- Local development uses MinIO, production uses Cloudflare R2

**Story 1.1: Core Metadata Extraction Library**
As a developer,
I want a robust library for extracting metadata from 3D printing files,
so that slicer settings can be automatically captured without manual entry.

**Acceptance Criteria:**
1. Client-side JavaScript library extracts metadata from .3mf files using JSZip
2. G-code comment parsing extracts Bambu Studio parameters
3. Extracted data follows BambuMetadata schema from architecture
4. Validation and sanitization prevents malicious content injection per security spec
5. Error handling gracefully manages corrupted or unsupported files

**Technical Requirements:**
- Supports Bambu Studio .3mf and .gcode formats initially
- Extracts 600+ parameters as specified in architecture
- Performance: processes 50MB files within 30 seconds
- Memory efficient for large file handling
- Uses security validation from FileSecurityValidator class

**Story 1.2a: Basic File Upload Infrastructure**
As a 3D printing business owner,
I want to upload model and sliced files through a simple interface,
so that I can begin organizing my digital assets systematically.

**Acceptance Criteria:**
1. Drag-and-drop interface accepts multiple files simultaneously
2. File type validation restricts to .3mf, .gcode, and .stl files per security spec
3. Upload progress bars show individual file progress
4. Batch upload handles up to 20 files efficiently
5. Clear error messages for unsupported files or upload failures

**Dependencies**: Requires Stories 1.0 and 1.1 completion.

**Technical Requirements:**
- File validation before upload attempt using FileSecurityValidator
- Chunked upload for large files
- Cancel upload functionality
- Resume failed uploads where possible
- UI follows design system from frontend specification

**Story 1.2b: Model and Variant Storage System**
As a 3D printing business owner,
I want to organize uploaded files into logical model-variant hierarchies,
so that I can find specific variants quickly without folder navigation chaos.

**Acceptance Criteria:**
1. Models creation with name, designer, category, and description
2. Variants automatically linked to parent models with clear relationships
3. File metadata automatically extracted and stored using metadata extraction library
4. Model-variant relationships clearly displayed in UI per frontend specification
5. Bulk organization tools for multiple files

**Dependencies**: Requires Story 1.2a completion.

**Technical Requirements:**
- Database operations use proper transactions
- Variant naming follows consistent patterns
- Parent-child relationships properly maintained in UI
- Uses Tanstack DB collections for reactive updates

**Story 1.2c: Advanced Metadata Extraction and Display**
As a 3D printing business owner,
I want detailed slicer settings automatically extracted and displayed,
so that I never lose track of parameters used for successful prints.

**Acceptance Criteria:**
1. Critical parameters (layer height, nozzle temp, filament colors) prominently displayed
2. Complete metadata (600+ parameters) accessible through expandable interface
3. Filament information automatically creates or matches existing filament records
4. Manual metadata editing available for corrections or custom parameters
5. Metadata validation prevents invalid or dangerous values per security spec

**Dependencies**: Requires Story 1.2b completion.

**Technical Requirements:**
- Metadata stored in JSONB format as per architecture
- Fast-access fields indexed for search performance
- Security validation for all extracted content using sanitization
- Uses ArkType schemas for validation

**Story 1.3: Advanced Search and Discovery**
As a 3D printing business owner,
I want to search for specific model variants using multiple criteria,
so that I can quickly find the exact variant I need for production.

**Acceptance Criteria:**
1. Keyword search operates across model names, descriptions, and metadata
2. Visual browsing displays thumbnail images for quick identification
3. Filtering by parameters (material, color, size, print duration) narrows results effectively
4. Search results include relevance ranking and sorting options
5. Recent searches and favorites enable quick access to commonly used variants

**Dependencies**: Requires Stories 1.2a, 1.2b, and 1.2c completion.

**Technical Requirements:**
- PostgreSQL full-text search with GIN indexes per architecture
- Search response time under 2 seconds for 1000+ variants
- Faceted search with multiple filter combinations
- Uses materialized view for complex aggregations if needed

## Epic 2: Inventory Intelligence System

**Epic Goal**: Create comprehensive inventory tracking that automates consumption calculations and purchasing decisions.

**Dependencies**: Requires Epic 1 Stories 1.2c completion (filament extraction from metadata) before beginning.

**Story 2.1: Filament Inventory with Precise Matching**
As a 3D printing business owner,
I want to track my filament inventory with precise color and material matching,
so that I can accurately plan production and avoid stockouts.

**Acceptance Criteria:**
1. Filament entries include hex color codes, brand names, and material types
2. Inventory levels are tracked in grams with automatic conversion to print estimates
3. Visual color representation matches physical spool colors accurately
4. Low stock alerts trigger before complete depletion
5. Multiple spool tracking handles partial spools and multiple locations

**Dependencies**: Requires filament metadata extraction from Epic 1 Story 1.2c.

**Technical Requirements:**
- Uses FilamentSchema and FilamentInventorySchema from architecture
- Filament demand tracking automatically calculated via database triggers
- Color accuracy validation per frontend specification (hex codes)
- Uses Tanstack DB filamentInventoryCollection for reactive updates
- Low stock thresholds configurable per filament type

**Story 2.2: Automated Consumption Tracking**
As a 3D printing business owner,
I want the system to automatically calculate filament usage based on completed prints,
so that inventory levels stay accurate without manual tracking.

**Acceptance Criteria:**
1. Completed print jobs automatically deduct calculated filament usage from inventory
2. Failed prints allow percentage completion entry for partial consumption calculation
3. Consumption history provides audit trail for inventory reconciliation
4. Waste factor adjustments improve accuracy over time
5. Batch consumption updates handle multiple prints efficiently

**Dependencies**: Requires Story 2.1 completion and Epic 3 print queue integration.

**Technical Requirements:**
- Integrates with print queue status updates from Epic 3
- Uses filament usage data from BambuMetadata schema
- Consumption calculations use database transactions for consistency
- Audit trail stored for inventory reconciliation
- Optimistic updates with rollback on calculation errors

**Story 2.3: Intelligent Shopping List Generation**
As a 3D printing business owner,
I want automated shopping lists generated based on inventory levels and planned production,
so that I can restock efficiently without manual calculation.

**Acceptance Criteria:**
1. Shopping lists automatically include items below defined thresholds
2. Purchase URLs stored with inventory items enable one-click ordering
3. Quantity recommendations based on historical usage patterns
4. Event-based restocking considers seasonal demand spikes
5. Cost calculations help optimize bulk purchasing decisions

**Dependencies**: Requires Stories 2.1 and 2.2 completion.

**Technical Requirements:**
- Uses demand counting from filament requirements relationships
- Shopping list generation follows tRPC API specification
- Historical usage pattern analysis for recommendations
- Integration with market events from Epic 3 for seasonal planning

## Epic 3: Production Optimization Engine

**Epic Goal**: Enable intelligent production planning through queue management, feasibility checking, and performance analytics.

**Dependencies**: Requires Epic 2 Stories 2.1 completion (inventory tracking) for feasibility checking functionality.

**Story 3.1: Smart Print Queue Management**
As a 3D printing business owner,
I want a print queue that helps me optimize printer utilization and batch efficiency,
so that I can maximize productive printing time.

**Acceptance Criteria:**
1. Queue displays estimated print times and material requirements
2. Drag-and-drop reordering enables priority adjustment
3. Batch optimization suggestions group similar materials and settings
4. Print feasibility warnings prevent queue items that exceed inventory
5. Status updates (queued, printing, completed, failed) track progress accurately

**Dependencies**: Requires Epic 1 Story 1.3 (search) and Epic 2 Story 2.1 (inventory) completion.

**Technical Requirements:**
- Uses PrintJobSchema and queue API from architecture specification
- Feasibility checking integrates with FilamentInventory via live queries
- Drag-and-drop follows frontend UI specification patterns
- Queue optimization uses print duration and material grouping algorithms
- Status updates trigger inventory consumption via Epic 2 Story 2.2

**Story 3.2: Sales Velocity Analytics and Restocking Intelligence**
As a 3D printing business owner,
I want to see which variants sell fastest and receive automatic restock recommendations,
so that I can focus production on profitable items and avoid stockouts.

**Acceptance Criteria:**
1. Sales velocity metrics track movement rates for each variant
2. Trending analysis identifies seasonal patterns and market preferences
3. Automated restock recommendations consider sales history and current inventory
4. Slow-moving inventory alerts help optimize product mix
5. Performance dashboards enable quick decision-making

**Dependencies**: Requires Story 3.1 completion and Epic 2 Story 2.3 (shopping lists).

**Technical Requirements:**
- Analytics dashboard follows frontend design system specifications
- Performance metrics stored using database performance monitoring patterns
- Trending analysis uses PostgreSQL time series queries
- Integration with shopping list generation from Epic 2
- Dashboard follows responsive design strategy from frontend spec

**Story 3.3: Market Event Planning and Themed Inventory**
As a 3D printing business owner,
I want to plan production for specific market events with themed inventory recommendations,
so that I can optimize my product mix for each sales opportunity.

**Acceptance Criteria:**
1. Event planning interface allows theme assignment (Christmas, Spring, etc.)
2. Product recommendations based on historical performance for similar events
3. Inventory preparation checklists ensure adequate stock levels
4. Production scheduling coordinates printing timeline with event dates
5. Event performance tracking informs future planning decisions

**Dependencies**: Requires Stories 3.1 and 3.2 completion.

**Technical Requirements:**
- Uses MarketEvents entity from database schema
- Event planning interface follows frontend workflow specifications
- Historical performance analysis uses analytics from Story 3.2
- Production scheduling integrates with print queue from Story 3.1
- Inventory checking uses Epic 2 inventory intelligence

## Epic 4: Advanced Intelligence and Optimization

**Epic Goal**: Establish foundation for learning algorithms that optimize printing success through version tracking and failure analysis.

**Dependencies**: Requires Epic 3 completion for production data and analytics foundation.

**Story 4.1: ModelVariant Versioning System**
As a 3D printing business owner,
I want to track different versions of my model variants with success/failure rates,
so that I can identify optimal slicer settings over time.

**Acceptance Criteria:**
1. Version creation allows uploading updated sliced files with change documentation
2. Success/failure tracking provides statistical analysis of variant performance
3. Setting comparisons highlight differences between versions
4. Performance trends guide future slicer parameter decisions
5. Best practice recommendations emerge from successful version patterns

**Dependencies**: Requires Epic 1 metadata extraction and Epic 3 print tracking completion.

**Technical Requirements:**
- Version tracking extends ModelVariant schema with version field
- Success/failure data collected from Epic 3 print queue status updates
- Metadata comparison uses BambuMetadata schema difference analysis
- Statistical analysis uses PostgreSQL analytics functions
- Performance recommendations generated from success pattern analysis

**Story 4.2: Manufacturing Cost Analysis**
As a 3D printing business owner,
I want accurate manufacturing cost calculations for each variant,
so that I can price products appropriately and identify profit opportunities.

**Acceptance Criteria:**
1. Cost calculations include filament usage, electricity, and depreciation estimates
2. Batch production costs enable volume pricing strategies
3. Profit margin analysis guides product portfolio decisions
4. Cost tracking over time identifies efficiency improvements
5. Competitive cost analysis supports market positioning

**Dependencies**: Requires Epic 2 inventory cost tracking and Epic 3 production analytics.

**Technical Requirements:**
- Cost calculations use filament usage from BambuMetadata and inventory costs
- Manufacturing cost analysis integrates with Epic 2 consumption tracking
- Cost data stored in costToProduceUsd field per architecture
- Batch cost calculations use Epic 3 production optimization data
- Cost tracking analysis uses time series data from production history
