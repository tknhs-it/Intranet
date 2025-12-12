/**
 * Test SQL Server connection
 * Run with: node test-sqlserver-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing SQL Server connection...');
    const connStr = process.env.DATABASE_URL || '';
    console.log('Host:', connStr.match(/sqlserver:\/\/([^:]+)/)?.[1] || 'unknown');
    console.log('Database:', connStr.match(/database=([^;]+)/)?.[1] || 'unknown');
    console.log('Connection string:', connStr.replace(/password=[^;]+/, 'password=***'));
    console.log('');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT @@VERSION as version`;
    console.log('✅ Connected to SQL Server!');
    console.log('Server version:', result[0]?.version?.substring(0, 50) + '...');
    
    // Test database name
    const dbResult = await prisma.$queryRaw`SELECT DB_NAME() as dbname`;
    const dbName = dbResult[0]?.dbname;
    console.log('Database name:', dbName);
    
    // Check if database exists
    if (!dbName || dbName === 'master') {
      console.log('\n⚠️  Warning: Connected to master database or database not found');
      console.log('   You may need to create the database: CREATE DATABASE nossal_intranet;');
    }
    
    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    
    if (tables.length > 0) {
      console.log(`\n📊 Found ${tables.length} existing tables:`);
      tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    } else {
      console.log('\n📊 No tables found - ready for migrations');
    }
    
    console.log('\n✅ SQL Server connection test successful!');
    console.log('Next steps:');
    console.log('  1. If database doesn\'t exist, create it in SQL Server');
    console.log('  2. Run migrations: npm run prisma:migrate');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check SQL Server is running and accessible');
    console.error('2. Try alternative hostname: nhssql.curric.nossal-hs.wan');
    console.error('3. Check port 1433 is open');
    console.error('4. Verify username/password are correct');
    console.error('5. Check firewall rules allow connection');
    console.error('6. Check if VPN is required');
    console.error('\nTo try alternative hostname, update .env:');
    console.error('   DATABASE_URL=sqlserver://nhssql.curric.nossal-hs.wan:1433;...');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

