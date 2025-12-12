#!/bin/bash
# Update SQL Server hostname in .env file

HOSTNAME="${1:-nhssql.curric.nossalhs.vic.edu.au}"

echo "Updating SQL Server hostname to: $HOSTNAME"

# Backup .env
if [ -f .env ]; then
  cp .env .env.backup
  echo "✅ Backed up .env to .env.backup"
fi

# Update DATABASE_URL
if [ -f .env ]; then
  # Remove old DATABASE_URL line
  sed -i '/^DATABASE_URL=sqlserver:\/\/.*$/d' .env
  
  # Add new DATABASE_URL at the top
  sed -i "1i# Database - SQL Server\nDATABASE_URL=sqlserver://${HOSTNAME}:1433;database=nossal_intranet;user=nhssql;password=NHS8865sql;encrypt=true;trustServerCertificate=true" .env
  
  echo "✅ Updated .env with hostname: $HOSTNAME"
  echo ""
  echo "Connection string:"
  grep "^DATABASE_URL=" .env | sed 's/password=[^;]*/password=***/'
else
  echo "❌ .env file not found"
  exit 1
fi

