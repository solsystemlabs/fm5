-- Initialize database for FM5 Manager
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases for testing if needed
-- The main database 'fm5_dev' is already created by Docker Compose

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE fm5_dev TO fm5_user;

-- Connect to the database and create extensions if needed
\c fm5_dev;

-- Enable UUID extension if you plan to use UUIDs in the future
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add any other initial setup here