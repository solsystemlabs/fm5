# External Service Setup Guide
## 3D Printing Business Management Platform

### Overview
This guide outlines all external services that require **user setup** before development can begin. These are services that cannot be automated and require manual account creation, payment setup, or administrative access.

---

## 🚨 **CRITICAL: Complete ALL services before Epic 1 development begins**

### **User Responsibility Summary**
The following services require **you** (the project owner) to:
1. Create accounts manually
2. Provide payment information
3. Configure initial settings
4. Share access credentials securely with the development team

---

## **Required External Services**

### **1. Cloudflare Account & R2 Storage** ⭐ **PRIORITY 1**

**Why Required**: Primary file storage for all 3D model files, sliced files, and images.

**User Actions Required:**
1. **Create Cloudflare Account**
   - Go to https://dash.cloudflare.com/sign-up
   - Use business email address
   - Verify email address

2. **Setup R2 Storage**
   - Navigate to R2 Object Storage in Cloudflare dashboard
   - Click "Purchase R2"
   - **Payment Required**: Add payment method (R2 has usage-based pricing)
   - Create bucket named: `printmgmt-production`
   - Create bucket named: `printmgmt-staging`

3. **Generate API Credentials**
   - Go to "Manage R2 API tokens"
   - Create token with permissions:
     - `Object:Read`, `Object:Write`, `Object:Delete`
     - Apply to specific buckets created above
   - **CRITICAL**: Save the Access Key ID and Secret Access Key securely
   - Share credentials with development team via secure method

**Estimated Cost**: $0.015/GB stored + $0.36/million requests
**Setup Time**: 15-20 minutes

---

### **2. Authentication Provider (Clerk)** ⭐ **PRIORITY 1**

**Why Required**: User authentication, registration, and session management.

**User Actions Required:**
1. **Create Clerk Account**
   - Go to https://clerk.com/
   - Sign up for free account using business email
   - Verify email address

2. **Create Application**
   - Click "Add application"
   - Name: "3D Print Manager"
   - Select authentication methods:
     - ✅ Email/Password
     - ✅ Google OAuth (recommended)
     - ✅ GitHub OAuth (optional)

3. **Configure Settings**
   - **Development URLs**: `http://localhost:3000`
   - **Production URLs**: `https://yourdomain.com` (when ready)
   - **Staging URLs**: `https://staging.yourdomain.com`

4. **Get API Keys**
   - Copy "Publishable Key" and "Secret Key" from dashboard
   - **CRITICAL**: Keep Secret Key secure - never commit to code
   - Share with development team securely

**Estimated Cost**: Free for up to 10,000 monthly active users
**Setup Time**: 10-15 minutes

---

### **3. Domain Registration & DNS** ⭐ **PRIORITY 2**

**Why Required**: Production and staging website access.

**User Actions Required:**
1. **Purchase Domain**
   - Recommended registrars: Namecheap, Google Domains, or AWS Route 53
   - Choose business-appropriate domain
   - **Payment Required**: Typically $10-15/year

2. **Transfer DNS to Cloudflare** (Recommended)
   - In Cloudflare dashboard, click "Add site"
   - Enter your domain
   - Follow instructions to change nameservers at registrar
   - **Benefits**: Better performance, free SSL, integrated with R2

3. **Alternative: AWS Route 53**
   - Create hosted zone in AWS Route 53
   - Update nameservers at registrar
   - **Cost**: $0.50/month per hosted zone

**Estimated Cost**: $10-15/year domain + $0.50/month DNS (if using Route 53)
**Setup Time**: 30-45 minutes (DNS propagation can take 24-48 hours)

---

### **4. Email Service Provider** ⭐ **PRIORITY 2**

**Why Required**: User registration emails, password resets, notifications.

**Option A: SendGrid (Recommended)**
1. **Create SendGrid Account**
   - Go to https://sendgrid.com/
   - Sign up for free account
   - **Free tier**: 100 emails/day forever

2. **Domain Authentication**
   - Add your domain for sender authentication
   - Add required DNS records (CNAME records)
   - Wait for verification (can take 24-48 hours)

