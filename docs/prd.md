# 3D Printing Business Management Platform - Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Eliminate file management chaos by providing systematic digital asset organization with searchable metadata
- Automate filament inventory tracking and consumption calculations to prevent stockouts and enable data-driven purchasing  
- Enable intelligent production planning through smart print queue management and sales velocity insights
- Create operational efficiency that frees up 60% of admin time for R&D and market expansion activities
- Support business growth through seasonal inventory planning and market event preparation tools
- Establish foundation for future AI-powered slicer optimization and predictive analytics

### Background Context

The 3D printing business landscape for small-scale operators suffers from operational inefficiencies that limit growth potential. Current workflows rely on manual file management through Windows folders, leading to lost slicer settings, constant re-work, and inability to track inventory or production metrics. This creates a ceiling on business growth and prevents operators from focusing on creative product development and market expansion.

Our target user operates a small 3D printing business with designer partnerships, producing model variants for market events and wholesale distribution. The core problem is systematic: without proper digital asset management and inventory tracking, the business cannot scale beyond manual capacity limits. This PRD addresses these operational bottlenecks through comprehensive automation and intelligence layers.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-18 | 1.0 | Initial PRD creation from Project Brief | Product Manager John |

## Requirements

### Functional Requirements

**Digital Asset Management**
- FR1: System shall store and organize 3D model files (.3mf, .stl) with hierarchical Model → ModelVariant structure
- FR2: System shall extract and store metadata from .gcode/.3mf archives including all slicer parameters (600+ fields)
- FR3: System shall provide search functionality across models and variants using keywords, visual browsing, and filters
- FR4: System shall support model variant versioning to track iterative improvements and slicer setting changes
- FR5: System shall store and display model images for visual identification and browsing
- FR6: System shall integrate with Cloudflare R2 for scalable file storage with direct download capabilities

**Inventory Management**
- FR7: System shall track filament inventory using hex color codes, brand names, and material types for precise matching
- FR8: System shall automatically match sliced file filament metadata to inventory items for consumption tracking
- FR9: System shall calculate filament consumption automatically when print jobs are marked complete
- FR10: System shall support partial consumption tracking for failed prints using completion percentage estimates
- FR11: System shall track physical product inventory including finished prints, keychains, earrings, and accessories
- FR12: System shall generate automated shopping lists based on inventory thresholds with stored purchase URLs

**Production Management**
- FR13: System shall provide print queue management with job status tracking (queued, printing, completed, failed)
- FR14: System shall enable print feasibility checking based on current filament inventory levels
- FR15: System shall track and display sales velocity metrics to identify high-performing variants
- FR16: System shall provide restock recommendations based on inventory levels and sales patterns
- FR17: System shall support market event planning with themed inventory assignment and preparation tracking

**Advanced Features**
- FR18: System shall track print success/failure rates by ModelVariant version for optimization insights
- FR19: System shall calculate manufacturing costs based on filament usage and material costs
- FR20: System shall support seasonal inventory planning with event-specific product recommendations

### Non-Functional Requirements

**Performance**
- NFR1: File upload and metadata extraction shall complete within 30 seconds for files up to 100MB
- NFR2: Search operations shall return results within 2 seconds for libraries up to 1000 variants
- NFR3: System shall support concurrent file operations without performance degradation

**Scalability**
- NFR4: System architecture shall support growth to 10,000+ model variants without redesign
- NFR5: Cloudflare R2 integration shall handle petabyte-scale storage requirements cost-effectively
- NFR6: Database design shall support complex queries across relational data without performance bottlenecks

**Usability**
- NFR7: User interface shall be intuitive for users familiar with 3D printing workflows but new to inventory management
- NFR8: Mobile responsiveness shall enable inventory updates and queue management during printing operations
- NFR9: System shall minimize manual data entry through automated metadata extraction and intelligent defaults

**Reliability**
- NFR10: Metadata extraction shall maintain 99% accuracy across major slicer formats (Bambu Studio, PrusaSlicer, Cura)
- NFR11: File operations shall include integrity verification and automatic error recovery
- NFR12: Data backup and recovery procedures shall prevent loss of business-critical information

