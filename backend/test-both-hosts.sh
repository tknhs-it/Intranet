#!/bin/bash
# Test both SQL Server hostnames

echo "🧪 Testing SQL Server hostnames..."
echo ""

# Test 1: FQDN
echo "Test 1: nhssql.curric.nossalhs.vic.edu.au"
./update-sqlserver-host.sh nhssql.curric.nossalhs.vic.edu.au > /dev/null 2>&1
if node test-sqlserver-connection.js 2>&1 | grep -q "✅ Connected"; then
  echo "✅ SUCCESS with FQDN!"
  exit 0
else
  echo "❌ Failed with FQDN"
  echo ""
fi

# Test 2: WAN name
echo "Test 2: nhssql.curric.nossal-hs.wan"
./update-sqlserver-host.sh nhssql.curric.nossal-hs.wan > /dev/null 2>&1
if node test-sqlserver-connection.js 2>&1 | grep -q "✅ Connected"; then
  echo "✅ SUCCESS with WAN name!"
  exit 0
else
  echo "❌ Failed with WAN name"
  echo ""
fi

echo "❌ Both hostnames failed. Check:"
echo "  1. Network connectivity"
echo "  2. VPN connection (if required)"
echo "  3. Firewall rules"
echo "  4. SQL Server is running"