3. **API Key Generation**
   - Create API key with "Mail Send" permissions
   - **CRITICAL**: Store API key securely
   - Share with development team securely

**Option B: AWS SES**
1. **AWS Account Required** (see AWS section below)
2. **Domain Verification** in SES console
3. **Sending Limit Increase** (start in sandbox mode)

**Estimated Cost**: Free (SendGrid) or $0.10 per 1,000 emails (AWS SES)
**Setup Time**: 20-30 minutes + DNS verification time

---

### **5. AWS Account Setup** ⭐ **PRIORITY 1**

**Why Required**: Production hosting, database, CI/CD infrastructure.

**User Actions Required:**
1. **Create AWS Account**
   - Go to https://aws.amazon.com/
   - **Payment Required**: Valid credit card required
   - Choose "Personal" or "Business" account type
   - Complete identity verification process

2. **Initial Security Setup**
   - **CRITICAL**: Enable MFA on root account immediately
   - Create IAM user for development team
   - Set up billing alerts

3. **Service Limits**
   - Request service limit increases if needed:
     - RDS instances: Default 40 (sufficient)
     - ECS clusters: Default 10 (sufficient)
     - VPC: Default 5 (sufficient)

4. **Cost Management**
   - Set up billing alerts for $50, $100, $200 monthly spend
   - Enable detailed billing reports
   - Consider AWS Organizations if managing multiple accounts

**Estimated Cost**: Pay-as-you-use (expect $20-50/month for staging + production)
**Setup Time**: 30-45 minutes

---

### **6. GitHub Organization & Repository** ⭐ **PRIORITY 1**

**Why Required**: Source code hosting, CI/CD pipelines, team collaboration.

**User Actions Required:**
1. **Create GitHub Organization** (Recommended for business)
   - Go to https://github.com/organizations/new
   - Choose organization name (e.g., "your-business-3d-printing")
   - **Payment Required**: GitHub Team ($4/user/month) for private repos
   - Alternative: Use personal account with private repo

2. **Create Repository**
   - Repository name: `3d-printing-business-platform`
   - Set to **Private** (contains business logic)
   - Initialize with README

3. **Setup Team Access**
   - Invite development team members
   - Set appropriate permissions (Write access for developers)

4. **Configure Repository Settings**
   - Enable branch protection on `main` branch
   - Require pull request reviews
   - Enable "Delete head branches" automation

**Estimated Cost**: $4/user/month for GitHub Team (or free for public repos)
**Setup Time**: 15-20 minutes

---

### **7. Monitoring & Error Tracking (Sentry)** ⭐ **PRIORITY 3**

**Why Required**: Production error monitoring and debugging.

**User Actions Required:**
1. **Create Sentry Account**
   - Go to https://sentry.io/signup/
   - **Free tier**: 5,000 errors/month, 1 user

2. **Create Project**
   - Choose "React" as platform
   - Project name: "3D Print Manager"
   - Copy DSN (Data Source Name)

3. **Configure Alerts**
   - Set up email alerts for new issues
   - Configure Slack integration if desired

**Estimated Cost**: Free tier sufficient for MVP
**Setup Time**: 10-15 minutes

---

### **8. Container Registry (GitHub Container Registry)** ⭐ **PRIORITY 2**

**Why Required**: Store Docker images for deployment.

**User Actions Required:**
1. **Enable GitHub Packages**
   - Already included with GitHub organization
   - No additional setup required

2. **Configure Access**
   - Generate Personal Access Token with `packages:write` permission
   - Share token with development team for CI/CD setup

**Estimated Cost**: Included with GitHub Team subscription
**Setup Time**: 5 minutes

---

## **Service Setup Timeline & Dependencies**

### **Week 1 (Before Development Starts)**
1. **Day 1**: AWS Account, GitHub, Cloudflare R2
2. **Day 2**: Domain registration, DNS setup
3. **Day 3**: Clerk authentication, Sentry monitoring
4. **Day 4**: SendGrid email, final verification
5. **Day 5**: Credential sharing with development team

