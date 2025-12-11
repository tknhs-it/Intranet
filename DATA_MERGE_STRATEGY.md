# Data Merge Strategy - Nossal Intranet

## The Golden Rule

**Use CASES for identity. Use Compass for school operations. Use Teams/Graph for communication.**

The intranet becomes the "brain" that merges them into unified views.

## Architecture

```
            ┌────────────┐
            │   CASES    │
            │ (Nightly)  │
            └─────┬──────┘
                  │
                  ▼
       Staff + Students (Core Identity)
                  │
                  ▼
        ┌─────────────────────────────────┐
        │        INTERNAL DATABASE        │
        │  (staff, timetable, absences)   │
        └─────────────────────────────────┘
                  ▲              ▲
      Compass API │              │ Teams/Graph API
                  │              │
                  ▼              ▼
           ┌────────────┐   ┌────────────┐
           │  Compass    │   │  Teams/365 │
           └────────────┘   └────────────┘
                  │              │
                  └──────┬──────┘
                         ▼
                **MERGED VIEW**
                  (intranet)
```

## Data Sources

### 1. CASES (Source of Truth for Identity)

**Nightly ETL populates:**
- `staff(cases_id, first_name, last_name, email, faculty, active)`
- `students(cases_id, name, year, home_group, active)`

**CASES defines who exists.**

### 2. Compass (Daily School Operations)

**Compass provides:**
- Absences
- Extras/coverage
- Room changes
- Staff calendar
- Cover classes
- Notices
- Learning tasks

**Storage Strategy:**
- Store raw Compass data in `compass_raw_*` tables
- Transform into normalized tables:
  - `timetable_events`
  - `staff_absences`
  - `duties`
  - `room_changes`

**Why raw storage?** Compass isn't reliable for long-term record-keeping.

### 3. Teams/Graph (Communication Metadata)

**Graph adds attributes to the SAME staff row:**
- `profile_photo`
- `presence_status`
- `teams_memberships`
- `calendar busy/free`
- `sharepoint documents`

**Merged via:**
```typescript
staff.enriched = {
  photo,
  presence,
  teams,
  calendar_today
}
```

## Merge Example

### Input Data

**CASES:**
```
cases_id = 08593205
name = Anthony Keen
faculty = IT
email = keen.a@nossalhs.vic.edu.au
```

**Compass:**
```
timetable_today = [
  { P1, Yr10 Science, Room 213 },
  { P2, EXTRA 9B English },
]
absent = false
room_changes = [ P4 → room 108 ]
```

**Teams/Graph:**
```
presence = "Available"
teams = ["IT Services", "Staffroom", "Curriculum"]
photo_url = /photos/08593205.jpg
calendar = { next_free: 2:30pm }
```

### Merged Output

```json
{
  "name": "Anthony Keen",
  "email": "keen.a@nossalhs.vic.edu.au",
  "faculty": "IT",
  "photo": "...",
  "presence": "Available",
  "today": {
    "classes": [
      { "period": 1, "subject": "Science", "class": "Yr10 Science", "room": "213" },
      { "period": 2, "subject": "English", "class": "EXTRA 9B English", "room": "..." }
    ],
    "extras": [
      { "period": 2, "class": "9B English", "reason": "Lee A. away" }
    ],
    "room_changes": [
      { "period": 4, "from": "107", "to": "108" }
    ]
  },
  "teams": ["IT Services", "Staffroom", "Curriculum"],
  "next_free": "2:30pm"
}
```

## Implementation

### DataMergeService

The `DataMergeService` class handles all merging:

1. **Get CASES Identity** - From database (nightly ETL)
2. **Get Compass Operations** - Real-time API calls
3. **Get Graph Metadata** - On-demand Graph API calls
4. **Merge** - Combine into unified profile

### Usage

```typescript
// Get merged staff profile
const profile = await dataMergeService.getMergedStaffProfile(staffId);

// Get merged staff directory
const directory = await dataMergeService.getMergedStaffDirectory({
  faculty: 'Science',
  search: 'Smith'
});

// Get today's dashboard
const dashboard = await dataMergeService.getTodayDashboard(staffId);
```

## Benefits

1. **Single Source of Truth** - CASES for identity
2. **Real-time Operations** - Compass for daily data
3. **Rich Metadata** - Graph for communication
4. **Unified Views** - One API call gets everything
5. **Performance** - Cached identity, on-demand operations
6. **Reliability** - Fallbacks if one source fails

## Data Flow

### Morning Dashboard Load

1. User logs in → Get staff ID from CASES (database)
2. Fetch Compass timetable for today → Real-time
3. Fetch Graph presence/photo → On-demand
4. Merge all data → Return unified view
5. Cache for 5 minutes → Reduce API calls

### Staff Directory

1. Load all staff from CASES (database) → Fast
2. Parallel fetch Graph photos/presence → Batch
3. Merge → Return enriched directory
4. Cache for 15 minutes

### Daily Org PDF

1. Check Teams SharePoint for latest PDF → Graph API
2. Cache PDF URL → Update daily
3. Display inline → Fast loading

## Error Handling

- **CASES missing**: Use Compass/Graph data only
- **Compass down**: Show cached data, indicate stale
- **Graph unavailable**: Show basic profile without photos/presence
- **All fail**: Show cached database data only

## Performance

- **Identity**: Cached in database (nightly refresh)
- **Operations**: Real-time from Compass (5-min cache)
- **Metadata**: On-demand from Graph (15-min cache)
- **Dashboard**: 5-minute cache per user
- **Directory**: 15-minute cache (all users)

## Next Steps

1. ✅ Implement DataMergeService
2. ✅ Create merged dashboard endpoint
3. ⚠️ Implement Daily Org PDF auto-load
4. ⚠️ Add Compass absences integration
5. ⚠️ Add caching layer
6. ⚠️ Add error handling and fallbacks