## User Interface Design Goals

### Design Philosophy
- **Workflow-Centric**: Interface prioritizes common task flows over comprehensive feature access
- **Progressive Disclosure**: Advanced features available but not prominently displayed for casual users  
- **Visual-First**: Thumbnail images and visual cues reduce cognitive load for model identification
- **Mobile-Responsive**: Essential functions accessible during printing operations via phone/tablet

### Information Architecture
- **Dashboard-Centered**: Primary landing page shows status of queue, inventory alerts, and quick actions
- **Search-Optimized**: Prominent search with intelligent filtering and faceted navigation
- **Context-Aware**: Interface adapts based on user's current workflow stage (planning, printing, inventory management)

### Visual Design Principles  
- **Clean and Functional**: Minimal visual noise with focus on actionable information
- **Status-Driven**: Color coding and badges communicate system state at a glance
- **Professional Aesthetic**: Business tool appearance that inspires confidence and productivity

### Key User Flows
1. **Model Discovery**: Search/browse → Preview → Download sliced file → Queue for printing
2. **Inventory Management**: View current stock → Identify low items → Generate shopping list → Purchase
3. **Production Planning**: Review queue → Check feasibility → Optimize batch printing → Execute
4. **Event Preparation**: Select event theme → Assign products → Verify inventory → Plan production schedule

## User Stories

### Epic 0: Foundation Setup

**Epic Goal**: Establish development environment, core infrastructure, authentication framework, deployment pipeline, and foundational services required for all subsequent features.

**Prerequisites**: Must complete before any other epic can begin.

**Key Additions from PO Review:**
- Authentication framework setup and provider selection
- CI/CD deployment pipeline configuration
- External service planning (DNS, CDN, email)
- Error handling patterns and user documentation strategy

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

**Story 0.4: tRPC and Zod Integration**
As a developer,
I want tRPC configured with Zod schemas for end-to-end type safety,
so that API procedures have runtime validation matching TypeScript interfaces.

**Acceptance Criteria:**
1. tRPC server configured with router structure from architecture specification
2. Zod schemas defined for all entities: ModelSchema, FilamentSchema, etc.
3. tRPC procedures use Zod for input/output validation
4. Client-side tRPC configured with proper error handling
5. Type inference working from database to UI components

**Technical Requirements:**
- Runtime validation exactly matches TypeScript types (1:1 mapping)
- API routes follow architecture router structure (models, variants, filaments, queue)
- Error handling consistent across all procedures
- Performance optimized validation as specified in architecture
- Development server serves tRPC endpoints correctly

**Story 0.5: Authentication Framework Setup**
As a developer,
I want a complete authentication framework configured before any protected features,
so that user management and security are established from the foundation.

**Acceptance Criteria:**
1. Authentication provider selected and configured (Clerk or Auth0 recommended)
2. User model and session management integrated with database schema
3. Route protection middleware configured for tRPC procedures
4. Authentication UI components (login, signup, profile) implemented
5. Role-based access control foundation established

**Technical Requirements:**
- JWT token validation middleware for tRPC
- User table added to database schema with proper indexes
- Session storage configured with Redis
- Protected route wrapper components for frontend
- Authentication state management with Tanstack Query
- Logout and session expiry handling

**Story 0.6: CI/CD Pipeline and Deployment Infrastructure**
As a developer,
I want automated deployment pipeline and infrastructure configuration,
so that code can be deployed safely and consistently to production.

**Acceptance Criteria:**
1. GitHub Actions workflow configured for automated testing and deployment
2. Environment-specific configuration (dev, staging, production)
3. Database migration automation integrated with deployment
4. Docker production build configuration optimized
5. Infrastructure as Code (IaC) setup for cloud resources

**Technical Requirements:**
- Automated testing pipeline runs on pull requests
- Production Docker image optimized for performance and security
- Environment variable management for different deployment stages
- Database backup and recovery procedures automated
- Blue-green or rolling deployment strategy implemented
- Health check endpoints for monitoring deployment status