### **Dependencies**
- **Domain DNS** → Must complete before SSL certificate setup
- **AWS Account** → Required before infrastructure deployment
- **Cloudflare R2** → Required before Epic 2 (file management)
- **Clerk Auth** → Required before Epic 1 (user management)

---

## **Credential Sharing Process**

### **🔒 SECURE CREDENTIAL SHARING REQUIRED**

**DO NOT:**
- Email credentials in plain text
- Share via Slack/Teams
- Commit credentials to code repositories

**DO:**
1. **Use Password Manager** (1Password, Bitwarden, LastPass)
   - Create shared vault for "3D Print Manager Project"
   - Add all service credentials
   - Share vault with development team

2. **Use Encrypted Communication**
   - Signal, Keybase, or encrypted email
   - Share credentials one-time only

3. **Document Credential Locations**
   - Create secure document listing what credentials exist where
   - Update as services are added

### **Credential Checklist**
- [ ] Cloudflare R2 Access Key & Secret
- [ ] Clerk Publishable Key & Secret Key
- [ ] SendGrid API Key
- [ ] AWS Access Key & Secret (for development team IAM user)
- [ ] GitHub Personal Access Token
- [ ] Sentry DSN
- [ ] Domain registrar account access (if needed by team)

---

## **Cost Summary**

| Service | Initial Cost | Monthly Cost | Annual Cost |
|---------|-------------|--------------|-------------|
| Domain Registration | $12 | $0 | $12 |
| Cloudflare R2 | $0 | ~$5-15 | ~$60-180 |
| AWS Hosting | $0 | ~$20-50 | ~$240-600 |
| GitHub Team | $0 | $4/user | $48/user |
| Clerk Auth | $0 | $0 | $0 (free tier) |
| SendGrid | $0 | $0 | $0 (free tier) |
| Sentry | $0 | $0 | $0 (free tier) |
| **TOTAL** | **~$12** | **~$30-70** | **~$350-850** |

*Costs are estimates and may vary based on usage*

---

## **Troubleshooting Common Issues**

### **Cloudflare R2 Access Denied**
- Verify bucket names match exactly
- Check API token permissions include correct buckets
- Ensure token hasn't expired

### **Clerk Authentication Errors**
- Verify domain URLs are correctly configured
- Check that webhook URLs are accessible
- Ensure API keys are for correct environment (dev/staging/prod)

### **DNS Not Propagating**
- DNS changes can take 24-48 hours
- Use tools like https://whatsmydns.net/ to check propagation
- Clear local DNS cache if testing locally

### **AWS Billing Alerts**
- Set up billing alerts immediately after account creation
- Monitor costs daily during initial setup
- Use AWS Cost Calculator for estimates

---

## **Final Verification Checklist**

Before declaring external services "complete":

### **Account Access**
- [ ] Can log into all service dashboards
- [ ] All accounts use business email address
- [ ] MFA enabled where available
- [ ] Payment methods added and verified

### **Credential Security**
- [ ] All API keys generated and stored securely
- [ ] Credentials shared with development team via secure method
- [ ] No credentials committed to code repositories
- [ ] Backup access documented (password manager, etc.)

### **Service Configuration**
- [ ] All domains pointing to correct DNS servers
- [ ] Cloudflare R2 buckets created and accessible
- [ ] Clerk authentication configured for all environments
- [ ] SendGrid domain verification complete
- [ ] AWS billing alerts configured

### **Team Readiness**
- [ ] Development team has access to all required credentials
- [ ] Service documentation shared with team
- [ ] Emergency contact procedures established
- [ ] Cost monitoring alerts configured

---

## **Emergency Contacts & Support**

| Service | Support Method | Response Time |
|---------|----------------|---------------|
| Cloudflare | Support ticket | 24-48 hours |
| Clerk | Email/Discord | 12-24 hours |
| AWS | Support case | 12-24 hours (paid) |
| SendGrid | Support ticket | 24-48 hours |
| GitHub | Support ticket | 24-48 hours |

**Critical Issues**: For production-down scenarios, escalate through paid support channels where available.

---

*This guide ensures all external dependencies are properly configured before development begins, preventing project delays and security issues.*