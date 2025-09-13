# Technical Implementation

## Technology Stack
- **Frontend Framework**: Tanstack Start (React-based full-stack framework)  
- **Styling**: TailwindCSS for responsive design
- **Database**: PostgreSQL with PrismaORM and Tanstack DB
- **State Management**: Tanstack Query for server state, Tanstack Form for form handling
- **UI Components**: React Aria for accessible component primitives
- **Database Hosting**: Xata (staging/production), Docker PostgreSQL (local development)
- **File Storage**: Cloudflare R2 for model and sliced files
- **Development**: Docker for local environment consistency

## Database Schema Design

**Core Entities:**
- **Models**: Base 3D designs with designer attribution and categorization
- **ModelVariants**: Specific configurations with slicer settings and file references  
- **FilamentInventory**: Stock tracking with precise material/color specifications
- **ProductInventory**: Finished goods and accessories inventory
- **PrintJobs**: Queue management and production tracking
- **MarketEvents**: Event planning and themed inventory management

**Key Relationships:**
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
- **Data Protection**: Industry-standard encryption for sensitive business data
- **Access Control**: User authentication with role-based permissions  
- **Audit Logging**: Complete activity tracking for business operations
- **Privacy Compliance**: GDPR-compliant data handling and retention policies

This PRD provides the comprehensive foundation needed for the UX Expert to create detailed interface specifications and the Architect to design the complete technical implementation. The requirements balance immediate operational needs with future scalability and intelligence features.