**Story 0.7: External Service Integration Planning**
As a developer,
I want external service dependencies configured and ready,
so that features requiring third-party services work reliably.

**Acceptance Criteria:**
1. Cloudflare R2 account setup with API keys and bucket configuration
2. DNS configuration planned and domain registration requirements documented
3. Email service provider selected and configured (SendGrid or AWS SES)
4. CDN configuration planned for static asset delivery
5. Service monitoring and alerting configured

**Technical Requirements:**
- R2 bucket policies configured for secure file access
- Email templates created for system notifications
- CDN integration with R2 for optimized file delivery
- Service health monitoring and automatic failover
- API rate limiting and quota management
- Cost monitoring and alerts for cloud services

**Story 0.8: Error Handling and User Documentation Framework**
As a developer,
I want comprehensive error handling patterns and user documentation infrastructure,
so that users have excellent experience with clear guidance.

**Acceptance Criteria:**
1. Global error boundary components implemented
2. Loading states and error UI patterns standardized
3. User help system infrastructure created
4. Error logging and monitoring configured
5. User onboarding flow framework established

**Technical Requirements:**
- React Error Boundary with user-friendly error pages
- Loading skeleton components for all major features
- Toast notification system for user feedback
- Error tracking integration (Sentry or similar)
- In-app help system with contextual guidance
- User onboarding checklist and progress tracking

**Story 0.9: Tanstack DB Collections and State Management**
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

### Epic 1: User Management & Authentication

**Epic Goal**: Establish complete user authentication, profile management, and user-specific data isolation before any business features.

**Dependencies**: Must complete Epic 0 Stories 0.5-0.8 before beginning.

**Story 1.1: User Registration and Profile Management**
As a 3D printing business owner,
I want to create an account and manage my profile,
so that I can access the platform securely and maintain my business information.

**Acceptance Criteria:**
1. User registration with email verification
2. Profile management with business information (name, description, preferences)
3. Password reset and account recovery functionality
4. User preferences for units, default settings, and notifications
5. Account deletion with proper data cleanup

**Technical Requirements:**
- Integration with authentication framework from Story 0.5
- User profile stored in database with proper validation
- Email verification workflow using external email service
- GDPR-compliant data export and deletion
- User session management with JWT tokens

**Story 1.2: Dashboard and Navigation Framework**
As a 3D printing business owner,
I want a personalized dashboard and clear navigation,
so that I can quickly access the features I need most.

**Acceptance Criteria:**
1. Personalized dashboard showing user-specific metrics and quick actions
2. Navigation structure that adapts to user permissions and preferences
3. Recent activity and quick access to frequently used features
4. User-specific settings and configuration access
5. Help system integration with contextual guidance

**Technical Requirements:**
- Dashboard components use authentication state
- Navigation follows UI framework patterns from Epic 0
- Real-time updates using Tanstack Query
- Responsive design for mobile and desktop
- Integration with help system from Story 0.8

**Story 1.3: User Data Isolation and Permissions**
As a 3D printing business owner,
I want my data to be completely isolated from other users,
so that my business information remains private and secure.

**Acceptance Criteria:**
1. All database queries automatically filter by user ID
2. File storage organized by user with proper access controls
3. API endpoints validate user ownership before operations
4. Multi-tenant data architecture prevents cross-user data access
5. Admin interface for user management (future-ready)

**Technical Requirements:**
- Row-level security implemented in database
- tRPC middleware validates user ownership
- File storage paths include user isolation
- Database queries use user context filtering
- Audit logging for all user data access

### Epic 2: Digital Asset Management Foundation

**Epic Goal**: Establish core file management capabilities that replace Windows folder chaos with systematic digital asset organization.

**Dependencies**: Must complete Epic 0 and Epic 1 entirely before beginning, specifically:
- Epic 1 (User Management) - Required for user-specific file organization and access control
- Story 0.7 (External Service Integration) - Required for R2 bucket configuration
- Story 0.8 (Error Handling Framework) - Required for file upload error states

**Story 2.1: Cloudflare R2 Integration and File Storage Setup**
As a developer,
I want secure file storage integration with Cloudflare R2,
so that model and sliced files can be uploaded, stored, and accessed reliably with proper user isolation.

