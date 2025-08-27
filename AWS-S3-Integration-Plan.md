# AWS S3 Integration Plan for FM5 Manager

## Project Context
**Application**: FM5 Manager - 3D printing management system
**Framework**: TanStack Start (React full-stack) with TypeScript
**Database**: PostgreSQL with Prisma ORM
**Current Status**: Phase 1-4 of SlicedFile enhancement complete (database schema, 3MF parsing, API, and UI)

## Current Implementation Status
- ✅ **Database Schema**: Enhanced SlicedFile model with 15+ metadata fields
- ✅ **3MF Parser**: Comprehensive metadata extraction from 3MF files (`src/lib/3mf-parser.ts`)
- ✅ **API Endpoints**: GET/POST at `/api/sliced-files` with full metadata processing
- ✅ **UI Components**: Complete file management interface with upload, table, and cost estimation
- ❌ **File Storage**: Currently uses in-memory processing, no persistent storage

## Current File Upload Flow
1. User uploads 3MF file via drag-and-drop UI (`src/components/dialogs/Upload3MFDialog.tsx`)
2. File sent to POST `/api/sliced-files` endpoint (`src/routes/api/sliced-files.ts`)
3. File validated and parsed for metadata in-memory
4. Metadata stored in database with user-provided URL (no actual file storage)

## S3 Integration Goal
Replace current URL-only approach with actual S3 file storage using hierarchical organization.

---

## Implementation Plan

### Phase 1: AWS SDK Setup & Configuration

#### 1.1 Install Dependencies
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install --save-dev @types/node
```

#### 1.2 Environment Variables
Add to `.env`:
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-company-bucket

# Project Configuration  
PROJECT_NAME=fm5-manager
NODE_ENV=dev  # or prod

# Optional CDN
AWS_S3_BASE_URL=https://your-cloudfront-domain.com
```

#### 1.3 Create S3 Service Module
**File**: `src/lib/s3-service.ts`
```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// S3 Key Structure: {PROJECT_NAME}/slicedFiles/{ENVIRONMENT}/model-{MODEL_ID}/{filename}
const generateS3Key = (modelId: number, filename: string): string => {
  const projectName = process.env.PROJECT_NAME || 'fm5-manager';
  const environment = process.env.NODE_ENV || 'dev';
  const sanitizedFilename = sanitizeFilename(filename);
  
  return `${projectName}/slicedFiles/${environment}/model-${modelId}/${sanitizedFilename}`;
};
```

### Phase 2: Database Schema Update

#### 2.1 Prisma Schema Changes
**File**: `prisma/schema.prisma`

Add to SlicedFile model:
```prisma
model SlicedFile {
  // ... existing fields ...
  url         String    // S3 URL (existing field, now stores S3 URLs)
  s3Key       String?   // NEW: S3 object key for file management
  // ... rest of existing fields ...
}
```

#### 2.2 Database Migration
```bash
npx prisma migrate dev --name add_s3_key_to_sliced_file
```

### Phase 3: Backend API Enhancement

#### 3.1 Update Upload Endpoint
**File**: `src/routes/api/sliced-files.ts`

**Current flow to modify**:
```typescript
// BEFORE (line 85):
const buffer = Buffer.from(await file.arrayBuffer());

// AFTER: Add S3 upload before metadata parsing
const s3Key = generateS3Key(validation.data.modelId, file.name);
const s3Url = await uploadToS3(file, s3Key);
const buffer = Buffer.from(await file.arrayBuffer());
```

**Database changes**:
```typescript
// Update SlicedFile creation (around line 103):
const slicedFile = await tx.slicedFile.create({
  data: {
    // ... existing fields ...
    url: s3Url,        // Store S3 URL instead of user URL
    s3Key: s3Key,      // Store S3 key for management
    // ... rest of metadata ...
  }
});
```

