#!/bin/bash
# Test API endpoints

BASE_URL="http://localhost:5000"

echo "🧪 Testing Nossal Intranet API"
echo "================================"
echo ""

# Test 1: Health Check
echo "1. Health Check (/api/health)"
echo "----------------------------"
curl -s "$BASE_URL/api/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/health"
echo ""
echo ""

# Test 2: Readiness Check
echo "2. Readiness Check (/api/health/ready)"
echo "--------------------------------------"
curl -s "$BASE_URL/api/health/ready" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/health/ready"
echo ""
echo ""

# Test 3: Liveness Check
echo "3. Liveness Check (/api/health/live)"
echo "-------------------------------------"
curl -s "$BASE_URL/api/health/live" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/health/live"
echo ""
echo ""

# Test 4: Database Connection (via health endpoint)
echo "4. Database Status"
echo "-----------------"
DB_STATUS=$(curl -s "$BASE_URL/api/health" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
if [ "$DB_STATUS" = "ok" ]; then
  echo "✅ Database: Connected"
else
  echo "❌ Database: $DB_STATUS"
fi
echo ""

# Test 5: Check if server is responding
echo "5. Server Status"
echo "---------------"
if curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
  echo "✅ Server is running on port 5000"
else
  echo "❌ Server is not responding"
fi
echo ""

echo "================================"
echo "✅ API Testing Complete"
echo ""
echo "Note: Some endpoints require authentication (Azure AD)"
echo "To test authenticated endpoints, you'll need a valid JWT token"