**Acceptance Criteria:**
1. Cloudflare R2 SDK integrated with proper authentication
2. Signed URL generation for secure file uploads working with MinIO locally
3. File upload API endpoints accept .3mf, .gcode, and .stl files with size validation
4. File integrity verification after upload completion
5. Error handling for upload failures with retry mechanisms
6. User-specific file isolation and access control implemented

**Technical Requirements:**
- File size limits enforced (100MB max per architecture spec)
- Upload progress tracking implemented
- Secure credential management for R2 access keys
- File path organization follows logical structure (/users/{userId}/models/{modelId}/variants/{variantId}/)
- Local development uses MinIO, production uses Cloudflare R2
- JWT token validation for all file operations
- User quota and rate limiting per authentication framework

**Dependencies**: Requires Epic 1 (User Management) and Story 0.7 (External Services)

**Story 2.2: Core Metadata Extraction Library**
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

**Story 2.3a: Basic File Upload Infrastructure**
As a 3D printing business owner,
I want to upload model and sliced files through a simple interface,
so that I can begin organizing my digital assets systematically.

**Acceptance Criteria:**
1. User authentication required before accessing upload interface
2. Drag-and-drop interface accepts multiple files simultaneously
3. File type validation restricts to .3mf, .gcode, and .stl files per security spec
4. User-specific upload quotas enforced
5. Progress indicators and error states follow framework patterns
3. Upload progress bars show individual file progress
4. Batch upload handles up to 20 files efficiently
5. Clear error messages for unsupported files or upload failures

**Dependencies**: Requires Stories 2.1 and 2.2 completion.

**Technical Requirements:**
- File validation before upload attempt using FileSecurityValidator
- Chunked upload for large files
- Cancel upload functionality
- Resume failed uploads where possible
- UI follows design system from frontend specification

**Story 2.3b: Model and Variant Storage System**
As a 3D printing business owner,
I want to organize uploaded files into logical model-variant hierarchies,
so that I can find specific variants quickly without folder navigation chaos.

**Acceptance Criteria:**
1. Models creation with name, designer, category, and description
2. Variants automatically linked to parent models with clear relationships
3. File metadata automatically extracted and stored using metadata extraction library
4. Model-variant relationships clearly displayed in UI per frontend specification
5. Bulk organization tools for multiple files

**Dependencies**: Requires Story 2.3a completion.

**Technical Requirements:**
- Database operations use proper transactions
- Variant naming follows consistent patterns
- Parent-child relationships properly maintained in UI
- Uses Tanstack DB collections for reactive updates

**Story 2.3c: Advanced Metadata Extraction and Display**
As a 3D printing business owner,
I want detailed slicer settings automatically extracted and displayed,
so that I never lose track of parameters used for successful prints.

**Acceptance Criteria:**
1. Critical parameters (layer height, nozzle temp, filament colors) prominently displayed
2. Complete metadata (600+ parameters) accessible through expandable interface
3. Filament information automatically creates or matches existing filament records
4. Manual metadata editing available for corrections or custom parameters
5. Metadata validation prevents invalid or dangerous values per security spec

**Dependencies**: Requires Story 2.3b completion.

**Technical Requirements:**
- Metadata stored in JSONB format as per architecture
- Fast-access fields indexed for search performance
- Security validation for all extracted content using sanitization
- Uses Zod schemas for validation

**Story 2.4: Advanced Search and Discovery**
As a 3D printing business owner,
I want to search for specific model variants using multiple criteria,
so that I can quickly find the exact variant I need for production.

**Acceptance Criteria:**
1. Keyword search operates across model names, descriptions, and metadata
2. Visual browsing displays thumbnail images for quick identification
3. Filtering by parameters (material, color, size, print duration) narrows results effectively
4. Search results include relevance ranking and sorting options
5. Recent searches and favorites enable quick access to commonly used variants

**Dependencies**: Requires Stories 2.3a, 2.3b, and 2.3c completion.

