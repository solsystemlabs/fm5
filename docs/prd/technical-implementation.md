# Technical Implementation

## Technology Stack

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
