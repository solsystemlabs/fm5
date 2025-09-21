-- Database initialization script for printmgmt_dev
-- This script runs automatically when PostgreSQL container starts

-- Connect to the database
\c printmgmt_dev;

-- Install required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create development user with proper permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'printmgmt_user') THEN
        CREATE USER printmgmt_user WITH PASSWORD 'dev_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE printmgmt_dev TO printmgmt_user;
GRANT ALL ON SCHEMA public TO printmgmt_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO printmgmt_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO printmgmt_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO printmgmt_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO printmgmt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO printmgmt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO printmgmt_user;

-- Configure pg_stat_statements (reset will be called after restart)
-- SELECT pg_stat_statements_reset();

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
    RAISE NOTICE 'Extensions installed: uuid-ossp, pg_stat_statements';
    RAISE NOTICE 'User created: printmgmt_user with full database privileges';
END
$$;