**Technical Requirements:**
- PostgreSQL full-text search with GIN indexes per architecture
- Search response time under 2 seconds for 1000+ variants
- Faceted search with multiple filter combinations
- Uses materialized view for complex aggregations if needed

### Epic 3: Inventory Intelligence System

**Epic Goal**: Create comprehensive inventory tracking that automates consumption calculations and purchasing decisions.

**Dependencies**: Requires Epic 2 Stories 2.3c completion (filament extraction from metadata) before beginning.

**Story 3.1: Filament Inventory with Precise Matching**
As a 3D printing business owner,
I want to track my filament inventory with precise color and material matching,
so that I can accurately plan production and avoid stockouts.

**Acceptance Criteria:**
1. Filament entries include hex color codes, brand names, and material types
2. Inventory levels are tracked in grams with automatic conversion to print estimates
3. Visual color representation matches physical spool colors accurately
4. Low stock alerts trigger before complete depletion
5. Multiple spool tracking handles partial spools and multiple locations

**Dependencies**: Requires filament metadata extraction from Epic 2 Story 2.3c.

**Technical Requirements:**
- Uses FilamentSchema and FilamentInventorySchema from architecture
- Filament demand tracking automatically calculated via database triggers
- Color accuracy validation per frontend specification (hex codes)
- Uses Tanstack DB filamentInventoryCollection for reactive updates
- Low stock thresholds configurable per filament type

**Story 3.2: Automated Consumption Tracking**
As a 3D printing business owner,
I want the system to automatically calculate filament usage based on completed prints,
so that inventory levels stay accurate without manual tracking.

**Acceptance Criteria:**
1. Completed print jobs automatically deduct calculated filament usage from inventory
2. Failed prints allow percentage completion entry for partial consumption calculation
3. Consumption history provides audit trail for inventory reconciliation
4. Waste factor adjustments improve accuracy over time
5. Batch consumption updates handle multiple prints efficiently

**Dependencies**: Requires Story 3.1 completion and Epic 4 print queue integration.

**Technical Requirements:**
- Integrates with print queue status updates from Epic 3
- Uses filament usage data from BambuMetadata schema
- Consumption calculations use database transactions for consistency
- Audit trail stored for inventory reconciliation
- Optimistic updates with rollback on calculation errors

**Story 3.3: Intelligent Shopping List Generation**
As a 3D printing business owner,
I want automated shopping lists generated based on inventory levels and planned production,
so that I can restock efficiently without manual calculation.

**Acceptance Criteria:**
1. Shopping lists automatically include items below defined thresholds
2. Purchase URLs stored with inventory items enable one-click ordering
3. Quantity recommendations based on historical usage patterns
4. Event-based restocking considers seasonal demand spikes
5. Cost calculations help optimize bulk purchasing decisions

**Dependencies**: Requires Stories 3.1 and 3.2 completion.

**Technical Requirements:**
- Uses demand counting from filament requirements relationships
- Shopping list generation follows tRPC API specification
- Historical usage pattern analysis for recommendations
- Integration with market events from Epic 3 for seasonal planning

### Epic 4: Production Optimization Engine

**Epic Goal**: Enable intelligent production planning through queue management, feasibility checking, and performance analytics.

**Dependencies**: Requires Epic 3 Stories 3.1 completion (inventory tracking) for feasibility checking functionality.

**Story 4.1: Smart Print Queue Management**
As a 3D printing business owner,
I want a print queue that helps me optimize printer utilization and batch efficiency,
so that I can maximize productive printing time.

**Acceptance Criteria:**
1. Queue displays estimated print times and material requirements
2. Drag-and-drop reordering enables priority adjustment
3. Batch optimization suggestions group similar materials and settings
4. Print feasibility warnings prevent queue items that exceed inventory
5. Status updates (queued, printing, completed, failed) track progress accurately

**Dependencies**: Requires Epic 2 Story 2.4 (search) and Epic 3 Story 3.1 (inventory) completion.

**Technical Requirements:**
- Uses PrintJobSchema and queue API from architecture specification
- Feasibility checking integrates with FilamentInventory via live queries
- Drag-and-drop follows frontend UI specification patterns
- Queue optimization uses print duration and material grouping algorithms
- Status updates trigger inventory consumption via Epic 2 Story 2.2

