/**
 * Test SQL Server authentication with different databases
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testAuth() {
  const baseUrl = process.env.DATABASE_URL?.match(/sqlserver:\/\/[^;]+/)?.[0] || '';
  const userPass = process.env.DATABASE_URL?.match(/user=[^;]+;password=[^;]+/)?.[0] || '';
  
  console.log('🔐 Testing SQL Server authentication...\n');
  
  // Test 1: Connect to master database
  console.log('Test 1: Connecting to master database...');
  const masterUrl = `${baseUrl};database=master;${userPass};encrypt=true;trustServerCertificate=true`;
  const prismaMaster = new PrismaClient({
    datasources: {
      db: { url: masterUrl }
    }
  });
  
  try {
    const result = await prismaMaster.$queryRaw`SELECT @@VERSION as version, SYSTEM_USER as current_user, DB_NAME() as dbname`;
    console.log('✅ Successfully connected to master database!');
    console.log('   Current user:', result[0]?.current_user);
    console.log('   Database:', result[0]?.dbname);
    console.log('   Server version:', result[0]?.version?.substring(0, 60) + '...');
    
    // Check if nossal_intranet database exists
    console.log('\nTest 2: Checking if nossal_intranet database exists...');
    const dbCheck = await prismaMaster.$queryRaw`
      SELECT name FROM sys.databases WHERE name = 'nossal_intranet'
    `;
    
    if (dbCheck.length > 0) {
      console.log('✅ Database nossal_intranet exists');
    } else {
      console.log('⚠️  Database nossal_intranet does NOT exist');
      console.log('   You need to create it first:');
      console.log('   CREATE DATABASE nossal_intranet;');
    }
    
    // Check user permissions
    console.log('\nTest 3: Checking user permissions...');
    const permissions = await prismaMaster.$queryRaw`
      SELECT 
        dp.name AS principal_name,
        dp.type_desc AS principal_type,
        p.permission_name,
        p.state_desc AS permission_state
      FROM sys.database_permissions p
      INNER JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id
      WHERE dp.name = SYSTEM_USER
    `;
    
    if (permissions.length > 0) {
      console.log('   User permissions:');
      permissions.forEach(p => {
        console.log(`     - ${p.permission_name} (${p.permission_state})`);
      });
    } else {
      console.log('   No explicit permissions found (may have server-level permissions)');
    }
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Username/password incorrect');
    console.error('2. User account is locked or disabled');
    console.error('3. SQL Server authentication mode not enabled');
    console.error('4. User doesn\'t have permission to connect');
  } finally {
    await prismaMaster.$disconnect();
  }
  
  // Test 2: Try connecting to nossal_intranet
  console.log('\n\nTest 4: Attempting to connect to nossal_intranet database...');
  const prismaApp = new PrismaClient();
  
  try {
    const result = await prismaApp.$queryRaw`SELECT DB_NAME() as dbname, SYSTEM_USER as current_user`;
    console.log('✅ Successfully connected to nossal_intranet!');
    console.log('   Database:', result[0]?.dbname);
    console.log('   User:', result[0]?.current_user);
  } catch (error) {
    if (error.message.includes('Authentication failed')) {
      console.error('❌ Authentication failed for nossal_intranet');
      console.error('   This might mean:');
      console.error('   - Database exists but user doesn\'t have access');
      console.error('   - User needs to be added to database');
    } else if (error.message.includes('Cannot open database')) {
      console.error('❌ Database nossal_intranet does not exist');
      console.error('   Create it with: CREATE DATABASE nossal_intranet;');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prismaApp.$disconnect();
  }
}

testAuth();

