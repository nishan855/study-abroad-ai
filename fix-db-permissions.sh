#!/bin/bash

# Fix database permissions for studyyatra user

echo "Fixing database permissions..."

# Grant all privileges including schema creation
sudo -u postgres psql -d studyyatra << EOF
GRANT ALL PRIVILEGES ON DATABASE studyyatra TO studyyatra;
GRANT ALL ON SCHEMA public TO studyyatra;
ALTER DATABASE studyyatra OWNER TO studyyatra;
ALTER USER studyyatra CREATEDB;
EOF

echo "✓ Permissions fixed!"
echo ""
echo "Now run: cd backend && npx prisma migrate dev --name init"