**Story 4.2: Sales Velocity Analytics and Restocking Intelligence**
As a 3D printing business owner,
I want to see which variants sell fastest and receive automatic restock recommendations,
so that I can focus production on profitable items and avoid stockouts.

**Acceptance Criteria:**
1. Sales velocity metrics track movement rates for each variant
2. Trending analysis identifies seasonal patterns and market preferences
3. Automated restock recommendations consider sales history and current inventory
4. Slow-moving inventory alerts help optimize product mix
5. Performance dashboards enable quick decision-making

**Dependencies**: Requires Story 4.1 completion and Epic 3 Story 3.3 (shopping lists).

**Technical Requirements:**
- Analytics dashboard follows frontend design system specifications
- Performance metrics stored using database performance monitoring patterns
- Trending analysis uses PostgreSQL time series queries
- Integration with shopping list generation from Epic 2
- Dashboard follows responsive design strategy from frontend spec

**Story 4.3: Market Event Planning and Themed Inventory**
As a 3D printing business owner,
I want to plan production for specific market events with themed inventory recommendations,
so that I can optimize my product mix for each sales opportunity.

**Acceptance Criteria:**
1. Event planning interface allows theme assignment (Christmas, Spring, etc.)
2. Product recommendations based on historical performance for similar events
3. Inventory preparation checklists ensure adequate stock levels
4. Production scheduling coordinates printing timeline with event dates
5. Event performance tracking informs future planning decisions

**Dependencies**: Requires Stories 4.1 and 4.2 completion.

**Technical Requirements:**
- Uses MarketEvents entity from database schema
- Event planning interface follows frontend workflow specifications
- Historical performance analysis uses analytics from Story 4.2
- Production scheduling integrates with print queue from Story 4.1
- Inventory checking uses Epic 3 inventory intelligence

## Post-MVP Features (Deferred)

### Epic 5: Advanced Intelligence and Optimization

**Epic Goal**: Establish foundation for learning algorithms that optimize printing success through version tracking and failure analysis.

**Status**: POST-MVP - Deferred until after core business value delivery

**Dependencies**: Requires Epic 4 completion for production data and analytics foundation.

**Story 5.1: ModelVariant Versioning System**
As a 3D printing business owner,
I want to track different versions of my model variants with success/failure rates,
so that I can identify optimal slicer settings over time.

**Acceptance Criteria:**
1. Version creation allows uploading updated sliced files with change documentation
2. Success/failure tracking provides statistical analysis of variant performance
3. Setting comparisons highlight differences between versions
4. Performance trends guide future slicer parameter decisions
5. Best practice recommendations emerge from successful version patterns

**Dependencies**: Requires Epic 2 metadata extraction and Epic 4 print tracking completion.

**Technical Requirements:**
- Version tracking extends ModelVariant schema with version field
- Success/failure data collected from Epic 3 print queue status updates
- Metadata comparison uses BambuMetadata schema difference analysis
- Statistical analysis uses PostgreSQL analytics functions
- Performance recommendations generated from success pattern analysis

**Story 5.2: Manufacturing Cost Analysis**
As a 3D printing business owner,
I want accurate manufacturing cost calculations for each variant,
so that I can price products appropriately and identify profit opportunities.

**Acceptance Criteria:**
1. Cost calculations include filament usage, electricity, and depreciation estimates
2. Batch production costs enable volume pricing strategies
3. Profit margin analysis guides product portfolio decisions
4. Cost tracking over time identifies efficiency improvements
5. Competitive cost analysis supports market positioning

**Dependencies**: Requires Epic 3 inventory cost tracking and Epic 4 production analytics.

**Technical Requirements:**
- Cost calculations use filament usage from BambuMetadata and inventory costs
- Manufacturing cost analysis integrates with Epic 2 consumption tracking
- Cost data stored in costToProduceUsd field per architecture
- Batch cost calculations use Epic 3 production optimization data
- Cost tracking analysis uses time series data from production history

## Cross-Epic Dependencies Summary

