/**
 * Test SQL Server with Windows Authentication (if available)
 */

require('dotenv').config();

// Try Windows Authentication connection string
const windowsAuthUrl = process.env.DATABASE_URL?.replace(
  /user=[^;]+;password=[^;]+/,
  'integratedSecurity=true'
) || '';

console.log('🔐 Testing Windows Authentication...\n');
console.log('Connection string:', windowsAuthUrl.replace(/password=[^;]+/, 'password=***'));
console.log('');

if (!windowsAuthUrl.includes('integratedSecurity')) {
  console.log('❌ Could not create Windows Auth connection string');
  console.log('   Make sure DATABASE_URL is set correctly');
  process.exit(1);
}

// Note: Windows Auth typically requires running on Windows or with proper Kerberos setup
// This is just to show what the connection string would look like
console.log('⚠️  Windows Authentication requires:');
console.log('   1. Running on Windows machine');
console.log('   2. Or proper Kerberos configuration on Linux');
console.log('   3. Or using a different authentication method');
console.log('');
console.log('For SQL Server Authentication, verify:');
console.log('   1. Username: nhssql');
console.log('   2. Password: NHS8865sql');
console.log('   3. SQL Server Authentication is enabled');
console.log('   4. User account exists and is enabled');
console.log('');
console.log('To enable SQL Server Authentication:');
console.log('   1. Open SQL Server Management Studio');
console.log('   2. Right-click server → Properties → Security');
console.log('   3. Select "SQL Server and Windows Authentication mode"');
console.log('   4. Restart SQL Server service');

