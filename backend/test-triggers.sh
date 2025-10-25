#!/bin/bash

echo "🧪 Testing PostgreSQL LISTEN/NOTIFY Triggers"
echo "=============================================="
echo ""

echo "1️⃣  Testing UPDATE on projects table..."
docker exec trello-db psql -U shivauser -d trelloDb -c "UPDATE projects SET name = 'Updated via SQL - $(date +%H:%M:%S)' WHERE id = 1;"

echo ""
echo "2️⃣  Testing INSERT on projects table..."
docker exec trello-db psql -U shivauser -d trelloDb -c "INSERT INTO projects (name, description) VALUES ('Test Project $(date +%H:%M:%S)', 'Created via SQL');"

echo ""
echo "✅ SQL commands executed!"
echo "👀 Check your backend console for:"
echo "   🔔 DB Change: projects - UPDATE"
echo "   🔔 DB Change: projects - INSERT"
echo ""
echo "👀 Check your browser frontend for instant updates!"