**Updated Epic Sequencing Requirements (Post-PO Review):**
1. **Epic 0** → Foundation (Infrastructure, Auth, CI/CD, External Services) - Must complete entirely
2. **Epic 1** → User Management & Authentication - Must complete before any business features
3. **Epic 2** → Digital Asset Management - Requires Epic 1 completion, must complete Story 2.3c before Epic 3
4. **Epic 3** → Inventory Intelligence - Requires Epic 2 Story 2.3c completion, must complete Story 3.1 before Epic 4
5. **Epic 4** → Production Optimization - Requires Epic 2 Story 2.4 and Epic 3 Story 3.1 completion
6. **Epic 5** → POST-MVP (Advanced Intelligence) - Deferred until after core business value delivery

**Critical Path Dependencies:**
- Epic 0 (Foundation + Auth + CI/CD) → Epic 1 (User Management)
- Epic 1 (User Management) → Epic 2 (File Management with User Isolation)
- Epic 2 Story 2.3c (Metadata) → Epic 3 Story 3.1 (Filament Inventory)
- Epic 3 Story 3.1 (Inventory) → Epic 4 Story 4.1 (Queue Feasibility)
- Epic 2 Story 2.4 (Search) + Epic 3 Story 3.1 (Inventory) → Epic 4 Production Features

## Technical Implementation

### Technology Stack
- **Frontend Framework**: Tanstack Start (React-based full-stack framework)
- **Styling**: TailwindCSS for responsive design
- **Database**: PostgreSQL with PrismaORM and Tanstack DB
- **Authentication**: JWT tokens with secure session management (Clerk or Auth0)
- **State Management**: Tanstack Query for server state, Tanstack Form for form handling
- **UI Components**: React Aria for accessible component primitives
- **Database Hosting**: Xata (staging/production), Docker PostgreSQL (local development)
- **File Storage**: Cloudflare R2 for model and sliced files with user isolation
- **Email Service**: SendGrid or AWS SES for transactional emails
- **Monitoring**: Error tracking (Sentry) and performance monitoring
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Development**: Docker for local environment consistency

### Database Schema Design

**Core Entities:**
- **Users**: User accounts with authentication and business profile information
- **Models**: Base 3D designs with designer attribution and categorization (user-isolated)
- **ModelVariants**: Specific configurations with slicer settings and file references (user-isolated)
- **FilamentInventory**: Stock tracking with precise material/color specifications (user-isolated)
- **ProductInventory**: Finished goods and accessories inventory (user-isolated)
- **PrintJobs**: Queue management and production tracking (user-isolated)
- **MarketEvents**: Event planning and themed inventory management (user-isolated)

**Key Relationships:**
- User (1:N) Models - user owns multiple models
- User (1:N) FilamentInventory - user-specific inventory tracking
- User (1:N) PrintJobs - user-specific print queue
- Model (1:N) ModelVariant - hierarchical organization
- ModelVariant (1:1) SlicedFile - direct file association
- ModelVariant (M:N) FilamentInventory - material requirements mapping
- PrintJob (M:1) ModelVariant - production queue relationships

### File Processing Architecture
- **Upload Pipeline**: Direct-to-R2 uploads with progress tracking
- **Metadata Extraction**: Server-side processing of .gcode/.3mf archives
- **Image Processing**: Automatic thumbnail generation and storage
- **Backup Strategy**: Automated versioning and disaster recovery

### Security and Compliance
- **Authentication**: JWT-based authentication with secure session management
- **Data Protection**: Industry-standard encryption for sensitive business data with user isolation
- **Access Control**: Row-level security ensuring complete user data isolation
- **File Security**: User-specific file storage paths with signed URL access control
- **Audit Logging**: Complete activity tracking for business operations with user context
- **Privacy Compliance**: GDPR-compliant data handling and retention policies with user data export/deletion
- **API Security**: Rate limiting and quota management per user with tRPC middleware validation

This PRD provides the comprehensive foundation needed for the UX Expert to create detailed interface specifications and the Architect to design the complete technical implementation. The requirements balance immediate operational needs with future scalability and intelligence features.