#### 3.2 Add Download Endpoint
**New file**: `src/routes/api/sliced-files/[id]/download.ts`
```typescript
export const ServerRoute = createServerFileRoute("/api/sliced-files/$id/download").methods({
  GET: async ({ params }) => {
    const slicedFile = await prisma.slicedFile.findUnique({
      where: { id: parseInt(params.id) }
    });
    
    const signedUrl = await generateSignedDownloadUrl(slicedFile.s3Key);
    return Response.redirect(signedUrl);
  }
});
```

### Phase 4: Frontend Updates

#### 4.1 Update Upload Dialog
**File**: `src/components/dialogs/Upload3MFDialog.tsx`

**Remove**: Manual URL input field (lines ~280-300)
**Update**: Form validation schema to remove URL requirement
**Add**: Upload progress tracking for S3 uploads

#### 4.2 Update Download Links
**File**: `src/components/tables/SlicedFilesTable.tsx`

**Change download href** (around line 215):
```typescript
// FROM:
<a href={slicedFile.url} target="_blank" rel="noopener noreferrer">

// TO:
<a href={`/api/sliced-files/${slicedFile.id}/download`} target="_blank" rel="noopener noreferrer">
```

---

## S3 File Organization Structure
```
s3://your-company-bucket/
├── fm5-manager/                    # PROJECT_NAME from env
│   └── slicedFiles/                # Fixed folder name
│       ├── dev/                    # NODE_ENV environment
│       │   ├── model-1/            # Model ID grouping
│       │   │   ├── baby-starfish-keychain.gcode.3mf
│       │   │   └── dragon-miniature.gcode.3mf
│       │   └── model-2/
│       │       └── castle-walls.gcode.3mf
│       └── prod/                   # Production environment
│           ├── model-1/
│           └── model-2/
```

## Key Implementation Requirements

### Security
- Use pre-signed URLs for downloads (1-24 hour expiration)
- Validate file types before S3 upload
- Sanitize filenames to prevent path traversal
- Configure S3 bucket to prevent direct public access

### Error Handling
- S3 upload failures should clean up partial database records
- Handle network timeouts and retry logic
- Graceful degradation for S3 service outages

### Performance
- Stream large file uploads to S3 (don't store in memory)
- Implement multipart upload for files >5MB
- Use CloudFront CDN for faster downloads

## Files to Create/Modify

### New Files
- `src/lib/s3-service.ts` - S3 client and operations
- `src/routes/api/sliced-files/[id]/download.ts` - Download endpoint
- `prisma/migrations/xxx_add_s3_key_to_sliced_file` - Database migration

### Modified Files  
- `.env` - Add AWS credentials and configuration
- `package.json` - Add AWS SDK dependencies
- `prisma/schema.prisma` - Add s3Key field
- `src/routes/api/sliced-files.ts` - Integrate S3 upload in POST method
- `src/components/dialogs/Upload3MFDialog.tsx` - Remove URL field
- `src/components/tables/SlicedFilesTable.tsx` - Update download links

## Testing Strategy
1. Test S3 upload with reference file: `/home/taylor/projects/fm5/referenceFiles/Baby_StarFish_Keychain.gcode.3mf`
2. Verify S3 key generation follows correct hierarchy
3. Test download via signed URLs
4. Confirm metadata parsing still works after S3 integration
5. Test error scenarios (network failures, invalid credentials)

## Quick Start Commands
```bash
# 1. Install dependencies
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# 2. Update .env with AWS credentials

# 3. Create and run database migration
npx prisma migrate dev --name add_s3_key_to_sliced_file

# 4. Implement s3-service.ts module

# 5. Update API endpoint for S3 integration

# 6. Test with dev server
npm run dev
```

## Success Criteria
- [ ] Files uploaded to correct S3 hierarchy
- [ ] Database stores S3 URLs and keys
- [ ] Download links generate signed URLs
- [ ] Upload UI removes manual URL input
- [ ] Existing 3MF parsing and metadata extraction unchanged
- [ ] Cost estimation and UI features continue working
- [ ] Error handling for S3 failures implemented