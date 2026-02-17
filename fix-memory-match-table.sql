-- ============================================
-- FIX MEMORY MATCH SCORES TABLE SCHEMA
-- ============================================
-- This script fixes the duplicate key error by:
-- 1. Backing up existing data
-- 2. Dropping the old table
-- 3. Creating new table with auto-increment ID
-- 4. Restoring the data
-- ============================================

-- Step 1: Create backup table
CREATE TABLE IF NOT EXISTS memory_match_scores_backup AS 
SELECT * FROM memory_match_scores;

-- Step 2: Drop the old table
DROP TABLE IF EXISTS memory_match_scores CASCADE;

-- Step 3: Create new table with proper schema
CREATE TABLE memory_match_scores (
    id BIGSERIAL PRIMARY KEY,
    user_session_id TEXT NOT NULL,
    moves INTEGER NOT NULL,
    time_seconds INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create index for better query performance
CREATE INDEX idx_memory_match_session ON memory_match_scores(user_session_id);
CREATE INDEX idx_memory_match_completed ON memory_match_scores(completed_at);

-- Step 5: Restore data from backup
INSERT INTO memory_match_scores (user_session_id, moves, time_seconds, completed_at)
SELECT user_session_id, moves, time_seconds, completed_at 
FROM memory_match_scores_backup;

-- Step 6: Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE memory_match_scores ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policy to allow all operations (adjust as needed)
CREATE POLICY "Enable all access for memory_match_scores" ON memory_match_scores
FOR ALL USING (true) WITH CHECK (true);

-- Step 8: Clean up backup table (optional - comment out if you want to keep backup)
-- DROP TABLE memory_match_scores_backup;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the fix worked:
SELECT * FROM memory_match_scores ORDER BY completed_at DESC LIMIT 10;
