/**
 * Test connection and create database if needed
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testAndCreate() {
  const baseUrl = process.env.DATABASE_URL?.match(/sqlserver:\/\/[^;]+/)?.[0] || '';
  const userPass = process.env.DATABASE_URL?.match(/user=[^;]+;password=[^;]+/)?.[0] || '';
  
  console.log('🔐 Testing SQL Server connection...\n');
  
  // Connect to master database
  const masterUrl = `${baseUrl};database=master;${userPass};encrypt=true;trustServerCertificate=true`;
  const prismaMaster = new PrismaClient({
    datasources: {
      db: { url: masterUrl }
    }
  });
  
  try {
    // Test connection
    const result = await prismaMaster.$queryRaw`SELECT @@VERSION as version, SYSTEM_USER as [current_user], DB_NAME() as dbname`;
    console.log('✅ Successfully connected to SQL Server!');
    console.log('   Current user:', result[0]?.current_user);
    console.log('   Database:', result[0]?.dbname);
    console.log('   Server version:', result[0]?.version?.substring(0, 60) + '...\n');
    
    // Check if nossal_intranet database exists
    console.log('📊 Checking if nossal_intranet database exists...');
    const dbCheck = await prismaMaster.$queryRaw`
      SELECT name, state_desc 
      FROM sys.databases 
      WHERE name = 'nossal_intranet'
    `;
    
    if (dbCheck.length > 0) {
      console.log('✅ Database nossal_intranet already exists');
      console.log('   State:', dbCheck[0]?.state_desc);
    } else {
      console.log('⚠️  Database nossal_intranet does NOT exist');
      console.log('   Creating database...');
      
      try {
        await prismaMaster.$executeRawUnsafe(`CREATE DATABASE nossal_intranet`);
        console.log('✅ Database nossal_intranet created successfully!');
      } catch (createError) {
        console.error('❌ Failed to create database:', createError.message);
        console.error('   You may need to create it manually with proper permissions');
        console.error('   SQL: CREATE DATABASE nossal_intranet;');
      }
    }
    
    // Now test connection to nossal_intranet
    console.log('\n🔌 Testing connection to nossal_intranet...');
    const prismaApp = new PrismaClient();
    
    try {
      const appResult = await prismaApp.$queryRaw`SELECT DB_NAME() as dbname, SYSTEM_USER as [current_user]`;
      console.log('✅ Successfully connected to nossal_intranet!');
      console.log('   Database:', appResult[0]?.dbname);
      console.log('   User:', appResult[0]?.current_user);
      console.log('\n🎉 Ready to run migrations!');
      console.log('   Next step: npx prisma migrate dev --name init');
    } catch (error) {
      console.error('❌ Failed to connect to nossal_intranet:', error.message);
    } finally {
      await prismaApp.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prismaMaster.$disconnect();
  }
}

testAndCreate();

