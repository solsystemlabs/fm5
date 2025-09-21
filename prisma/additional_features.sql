-- Additional Database Features for 3D Printing Management Platform
-- GIN indexes, JSONB indexes, triggers, and Row Level Security

-- =============================================================================
-- GIN INDEXES FOR FULL-TEXT SEARCH
-- =============================================================================

-- Create GIN index for full-text search on models table (names and descriptions)
CREATE INDEX models_search_gin_idx ON models USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- =============================================================================
-- JSONB INDEXES FOR BAMBU METADATA SEARCH
-- =============================================================================

-- Create GIN index for JSONB bambu_metadata search
CREATE INDEX model_variants_bambu_metadata_gin_idx ON model_variants USING GIN (bambu_metadata);

-- =============================================================================
-- DATABASE TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers for relevant tables
CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_variants_updated_at
    BEFORE UPDATE ON model_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_filaments_updated_at
    BEFORE UPDATE ON filaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_print_jobs_updated_at
    BEFORE UPDATE ON print_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update filament demand count
CREATE OR REPLACE FUNCTION update_filament_demand_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update demand count for old filament (if exists)
    IF TG_OP = 'UPDATE' AND OLD.filament_id IS DISTINCT FROM NEW.filament_id THEN
        UPDATE filaments
        SET demand_count = (
            SELECT COUNT(*) FROM filament_requirements
            WHERE filament_id = OLD.filament_id
        )
        WHERE id = OLD.filament_id;
    END IF;

    -- Update demand count for new filament
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE filaments
        SET demand_count = (
            SELECT COUNT(*) FROM filament_requirements
            WHERE filament_id = NEW.filament_id
        )
        WHERE id = NEW.filament_id;
    END IF;

    -- Update demand count for deleted filament
    IF TG_OP = 'DELETE' THEN
        UPDATE filaments
        SET demand_count = (
            SELECT COUNT(*) FROM filament_requirements
            WHERE filament_id = OLD.filament_id
        )
        WHERE id = OLD.filament_id;
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create filament demand count trigger
CREATE TRIGGER update_filament_demand_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON filament_requirements
    FOR EACH ROW EXECUTE FUNCTION update_filament_demand_count();

-- Function to get current authenticated user ID (for RLS)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    -- This would be implemented based on JWT claims or session data
    -- For development, we return a coalesce of app setting or default
    RETURN COALESCE(
        current_setting('app.current_user_id', true)::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all user-scoped tables
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE filaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE filament_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE filament_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- Create role for authenticated users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated_users') THEN
        CREATE ROLE authenticated_users;
    END IF;
END
$$;

-- Grant permissions to authenticated_users role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated_users;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated_users;

-- RLS Policies for complete user data isolation

-- Models table policy
CREATE POLICY models_user_isolation ON models
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- Model variants table policy
CREATE POLICY model_variants_user_isolation ON model_variants
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- Filaments table policy
CREATE POLICY filaments_user_isolation ON filaments
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- Filament inventory table policy
CREATE POLICY filament_inventory_user_isolation ON filament_inventory
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- Filament requirements table policy (access via variant ownership)
CREATE POLICY filament_requirements_user_isolation ON filament_requirements
    FOR ALL TO authenticated_users
    USING (variant_id IN (SELECT id FROM model_variants WHERE user_id = current_user_id()));

-- Print jobs table policy
CREATE POLICY print_jobs_user_isolation ON print_jobs
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify GIN indexes were created
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE indexname LIKE '%_gin_idx'
ORDER BY tablename, indexname;