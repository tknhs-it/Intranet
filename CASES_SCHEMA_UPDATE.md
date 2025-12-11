# CASES Schema Update - Using relationships.json

## What Changed

The CASES ETL system now loads schemas (column positions) from `relationships.json` instead of hardcoded values.

## Files Created

1. **`backend/src/cases-etl/config/schemaLoader.ts`**
   - Loads `relationships.json`
   - Maps CASES table names to file names
   - Provides functions to get schemas and field definitions

2. **`backend/src/cases-etl/config/schemaConfig.ts`**
   - Fallback schemas if relationships.json doesn't have `file_layouts`
   - Defines column positions for all CASES files
   - Field mapping from CASES names to internal names

3. **`backend/src/cases-etl/README_SCHEMA.md`**
   - Documentation on how to configure schemas
   - Examples of relationships.json structure

## How It Works

### Schema Loading Priority

1. **First**: Tries to load from `relationships.json` → `file_layouts` section
2. **Fallback**: Uses hardcoded schemas in `schemaConfig.ts`

### Current Status

- ✅ Schema loader implemented
- ✅ Parser functions updated to use dynamic schemas
- ✅ Field mapping support added
- ⚠️ **Need to add `file_layouts` section to relationships.json**

## Next Steps

### 1. Add `file_layouts` to relationships.json

Add a `file_layouts` section to your `relationships.json` file with the actual column positions from your CASES exports:

```json
{
  "primary_keys": { ... },
  "file_layouts": {
    "STUDENT.DAT": {
      "filename": "STUDENT.DAT",
      "table_name": "DF_8865",
      "columns": [
        { "name": "CASES_KEY", "start": 0, "width": 10 },
        { "name": "SURNAME", "start": 10, "width": 30 },
        { "name": "GIVEN_NAMES", "start": 40, "width": 30 },
        { "name": "DOB", "start": 70, "width": 8 },
        { "name": "SEX", "start": 78, "width": 1 },
        { "name": "HOMEKEY", "start": 79, "width": 10 },
        { "name": "HOUSE", "start": 89, "width": 10 },
        { "name": "YEAR_LEVEL", "start": 99, "width": 2 },
        { "name": "EMAIL", "start": 101, "width": 100 },
        { "name": "TELEPHONE", "start": 201, "width": 20 }
      ],
      "field_mapping": {
        "CASES_KEY": "studentId",
        "SURNAME": "surname",
        "GIVEN_NAMES": "givenNames",
        "DOB": "dob",
        "SEX": "sex",
        "HOMEKEY": "homeGroup",
        "HOUSE": "house",
        "YEAR_LEVEL": "yearLevel",
        "EMAIL": "email",
        "TELEPHONE": "phone"
      }
    },
    "STAFF.DAT": {
      "filename": "STAFF.DAT",
      "table_name": "SF_8865",
      "columns": [
        { "name": "SFKEY", "start": 0, "width": 10 },
        { "name": "SURNAME", "start": 10, "width": 30 },
        { "name": "GIVEN_NAMES", "start": 40, "width": 30 },
        { "name": "EMAIL", "start": 70, "width": 100 },
        { "name": "EMPLOYMENT_TYPE", "start": 170, "width": 2 },
        { "name": "ACTIVE_FLAG", "start": 172, "width": 1 },
        { "name": "DEPARTMENT", "start": 173, "width": 50 },
        { "name": "POSITION", "start": 223, "width": 50 },
        { "name": "TELEPHONE", "start": 273, "width": 20 }
      ],
      "field_mapping": {
        "SFKEY": "staffId",
        "SURNAME": "surname",
        "GIVEN_NAMES": "givenNames",
        "EMAIL": "email",
        "EMPLOYMENT_TYPE": "employmentType",
        "ACTIVE_FLAG": "activeFlag",
        "DEPARTMENT": "department",
        "POSITION": "position",
        "TELEPHONE": "phone"
      }
    }
  }
}
```

### 2. Verify Column Positions

**Important**: The column positions in the example above are placeholders. You need to:

1. Open a real CASES export file (e.g., `STUDENT.DAT`)
2. Measure the actual column positions
3. Update the `start` and `width` values in relationships.json

### 3. Test Parsing

Once you've added the `file_layouts` section:

```bash
cd backend
npm run dev
# Or run the ETL manually to test
```

## Table Name Mapping

The system maps CASES table names to file names:

- `DF_8865` → `STUDENT.DAT` (Students)
- `SF_8865` → `STAFF.DAT` (Staff)
- `ENROL_8865` → `ENROL.DAT` (Enrolments)
- `PARENT_8865` → `PARENT.DAT` (Parents)

## Field Mapping

The `field_mapping` section maps CASES field names (from relationships.json) to our internal field names:

- **CASES names**: `CASES_KEY`, `SURNAME`, `GIVEN_NAMES`, etc.
- **Our names**: `studentId`, `surname`, `givenNames`, etc.

This allows the parser to work with actual CASES field names while maintaining our internal naming.

## Benefits

1. **No code changes needed** to adjust column positions
2. **Single source of truth** - schema in relationships.json
3. **Easy to update** - just edit JSON file
4. **Fallback support** - still works if relationships.json doesn't have layouts

## Environment Variable

You can specify a custom path to relationships.json:

```bash
CASES_RELATIONSHIPS_JSON=/path/to/relationships.json
```

Default: `./relationships.json` (project root)

## Validation

To validate that relationships.json is properly formatted:

```typescript
import { validateRelationshipsJson } from './config/schemaLoader';

const isValid = await validateRelationshipsJson();
```

## Current Implementation

- ✅ Schema loader reads from relationships.json
- ✅ Fallback to hardcoded schemas
- ✅ Field mapping support
- ✅ Async parser functions
- ⚠️ Need to add actual column positions to relationships.json

## Questions?

If you need help determining the correct column positions:
1. Open a CASES export file in a text editor
2. Count characters to find where each field starts
3. Measure the width of each field
4. Update relationships.json with correct values

The system will automatically use the new positions on the next ETL run!

