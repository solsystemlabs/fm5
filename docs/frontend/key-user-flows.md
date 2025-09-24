# Key User Flows

## Flow 1: Model & Variant Import Workflow (Primary Entry Point)

```
Select Files → Upload & Process → Extract Metadata → Organize & Tag → Save to Library
```

**User Actions:**

1. User drags/drops files or clicks upload (.3mf, .stl for models; .gcode/.3mf for sliced variants)
2. System processes files, extracts metadata from sliced files automatically
3. User reviews extracted data (filament colors, print settings, duration)
4. User assigns/confirms model relationships (variant belongs to which base model)
5. User adds tags, categories, and descriptive information
6. System saves files to Cloudflare R2 and creates database records

**Critical UI Requirements:**

- **Drag & Drop Zone:** Large, prominent upload area on dashboard and models page
- **Batch Processing:** Handle multiple files simultaneously with progress tracking
- **Metadata Preview:** Show extracted slicer settings before confirming
- **Smart Categorization:** Auto-suggest categories based on filename/metadata
- **Error Handling:** Clear feedback for unsupported files or processing failures
- **Relationship Mapping:** Easy interface to link variants to existing models or create new ones

**Success Criteria:**

- Upload 10 files with full metadata extraction in under 2 minutes
- 95% of slicer settings extracted correctly without manual entry
- Intuitive model-variant relationships even for complex batches
- Clear progress feedback throughout entire process

## Flow 2: Model Discovery to Print Queue

```
Search/Browse Models → Preview Variant Details → Check Inventory Feasibility → Add to Queue → Adjust Priority
```

**User Actions:**

1. User searches "dragon keychain purple" or browses by category
2. System shows thumbnail grid with matching results
3. User clicks variant to see details (print time, materials needed, success rate)
4. System displays inventory feasibility (sufficient materials: green, need to order: orange)
5. User adds to queue with priority setting
6. System updates queue position and estimated completion time

**Success Criteria:**

- Maximum 30 seconds from search to queue
- Clear visual feedback at each step
- No dead-end states or confusion

## Flow 3: Inventory Management Workflow

```
Check Current Stock → Identify Low Items → Generate Shopping List → Update After Purchase
```

**User Actions:**

1. User views inventory dashboard showing color-coded stock levels
2. System highlights items below threshold with visual indicators
3. User generates shopping list with one-click, includes purchase URLs
4. After shopping, user updates quantities via mobile or desktop
5. System recalculates available production capacity

**Success Criteria:**

- Stock status visible at a glance
- Shopping list generation takes under 10 seconds
- Mobile inventory updates work smoothly during restocking

## Flow 4: Production Planning for Market Events

```
Create Event → Assign Product Categories → Check Inventory → Plan Production → Execute Queue
```

**User Actions:**

1. User creates new market event (Christmas Craft Fair, type: seasonal)
2. System suggests product categories based on event type and historical data
3. User reviews recommended products and inventory requirements
4. System generates production schedule with timeline recommendations
5. User approves and populates print queue with event-specific priorities

**Success Criteria:**

- Event planning completed in under 15 minutes
- Clear recommendations based on historical performance
- Production timeline aligned with event dates
