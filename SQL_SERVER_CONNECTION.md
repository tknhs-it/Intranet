# SQL Server Connection - nhssql

## ✅ Configuration Complete

**Server Details:**
- Host: `nhssql`
- Database: `nossal_intranet`
- Username: `nhssql`
- Password: `NHS8865sql`
- Port: `1433` (default)

**Connection String:**
```
sqlserver://nhssql:1433;database=nossal_intranet;user=nhssql;password=NHS8865sql;encrypt=true;trustServerCertificate=true
```

## ✅ Schema Updated

- ✅ Changed provider to `sqlserver`
- ✅ Converted arrays (`String[]`) to JSON strings
- ✅ Converted enums to strings
- ✅ Converted `Json` type to `String @db.NVarChar(Max)`
- ✅ All models are SQL Server compatible

## 🔧 Connection Troubleshooting

### Issue: "Can't reach database server at nhssql:1433"

**Possible Causes:**

1. **Hostname doesn't resolve**
   - Try using FQDN: `nhssql.nossalhs.vic.edu.au`
   - Or use IP address if known
   - Test: `ping nhssql` or `nslookup nhssql`

2. **Port 1433 not accessible**
   - Check if SQL Server is configured to listen on port 1433
   - Check firewall rules
   - Try different port if SQL Server uses non-standard port

3. **SQL Server not configured for remote connections**
   - SQL Server Configuration Manager → SQL Server Network Configuration
   - Enable TCP/IP protocol
   - Restart SQL Server service

4. **Firewall blocking**
   - Check Windows Firewall on SQL Server
   - Check network firewall rules
   - Allow port 1433 inbound

5. **SQL Server not running**
   - Check SQL Server service is running
   - Check SQL Server Browser service (if using named instances)

### Try These Fixes:

**Option 1: Use FQDN**
```env
DATABASE_URL=sqlserver://nhssql.nossalhs.vic.edu.au:1433;database=nossal_intranet;user=nhssql;password=NHS8865sql;encrypt=true;trustServerCertificate=true
```

**Option 2: Use IP Address**
```env
# If you know the IP address
DATABASE_URL=sqlserver://192.168.1.100:1433;database=nossal_intranet;user=nhssql;password=NHS8865sql;encrypt=true;trustServerCertificate=true
```

**Option 3: Try Different Port**
```env
# If SQL Server uses a different port
DATABASE_URL=sqlserver://nhssql:1434;database=nossal_intranet;user=nhssql;password=NHS8865sql;encrypt=true;trustServerCertificate=true
```

**Option 4: Disable Encryption (for testing)**
```env
# Only for testing - not recommended for production
DATABASE_URL=sqlserver://nhssql:1433;database=nossal_intranet;user=nhssql;password=NHS8865sql;encrypt=false
```

## 🧪 Test Connection Manually

### Test 1: Ping Server
```bash
ping nhssql
# Or
ping nhssql.nossalhs.vic.edu.au
```

### Test 2: Test Port
```bash
telnet nhssql 1433
# Or
nc -zv nhssql 1433
```

### Test 3: Test with sqlcmd (if available)
```bash
sqlcmd -S nhssql -U nhssql -P NHS8865sql -d nossal_intranet -Q "SELECT @@VERSION"
```

### Test 4: Test with Node.js
```bash
cd backend
node test-sqlserver-connection.js
```

## 📋 Next Steps

1. **Verify SQL Server is accessible:**
   - Can you ping `nhssql`?
   - Can you connect from another machine?
   - Is SQL Server running?

2. **Check SQL Server Configuration:**
   - Is TCP/IP enabled?
   - What port is it listening on?
   - Is it configured for remote connections?

3. **Check Network:**
   - Are you on the same network?
   - Is there a VPN required?
   - Are firewall rules correct?

4. **Once connection works:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

## 🔍 Common SQL Server Connection Issues

### Issue: "Login failed for user"
- Check username/password are correct
- Check SQL Server authentication mode (SQL Auth vs Windows Auth)
- Check user has access to database

### Issue: "Cannot open database"
- Check database `nossal_intranet` exists
- If not, create it: `CREATE DATABASE nossal_intranet;`
- Check user has permissions

### Issue: "Connection timeout"
- Check network connectivity
- Check firewall rules
- Check SQL Server is running
- Try increasing timeout: `connectionTimeout=60`

## ✅ Once Connected

After connection works:

1. **Create database (if needed):**
   ```sql
   CREATE DATABASE nossal_intranet;
   ```

2. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

3. **Seed database:**
   ```bash
   npm run prisma:seed
   ```

4. **Verify tables:**
   ```bash
   node test-sqlserver-connection.js
   # Should show all created tables
   ```

## 📞 Need Help?

If connection still fails:
1. Check with IT team about SQL Server access
2. Verify hostname/IP address
3. Check if VPN is required
4. Verify SQL Server port and configuration

