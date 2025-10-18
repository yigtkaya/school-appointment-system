-- PostgreSQL Database Setup Script
-- Run this script as a PostgreSQL superuser to set up the school appointments database

-- Create user
CREATE USER appointment_user WITH PASSWORD 'appointment_password';

-- Create database
CREATE DATABASE school_appointments WITH OWNER appointment_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE school_appointments TO appointment_user;

-- Connect to the database and grant schema privileges
\c school_appointments;
GRANT ALL ON SCHEMA public TO appointment_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appointment_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appointment_user;

-- Set default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO appointment_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO appointment_user;