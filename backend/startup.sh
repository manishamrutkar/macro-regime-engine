#!/bin/sh
# Cloud startup script — runs before Node.js server
# Handles database setup and pipeline initialization

echo "🚀 Starting Macro Regime Engine..."
echo "Environment: ${NODE_ENV:-development}"

# Run DB schema if PostgreSQL is configured
if [ -n "$DB_HOST" ]; then
  echo "📊 Setting up database schema..."
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -d $DB_NAME \
    -f /app/db/schema.sql 2>/dev/null && echo "✅ Schema ready" || echo "⚠️  Schema already exists"
fi

# Check if pipeline results exist
if [ ! -f "/app/data/processed/results.json" ]; then
  echo "⚡ Running initial pipeline (first time setup)..."
  python3 /app/python_engine/main.py --mode full 2>&1 | tail -5
  echo "✅ Pipeline complete"
else
  echo "✅ Pipeline results found — skipping re-run"
fi

# Start the Node.js server
echo "🌐 Starting API server on port ${PORT:-5000}..."
exec node server.js
