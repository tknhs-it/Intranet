# SQL Server Setup Guide

This guide shows how to switch from PostgreSQL to SQL Server.

## ✅ Can We Use SQL Server?

**Yes!** Prisma fully supports SQL Server. The current schema is compatible with minor adjustments.

## 🔄 What Needs to Change

### 1. Prisma Schema
- Change `provider = "postgresql"` to `provider = "sqlserver"`
- Array fields (`String[]`) will work (Prisma handles conversion)
- All other features are compatible

### 2. Connection String
- PostgreSQL: `postgresql://user:pass@host:5432/db`
- SQL Server: `sqlserver://host:1433;database=db;user=user;password=pass;encrypt=true`

### 3. Dependencies
- No changes needed - Prisma handles both

## 📋 Step-by-Step Migration

### Step 1: Update Prisma Schema

Edit `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update Connection String

**SQL Server Connection String Format:**
```
sqlserver://server:port;database=dbname;user=username;password=password;encrypt=true;trustServerCertificate=true
```

**Example:**
```env
DATABASE_URL=sqlserver://sql-server.nossalhs.vic.edu.au:1433;database=nossal_intranet;user=intranet_user;password=your_password;encrypt=true;trustServerCertificate=true
```

**Or with Windows Authentication:**
```env
DATABASE_URL=sqlserver://sql-server.nossalhs.vic.edu.au:1433;database=nossal_intranet;integratedSecurity=true;encrypt=true;trustServerCertificate=true
```

### Step 3: Install SQL Server Driver (if needed)

Prisma uses `@prisma/adapter-sqlserver` which should be included, but verify:

```bash
cd backend
npm install @prisma/client
```

### Step 4: Generate Prisma Client

```bash
npm run prisma:generate
```

### Step 5: Run Migrations

```bash
npm run prisma:migrate
```

### Step 6: Test Connection

```bash
# Test database connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`.then(() => {
  console.log('✅ SQL Server connection successful!');
  prisma.\$disconnect();
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  prisma.\$disconnect();
});
"
```

## ⚠️ Important Differences

### 1. Array Fields
**PostgreSQL:** Native array support  
**SQL Server:** Prisma converts arrays to JSON or separate tables

**Current Schema:**
```prisma
equipment   String[] // Array of equipment tags
tags        String[] // Array of tags
```

**SQL Server:** These will work automatically - Prisma handles the conversion.

### 2. Text Fields
**PostgreSQL:** `@db.Text`  
**SQL Server:** `NVARCHAR(MAX)`

**Current Schema:** Already uses `@db.Text` - compatible!

### 3. ID Generation
**PostgreSQL:** `cuid()` works  
**SQL Server:** `cuid()` works (Prisma handles it)

**Current Schema:** Uses `@id @default(cuid())` - compatible!

### 4. Indexes
**PostgreSQL:** `@@index([field])`  
**SQL Server:** `@@index([field])` - same syntax!

**Current Schema:** All indexes are compatible.

### 5. Enums
**PostgreSQL:** Native enum type  
**SQL Server:** Prisma uses VARCHAR with CHECK constraint

**Current Schema:** All enums will work automatically.

## 🔧 Connection String Options

### Standard Authentication
```
sqlserver://host:port;database=dbname;user=username;password=password;encrypt=true
```

### Windows Authentication (Integrated Security)
```
sqlserver://host:port;database=dbname;integratedSecurity=true;encrypt=true
```

### With Trust Server Certificate (for self-signed certs)
```
sqlserver://host:port;database=dbname;user=username;password=password;encrypt=true;trustServerCertificate=true
```

### With Connection Timeout
```
sqlserver://host:port;database=dbname;user=username;password=password;encrypt=true;connectionTimeout=30
```

## 📊 Pros and Cons

### ✅ Pros of Using SQL Server

1. **Already Available**
   - No need to set up new database
   - Managed by your IT team
   - Likely already backed up

2. **Integration**
   - May integrate with existing systems
   - Familiar to IT team
   - Can use existing tools

3. **Performance**
   - SQL Server is enterprise-grade
   - Good performance for school-sized data
   - Excellent indexing

4. **Security**
   - Can use Windows Authentication
   - Integrated with Active Directory
   - Enterprise security features

### ⚠️ Considerations

1. **Array Fields**
   - Arrays stored as JSON in SQL Server
   - Slightly different query syntax
   - Prisma handles this automatically

2. **Case Sensitivity**
   - SQL Server is case-insensitive by default
   - PostgreSQL is case-sensitive
   - May need to adjust queries

3. **String Comparison**
   - SQL Server: `'value' = 'VALUE'` → true
   - PostgreSQL: `'value' = 'VALUE'` → false
   - Our code uses case-insensitive matching, so should be fine

## 🚀 Quick Migration Steps

```bash
# 1. Update schema
# Edit backend/prisma/schema.prisma
# Change: provider = "postgresql" → provider = "sqlserver"

# 2. Update .env
# Edit backend/.env
# Change DATABASE_URL to SQL Server connection string

# 3. Regenerate Prisma client
cd backend
npm run prisma:generate

# 4. Create initial migration
npm run prisma:migrate -- --name init_sqlserver

# 5. Test connection
npm run dev
# Check for connection errors
```

## 🔍 Testing SQL Server Connection

### Test 1: Basic Connection
```bash
cd backend
node -e "
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT @@VERSION\`.then(version => {
  console.log('✅ Connected to SQL Server');
  console.log('Version:', version[0]);
  prisma.\$disconnect();
});
"
```

### Test 2: Create Test Table
```bash
# This will be done automatically by Prisma migrations
npm run prisma:migrate
```

### Test 3: Insert Test Data
```bash
npm run prisma:seed
```

## 📝 Updated Environment Variables

**backend/.env:**
```env
# SQL Server Connection
DATABASE_URL=sqlserver://your-server:1433;database=nossal_intranet;user=your_user;password=your_password;encrypt=true;trustServerCertificate=true

# Or with Windows Auth:
# DATABASE_URL=sqlserver://your-server:1433;database=nossal_intranet;integratedSecurity=true;encrypt=true
```

## 🎯 Recommendation

**Yes, use SQL Server if:**
- ✅ It's already set up and managed
- ✅ Your IT team prefers it
- ✅ It integrates with existing systems
- ✅ You have Windows Authentication available

**Stick with PostgreSQL if:**
- ❌ You need advanced array operations
- ❌ You prefer open-source
- ❌ You're deploying to cloud (easier PostgreSQL options)

## 🔄 Rollback Plan

If you need to switch back to PostgreSQL:

1. Change `provider = "sqlserver"` back to `provider = "postgresql"`
2. Update `DATABASE_URL` to PostgreSQL format
3. Run `npm run prisma:generate`
4. Run `npm run prisma:migrate`

**Note:** You'll need to export/import data if you switch databases.

## ✅ Next Steps

1. **Get SQL Server Connection Details:**
   - Server hostname/IP
   - Port (usually 1433)
   - Database name
   - Username/password OR Windows Auth
   - Whether to use encryption

2. **Update Schema:**
   - Change provider to `sqlserver`
   - Update connection string

3. **Test Connection:**
   - Generate Prisma client
   - Run migrations
   - Test queries

4. **Verify Everything Works:**
   - Run CASES ETL
   - Test authentication
   - Test dashboard

---

**Ready to switch? Let me know your SQL Server connection details and I'll help you configure it!**

