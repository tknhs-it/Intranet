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
    console.log('Connection string:', process.env.DATABASE_URL?.replace(/password=[^;]+/, 'password=***'));
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT @@VERSION as version`;
    console.log('✅ Connected to SQL Server!');
    console.log('Server version:', result[0]?.version?.substring(0, 50) + '...');
    
    // Test database name
    const dbResult = await prisma.$queryRaw`SELECT DB_NAME() as dbname`;
    console.log('Database name:', dbResult[0]?.dbname);
    
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
    console.log('You can now run: npm run prisma:migrate');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check SQL Server is running and accessible');
    console.error('2. Verify hostname "nhssql" resolves correctly');
    console.error('3. Check port 1433 is open');
    console.error('4. Verify username/password are correct');
    console.error('5. Check firewall rules allow connection');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

