# FM5 Application Operations Runbook

This runbook provides step-by-step procedures for common operational tasks, troubleshooting, and incident response for the FM5 application.

## Table of Contents

- [Emergency Response](#emergency-response)
- [Incident Response](#incident-response)
- [Common Operations](#common-operations)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Database Operations](#database-operations)
- [Performance Troubleshooting](#performance-troubleshooting)
- [Security Incidents](#security-incidents)
- [Maintenance Procedures](#maintenance-procedures)

## Emergency Response

### Emergency Contacts

| Role | Contact | Phone | Email |
|------|---------|-------|-------|
| On-Call Engineer | Primary | +1-555-0123 | oncall@yourcompany.com |
| Backup On-Call | Secondary | +1-555-0124 | backup@yourcompany.com |
| DevOps Lead | Alice Smith | +1-555-0125 | alice@yourcompany.com |
| CTO | Bob Johnson | +1-555-0126 | bob@yourcompany.com |

### Severity Levels

- **P0 (Critical)**: Complete service outage, security breach
- **P1 (High)**: Significant service degradation, partial outage
- **P2 (Medium)**: Minor service issues, performance degradation
- **P3 (Low)**: Cosmetic issues, non-critical bugs

### Emergency Escalation Process

1. **P0/P1 Incidents**: Immediate response required
   - Page on-call engineer immediately
   - Create incident channel: `#incident-YYYY-MM-DD-###`
   - Notify stakeholders within 15 minutes
   - Post status updates every 30 minutes

2. **P2 Incidents**: Response within 2 hours
   - Create ticket in issue tracker
   - Notify team via Slack
   - Investigate during business hours

3. **P3 Incidents**: Response within 24 hours
   - Create ticket for next sprint
   - No immediate escalation required

## Incident Response

### Initial Response Checklist

- [ ] Assess severity level
- [ ] Create incident channel
- [ ] Assign incident commander
- [ ] Gather initial information
- [ ] Post status page update
- [ ] Begin investigation

### Investigation Process

1. **Check application health:**
   ```bash
   curl -f https://yourapp.com/api/health
   ```

2. **Check infrastructure status:**
   ```bash
   # AWS resources
   aws ecs describe-services --cluster fm5-production --services fm5-app
   aws rds describe-db-instances --db-instance-identifier fm5-production-db
   
   # Container status
   docker ps -a
   ```

3. **Review recent changes:**
   ```bash
   # Git log
   git log --oneline -10
   
   # Container images
   docker images fm5 --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"
   ```

4. **Check logs:**
   ```bash
   # Application logs
   docker-compose logs --tail=100 app
   
   # System logs
   journalctl -u docker -f
   ```

### Communication Templates

#### Incident Start
```
🚨 INCIDENT ALERT - P[SEVERITY]

Service: FM5 Application
Issue: [Brief description]
Impact: [User impact]
Start Time: [UTC timestamp]
Incident Commander: @[username]

Investigation in progress...
Updates every 30 minutes.

Status Page: https://status.yourapp.com
```

#### Status Update
```
📊 INCIDENT UPDATE - P[SEVERITY]

Time: [UTC timestamp]
Status: [Investigating/Identified/Monitoring/Resolved]

Current actions:
- [Action 1]
- [Action 2]

Next update in 30 minutes.
```

#### Resolution
```
✅ INCIDENT RESOLVED - P[SEVERITY]

Resolution Time: [UTC timestamp]
Duration: [Total time]
Root Cause: [Brief explanation]

Post-mortem scheduled for [date/time].
Thank you for your patience.
```

## Common Operations

### Application Deployment

#### Standard Deployment
```bash
# 1. Build and test
npm run test:all
npm run build

# 2. Build Docker image
docker build -t fm5:$(date +%Y%m%d-%H%M%S) .

# 3. Tag for registry
docker tag fm5:$(date +%Y%m%d-%H%M%S) your-registry/fm5:latest

# 4. Push to registry
docker push your-registry/fm5:latest

# 5. Deploy to production
aws ecs update-service --cluster fm5-production --service fm5-app --force-new-deployment

# 6. Verify deployment
curl -f https://yourapp.com/api/health
```

#### Rollback Deployment
```bash
# 1. Get previous task definition
aws ecs describe-services --cluster fm5-production --services fm5-app

# 2. Rollback to previous revision
aws ecs update-service --cluster fm5-production --service fm5-app --task-definition fm5-app:[PREVIOUS_REVISION]

# 3. Verify rollback
curl -f https://yourapp.com/api/health
```

### Database Operations

#### Database Migration
```bash
# 1. Backup database
./scripts/backup.sh

# 2. Run migration in dry-run mode
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma

# 3. Apply migration
npx prisma migrate deploy

# 4. Verify migration
npx prisma db push --accept-data-loss --skip-generate
```

#### Database Backup
```bash
# Manual backup
./scripts/backup.sh

# Verify backup
ls -la /var/backups/postgres/

# Test restore (on staging)
./scripts/restore.sh backup_file.sql.gz
```

### Scaling Operations

#### Scale Up Application
```bash
# ECS Fargate
aws ecs update-service --cluster fm5-production --service fm5-app --desired-count 5

# Docker Compose
docker-compose up -d --scale app=3
```

#### Scale Down Application
```bash
# ECS Fargate
aws ecs update-service --cluster fm5-production --service fm5-app --desired-count 2

# During maintenance window only
docker-compose up -d --scale app=1
```

## Monitoring and Alerting

### Key Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| Response Time (95th percentile) | > 2000ms | Investigate performance |
| Error Rate | > 5% | Check logs and recent changes |
| Memory Usage | > 85% | Scale up or investigate leaks |
| CPU Usage | > 80% | Scale up |
| Disk Usage | > 90% | Clean up or expand storage |
| Database Connections | > 80% | Investigate connection leaks |

### Alert Response Procedures

#### High Error Rate Alert
```bash
# 1. Check application logs
docker-compose logs --tail=100 app | grep ERROR

# 2. Check recent deployments
git log --oneline -5

# 3. Check external dependencies
curl -f https://api.stripe.com/v1/charges
curl -f https://api.sendgrid.com/v3/mail/send

# 4. If recent deployment, consider rollback
```

#### High Memory Usage Alert
```bash
# 1. Check current memory usage
docker stats fm5_app

# 2. Check for memory leaks
docker exec fm5_app node --expose-gc -e "global.gc(); console.log(process.memoryUsage());"

# 3. Restart application if necessary
docker-compose restart app

# 4. Scale up if persistent
aws ecs update-service --cluster fm5-production --service fm5-app --desired-count 3
```

#### Database Connection Alert
```bash
# 1. Check current connections
docker exec postgres psql -U username -d database -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Check for long-running queries
docker exec postgres psql -U username -d database -c "SELECT query, state, query_start FROM pg_stat_activity WHERE state = 'active' ORDER BY query_start;"

# 3. Kill problematic queries if necessary
docker exec postgres psql -U username -d database -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query_start < now() - interval '5 minutes';"
```

### Health Check Failures

#### Application Health Check Failure
```bash
# 1. Check application status
curl -v https://yourapp.com/api/health

# 2. Check container status
docker ps -a | grep fm5

# 3. Check application logs
docker-compose logs --tail=50 app

# 4. Restart if necessary
docker-compose restart app
```

#### Database Health Check Failure
```bash
# 1. Check database connectivity
docker exec postgres pg_isready -U username

# 2. Check database logs
docker-compose logs --tail=50 postgres

# 3. Check disk space
df -h

# 4. Restart database if necessary (CAREFUL!)
docker-compose restart postgres
```

## Performance Troubleshooting

### Slow Response Times

#### Investigation Steps
```bash
# 1. Check current load
htop
docker stats

# 2. Analyze slow queries
docker exec postgres psql -U username -d database -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 3. Check cache hit ratio
docker exec redis redis-cli info stats

# 4. Analyze application metrics
curl https://yourapp.com/api/metrics | grep http_request_duration
```

#### Optimization Actions
```bash
# 1. Clear application cache
docker exec redis redis-cli FLUSHALL

# 2. Restart application pools
docker-compose restart app

# 3. Optimize database
docker exec postgres psql -U username -d database -c "VACUUM ANALYZE;"

# 4. Scale horizontally if needed
aws ecs update-service --cluster fm5-production --service fm5-app --desired-count 3
```

### High CPU Usage

```bash
# 1. Identify CPU-intensive processes
docker exec fm5_app top -p 1

# 2. Check for infinite loops in logs
docker-compose logs app | grep -E "(loop|while|for)" | tail -20

# 3. Profile application (if tools available)
docker exec fm5_app node --prof app.js

# 4. Scale up if legitimate load
aws ecs update-service --cluster fm5-production --service fm5-app --desired-count 3
```

### Memory Leaks

```bash
# 1. Monitor memory over time
while true; do docker stats --no-stream fm5_app | grep fm5_app; sleep 60; done

# 2. Force garbage collection
docker exec fm5_app node -e "global.gc(); console.log('GC forced');"

# 3. Restart application
docker-compose restart app

# 4. Investigate in staging environment
# Enable heap snapshots and analyze with development tools
```

## Security Incidents

### Suspected Security Breach

#### Immediate Actions
```bash
# 1. Preserve evidence
docker exec fm5_app cp /var/log/app.log /tmp/evidence-$(date +%Y%m%d-%H%M%S).log

# 2. Check for suspicious activity
docker-compose logs app | grep -E "(401|403|429|500)" | tail -100

# 3. Review user sessions
docker exec postgres psql -U username -d database -c "SELECT * FROM sessions WHERE created_at > now() - interval '1 hour';"

# 4. Change critical passwords
# Update database passwords, API keys, etc.
```

#### Investigation Steps
```bash
# 1. Check access logs
tail -1000 /var/log/nginx/access.log | grep -E "(POST|PUT|DELETE)"

# 2. Review authentication events
docker-compose logs app | grep "auth"

# 3. Check for data exfiltration
docker-compose logs app | grep -E "(export|download|backup)"

# 4. Analyze network traffic
netstat -an | grep :3000
```

### DDoS Attack

```bash
# 1. Check current connections
netstat -an | grep :443 | wc -l

# 2. Identify attack sources
tail -1000 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -20

# 3. Implement emergency rate limiting
# Update NGINX configuration with stricter limits

# 4. Contact CDN provider to enable DDoS protection
# CloudFlare, AWS Shield, etc.
```

## Maintenance Procedures

### Scheduled Maintenance

#### Pre-Maintenance Checklist
- [ ] Announce maintenance window
- [ ] Create database backup
- [ ] Verify rollback procedures
- [ ] Prepare incident response team
- [ ] Update status page

#### Maintenance Steps
```bash
# 1. Enable maintenance mode
docker-compose -f docker-compose.maintenance.yml up -d

# 2. Backup database
./scripts/backup.sh

# 3. Perform maintenance tasks
npm run migrate
docker-compose pull
docker-compose up -d

# 4. Verify system health
curl -f https://yourapp.com/api/health

# 5. Disable maintenance mode
docker-compose -f docker-compose.prod.yml up -d
```

### SSL Certificate Renewal

```bash
# 1. Check certificate expiration
openssl x509 -in /etc/ssl/certs/domain.crt -text -noout | grep "Not After"

# 2. Renew Let's Encrypt certificate
certbot renew --dry-run
certbot renew

# 3. Reload NGINX
docker-compose exec nginx nginx -s reload

# 4. Verify new certificate
curl -vI https://yourapp.com 2>&1 | grep "expire date"
```

### Log Rotation and Cleanup

```bash
# 1. Check disk usage
df -h
du -sh /var/log/*

# 2. Rotate logs
docker-compose exec app logrotate /etc/logrotate.conf

# 3. Clean old backups
find /var/backups -name "*.sql.gz" -mtime +30 -delete

# 4. Clean Docker resources
docker system prune -f
docker volume prune -f
```

### Database Maintenance

```bash
# 1. Update statistics
docker exec postgres psql -U username -d database -c "ANALYZE;"

# 2. Vacuum database
docker exec postgres psql -U username -d database -c "VACUUM VERBOSE;"

# 3. Reindex if necessary
docker exec postgres psql -U username -d database -c "REINDEX DATABASE database;"

# 4. Check database size
docker exec postgres psql -U username -d database -c "SELECT pg_size_pretty(pg_database_size('database'));"
```

## Post-Incident Procedures

### Post-Mortem Process

1. **Schedule post-mortem meeting** within 24-48 hours
2. **Gather timeline** of events and actions taken
3. **Identify root cause** and contributing factors
4. **Document lessons learned** and action items
5. **Implement preventive measures** to avoid recurrence

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

## Summary
- **Date**: YYYY-MM-DD
- **Duration**: X hours Y minutes
- **Severity**: P[0-3]
- **Impact**: [Description of user impact]

## Timeline
- **HH:MM** - [Event description]
- **HH:MM** - [Action taken]

## Root Cause
[Detailed analysis of what caused the incident]

## Action Items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]

## Lessons Learned
- [Lesson 1]
- [Lesson 2]
```

## Reference Links

- [Application Health Dashboard](https://grafana.yourapp.com)
- [Log Aggregation](https://logs.yourapp.com)
- [Status Page](https://status.yourapp.com)
- [Infrastructure Monitoring](https://cloudwatch.console.aws.amazon.com)
- [Error Tracking](https://sentry.io/organizations/yourorg/projects/fm5/)
- [CI/CD Pipeline](https://github.com/your-org/fm5/actions)

---

**Last Updated**: $(date +%Y-%m-%d)
**Version**: 1.0
**Owner**: DevOps Team