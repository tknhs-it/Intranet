# CASES Schema Configuration

The CASES ETL system now supports loading schemas from `relationships.json` or using hardcoded fallback schemas.

## How It Works

1. **Schema Loading Priority**:
   - First tries to load from `relationships.json` (if it has `file_layouts` section)
   - Falls back to hardcoded schemas in `schemaConfig.ts`

2. **Relationships JSON Structure**:
   The `relationships.json` file should have a `file_layouts` section like this:
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
           ...
         ],
         "field_mapping": {
           "CASES_KEY": "studentId",
           "SURNAME": "surname",
           ...
         }
       }
     }
   }
   ```

3. **Table Name Mapping**:
   - `DF_8865` = Students (STUDENT.DAT)
   - `SF_8865` = Staff (STAFF.DAT)
   - `ENROL_8865` = Enrolments (ENROL.DAT)
   - `PARENT_8865` = Parents (PARENT.DAT)

## Configuration

### Environment Variables

- `CASES_RELATIONSHIPS_JSON` - Path to relationships.json file (default: `./relationships.json`)

### Adding Schema to relationships.json

To use schemas from `relationships.json`, add a `file_layouts` section:

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
    }
  }
}
```

## Field Mapping

The `field_mapping` section maps CASES field names (from relationships.json) to our internal field names:

- CASES field names: `CASES_KEY`, `SURNAME`, `GIVEN_NAMES`, etc.
- Our field names: `studentId`, `surname`, `givenNames`, etc.

This allows the parser to work with the actual CASES field names while maintaining our internal naming convention.

## Validation

Run validation to check that relationships.json is properly formatted:

```typescript
import { validateRelationshipsJson } from './config/schemaLoader';

const isValid = await validateRelationshipsJson();
```

## Current Status

- ✅ Schema loader implemented
- ✅ Fallback to hardcoded schemas
- ✅ Field mapping support
- ⚠️ Need to add `file_layouts` section to relationships.json
- ⚠️ Need to verify column positions match actual CASES files

## Next Steps

1. **Extract actual column positions** from your CASES files
2. **Add `file_layouts` section** to relationships.json with correct positions
3. **Test parsing** with real CASES files
4. **Adjust positions** if needed

## Testing

To test schema loading:

```typescript
import { getFileSchema } from './config/schemaConfig';

const schema = await getFileSchema('STUDENT.DAT');
console.log('Columns:', schema.columns);
console.log('Field mapping:', schema.field_mapping);
```

