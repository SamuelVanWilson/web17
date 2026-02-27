-- ============================================
-- FIX SCRATCH HISTORY TABLE SCHEMA
-- ============================================
-- This script ensures the scratch_history table exists with the correct schema
-- and RLS policies.
-- ============================================

-- Step 1: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS scratch_history (
    id BIGSERIAL PRIMARY KEY,
    user_session_id TEXT NOT NULL,
    day INTEGER NOT NULL,
    scratched_at TEXT NOT NULL, -- Storing YYYY-MM-DD string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_scratch_history_session ON scratch_history(user_session_id);
CREATE INDEX IF NOT EXISTS idx_scratch_history_day ON scratch_history(day);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE scratch_history ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy to allow all operations (public access for now, relies on session ID)
-- Drop existing policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "Enable all access for scratch_history" ON scratch_history;

CREATE POLICY "Enable all access for scratch_history" ON scratch_history
FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify:
SELECT * FROM scratch_history LIMIT 5;
