# Development Agent Handoff: Epic 0 Story Sequence Correction

**Date**: 2025-10-02
**From**: Sarah (Product Owner)
**To**: Development Agent (James)
**Change Type**: Administrative Documentation Correction
**Priority**: Medium
**Estimated Effort**: 15-30 minutes

---

## Executive Summary

Epic 0 has a story numbering regression that needs correction. Stories 0.6 and 0.7 need to be swapped to fix logical dependency sequencing. This is a documentation-only change with zero functional impact.

**What's Wrong**:
- Story 0.6 is currently "CI/CD Pipeline" but should be "External Services"
- Story 0.7 is currently "External Services" but should be "CI/CD Pipeline"
- Epic 2 references "Story 0.7 (External Services)" but Story 0.7 is actually CI/CD
- After swap, all dependency references will be correct

**What to Do**: Swap the story files, update their status fields, rename the QA gate file, and update documentation references.

---

## Required Changes (7 Files)

### 1. Story File Swaps (2 files)

#### File 1: CI/CD Story (0.6 → 0.7)

**Current**: `docs/stories/0.6.ci-cd-pipeline-deployment-infrastructure.md`
**New**: `docs/stories/0.7.ci-cd-pipeline-deployment-infrastructure.md`

**Command**:
```bash
git mv docs/stories/0.6.ci-cd-pipeline-deployment-infrastructure.md docs/stories/0.7.ci-cd-pipeline-deployment-infrastructure.md
```

**Content Edit**: Change status from "Done" to "Not Started"
- **Line 5**: Change `Done` to `Not Started`

---

#### File 2: External Services Story (0.7 → 0.6)

**Current**: `docs/stories/0.7.external-service-integration-planning.story.md`
**New**: `docs/stories/0.6.external-service-integration-planning.md`

**Command**:
```bash
git mv docs/stories/0.7.external-service-integration-planning.story.md docs/stories/0.6.external-service-integration-planning.md
```

**Content Edit**: Update status to "Done" (verify current status first)
- Find the status field and set to `Done`

---

### 2. QA Gate File Rename (1 file)

**Current**: `docs/qa/gates/0.6-ci-cd-pipeline-deployment-infrastructure.yml`
**New**: `docs/qa/gates/0.7-ci-cd-pipeline-deployment-infrastructure.yml`

**Command**:
```bash
git mv docs/qa/gates/0.6-ci-cd-pipeline-deployment-infrastructure.yml docs/qa/gates/0.7-ci-cd-pipeline-deployment-infrastructure.yml
```

---

### 3. PRD Main Document (1 file)

**File**: `docs/prd.md`

**Edit 1 (Line 237)**:
```markdown
# OLD
**Story 0.6: CI/CD Pipeline and Deployment Infrastructure**

# NEW
**Story 0.6: External Service Integration Planning**
```

**Edit 2 (Line 259)**:
```markdown
# OLD
**Story 0.7: External Service Integration Planning**

# NEW
**Story 0.7: CI/CD Pipeline and Deployment Infrastructure**
```

---

### 4. PRD User Stories Document (1 file)

**File**: `docs/prd/user-stories.md`

**Edit 1 (Line 122)**:
```markdown
# OLD
**Story 0.6: CI/CD Pipeline and Deployment Infrastructure**

# NEW
**Story 0.6: External Service Integration Planning**
```

**Edit 2 (Line 146)**:
```markdown
# OLD
**Story 0.7: External Service Integration Planning**

# NEW
**Story 0.7: CI/CD Pipeline and Deployment Infrastructure**
```

---

### 5. Architecture Documentation (1 file)

**File**: `docs/architecture/source-tree.md`

**Edit (Line 148)**:
```
# OLD
│   └── 0.6.cicd-pipeline-deployment.md

# NEW
│   └── 0.7.cicd-pipeline-deployment.md
```

---

### 6. Verification Task

**Check**: Does Story 0.6 (new External Services) have a QA gate file?
- Search for: `docs/qa/gates/0.6-external-service*` or similar
- If not found, note in commit message that it may need creation later

---

## Step-by-Step Execution Plan

