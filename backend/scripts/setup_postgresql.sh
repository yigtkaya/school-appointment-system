#!/bin/bash

# PostgreSQL Database Setup Script for School Appointment System
# This script creates the database and user for the application

set -e

echo "🐘 Setting up PostgreSQL database for School Appointment System..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   macOS: brew services start postgresql"
    echo "   Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database and user
echo "📊 Creating database and user..."
psql -U postgres -f "$(dirname "$0")/setup_postgresql.sql"

echo "✅ Database setup completed!"
echo ""
echo "📋 Database Details:"
echo "   Database: school_appointments"
echo "   User: appointment_user"
echo "   Password: appointment_password"
echo "   Connection: postgresql://appointment_user:appointment_password@localhost:5432/school_appointments"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: alembic revision --autogenerate -m 'Initial migration'"
echo "   2. Run: alembic upgrade head"
echo "   3. Start the FastAPI server: uvicorn app.main:app --reload --port 8001"