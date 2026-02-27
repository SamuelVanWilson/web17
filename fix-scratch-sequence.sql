-- ============================================
-- FIX SCRATCH HISTORY SEQUENCE
-- ============================================
-- This script fixes the "duplicate key value" error by:
-- 1. Resetting the auto-increment sequence to the correct value.
-- ============================================

-- Reset the ID sequence to the maximum existing ID + 1
SELECT setval(
    pg_get_serial_sequence('scratch_history', 'id'),
    COALESCE((SELECT MAX(id) FROM scratch_history), 0) + 1,
    false
);

-- Verification: Print the current max ID
SELECT MAX(id) as current_max_id FROM scratch_history;