### Step 1: Rename Story Files (Preserve Git History)
```bash
# Rename CI/CD story (0.6 → 0.7)
git mv docs/stories/0.6.ci-cd-pipeline-deployment-infrastructure.md docs/stories/0.7.ci-cd-pipeline-deployment-infrastructure.md

# Rename External Services story (0.7 → 0.6)
git mv docs/stories/0.7.external-service-integration-planning.story.md docs/stories/0.6.external-service-integration-planning.md
```

### Step 2: Update Story Status Fields
**File**: `docs/stories/0.7.ci-cd-pipeline-deployment-infrastructure.md`
- Line 5: Change `Done` → `Not Started`

**File**: `docs/stories/0.6.external-service-integration-planning.md`
- Find status field and ensure it says `Done`

### Step 3: Rename QA Gate File
```bash
git mv docs/qa/gates/0.6-ci-cd-pipeline-deployment-infrastructure.yml docs/qa/gates/0.7-ci-cd-pipeline-deployment-infrastructure.yml
```

### Step 4: Update PRD Main Document
**File**: `docs/prd.md`
- Line 237: Update story heading (0.6: CI/CD → External Services)
- Line 259: Update story heading (0.7: External Services → CI/CD)

### Step 5: Update PRD User Stories Document
**File**: `docs/prd/user-stories.md`
- Line 122: Update story heading (0.6: CI/CD → External Services)
- Line 146: Update story heading (0.7: External Services → CI/CD)

### Step 6: Update Architecture Documentation
**File**: `docs/architecture/source-tree.md`
- Line 148: Update file listing (0.6 → 0.7)

### Step 7: Verification
Run these checks to ensure no broken references:
```bash
# Check for any remaining incorrect references
grep -r "Story 0\.6.*CI/CD" docs/
grep -r "Story 0\.7.*External Service" docs/

# Verify file existence
ls -la docs/stories/0.6.external-service-integration-planning.md
ls -la docs/stories/0.7.ci-cd-pipeline-deployment-infrastructure.md
ls -la docs/qa/gates/0.7-ci-cd-pipeline-deployment-infrastructure.yml
```

### Step 8: Commit Changes
```bash
git add -A
git commit -m "DOCS: Fix Epic 0 story sequence (swap 0.6 and 0.7)

- Rename Story 0.6 (CI/CD) → Story 0.7, mark as Not Started
- Rename Story 0.7 (External Services) → Story 0.6, mark as Done
- Update PRD and architecture documentation references
- Rename QA gate file to match new story numbering

This corrects the logical dependency ordering where Epic 2
correctly depends on Story 0.7 (External Services) for R2
bucket configuration.

Sprint Change Proposal: Epic 0 Story Sequence Correction
Prepared by: Sarah (Product Owner)
Date: 2025-10-02"
```

---

## Success Criteria

Verify these conditions after implementation:

✅ **Story 0.6** correctly refers to "External Service Integration Planning" (Status: Done)
✅ **Story 0.7** correctly refers to "CI/CD Pipeline and Deployment Infrastructure" (Status: Not Started)
✅ **Epic 2 dependencies** reference "Story 0.7 (External Services)" and it's now semantically correct
✅ **All documentation** cross-references updated (PRD, user stories, architecture)
✅ **No broken links** or file references
✅ **Git history preserved** through proper git mv operations
✅ **QA gate file** renamed to match new story number

---

## Important Notes

1. **Use git mv**: This preserves file history properly in version control
2. **Verify before committing**: Run the verification checks in Step 7
3. **This improves documentation**: The swap actually fixes an existing logical error where Epic 2's dependency references were incorrect
4. **Zero functional impact**: This is documentation-only, no code changes
5. **Low risk**: Changes are easily reversible if issues arise

---

## Questions or Issues?

If you encounter any issues during implementation:
1. Check the Sprint Change Proposal document for detailed context
2. Contact Sarah (Product Owner) for clarification
3. Document any unexpected findings in the commit message

---

**Ready for Implementation**: Yes
**Approval Status**: Approved by Product Owner
**Handoff Complete**: 2025-10-02
