# Technical Implementation

## Technology Stack

- **Frontend Framework**: Tanstack Start (React-based full-stack framework)
- **Styling**: TailwindCSS for responsive design
- **Database**: PostgreSQL with PrismaORM and Tanstack DB
- **Authentication**: BetterAuth with JWT tokens and secure session management
- **State Management**: Tanstack Query for server state, Tanstack Form for form handling
- **UI Components**: React Aria for accessible component primitives
- **Database Hosting**: Xata PostgreSQL (staging/production), Docker PostgreSQL (local development)
- **File Storage**: Cloudflare R2 for model and sliced files with user isolation
- **Email Service**: Resend for transactional emails
- **Deployment Platform**: Cloudflare Workers for serverless edge deployment
- **Monitoring**: Cloudflare Analytics and error tracking with performance monitoring
- **CI/CD**: GitHub Actions with Wrangler deployment to staging and production Workers
- **Development**: Docker for local environment consistency

## Deployment Infrastructure

### Cloud Architecture

- **Deployment Platform**: Cloudflare Workers for global edge deployment with automatic scaling
- **Database Production**: Xata PostgreSQL with generous free tier and built-in REST API
- **File Storage**: Cloudflare R2 object storage with native Workers integration
- **Email Service**: Resend for reliable transactional email delivery
- **Infrastructure as Code**: Wrangler CLI for complete deployment lifecycle management

### Environment Strategy

- **Development**: Local Docker environment with PostgreSQL, Redis, and MinIO
- **Staging**: Cloudflare Worker with Xata staging database and R2 staging bucket
- **Production**: Cloudflare Worker with Xata production database and R2 production bucket
- **Environment Isolation**: Complete separation of data and configurations between environments

### Testing Environment Strategy

- **Local Testing**: Uses Docker PostgreSQL container for consistent local development testing
- **CI/CD Testing**: Uses Xata test database branch to match production database technology
- **Environment Detection**: Test configuration automatically detects CI environment and selects appropriate database
- **Database Isolation**: Local and CI test databases are completely isolated from development/staging/production data

### CI/CD Pipeline

- **Automated Testing**: GitHub Actions runs unit, integration, and security tests on all pull requests
- **Staging Deployment**: Automatic deployment to staging Worker on main branch commits
- **Production Deployment**: Manual promotion from staging to production via GitHub Actions
- **Rollback Strategy**: Wrangler rollback commands and version-based deployment recovery

### Operational Excellence

- **Monitoring**: Cloudflare Analytics for performance metrics and error tracking
- **Health Checks**: Automated endpoint monitoring for database and storage connectivity
- **Security**: Environment variable encryption, API key rotation, and secure secrets management
- **Cost Optimization**: Leverage free tiers and pay-per-use pricing for cost-effective scaling

### Integration Points

- **Authentication**: BetterAuth configured for Xata PostgreSQL and Cloudflare Workers runtime
- **File Processing**: Direct R2 integration with Workers for efficient file operations
- **Email Delivery**: Resend HTTP API integration optimized for serverless environment
- **Database Access**: Xata HTTP API eliminating connection pooling complexity

## Database Schema Design

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

## File Processing Architecture

- **Upload Pipeline**: Direct-to-R2 uploads with progress tracking
- **Metadata Extraction**: Server-side processing of .gcode/.3mf archives
- **Image Processing**: Automatic thumbnail generation and storage
- **Backup Strategy**: Automated versioning and disaster recovery

## Security and Compliance

- **Authentication**: JWT-based authentication with secure session management
- **Data Protection**: Industry-standard encryption for sensitive business data with user isolation
- **Access Control**: Row-level security ensuring complete user data isolation
- **File Security**: User-specific file storage paths with signed URL access control
- **Audit Logging**: Complete activity tracking for business operations with user context
- **Privacy Compliance**: GDPR-compliant data handling and retention policies with user data export/deletion
- **API Security**: Rate limiting and quota management per user with tRPC middleware validation

This PRD provides the comprehensive foundation needed for the UX Expert to create detailed interface specifications and the Architect to design the complete technical implementation. The requirements balance immediate operational needs with future scalability and intelligence features.
