-- Database initialization script for PostgreSQL
-- This script creates necessary databases and users for different environments

-- Create development database and user
CREATE DATABASE fm5_dev;
CREATE USER fm5_user WITH ENCRYPTED PASSWORD 'fm5_password';
GRANT ALL PRIVILEGES ON DATABASE fm5_dev TO fm5_user;

-- Create test database and user
CREATE DATABASE fm5_test;
GRANT ALL PRIVILEGES ON DATABASE fm5_test TO fm5_user;

-- Create production database (commented out for safety)
-- CREATE DATABASE fm5_production;
-- CREATE USER fm5_prod_user WITH ENCRYPTED PASSWORD 'secure_production_password';
-- GRANT ALL PRIVILEGES ON DATABASE fm5_production TO fm5_prod_user;

-- Grant necessary privileges
ALTER USER fm5_user CREATEDB;

-- Enable required extensions
\c fm5_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c fm5_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";