-- ============================================
-- RESET ALL DATA (untuk fresh start)
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Hapus semua data
DELETE FROM scratch_history;
DELETE FROM quiz_scores;
DELETE FROM catch_love_scores;
DELETE FROM memory_match_scores;
DELETE FROM game_progress;

-- Reset sequence ID hanya untuk tabel yang punya kolom 'id' (auto-increment)
-- scratch_history, quiz_scores, catch_love_scores, game_progress TIDAK punya id
-- hanya memory_match_scores yang punya id
SELECT setval(pg_get_serial_sequence('memory_match_scores', 'id'), 1, false);

-- Verifikasi semua tabel kosong
SELECT 'scratch_history' as tabel, COUNT(*) as jumlah FROM scratch_history
UNION ALL SELECT 'quiz_scores', COUNT(*) FROM quiz_scores
UNION ALL SELECT 'catch_love_scores', COUNT(*) FROM catch_love_scores
UNION ALL SELECT 'memory_match_scores', COUNT(*) FROM memory_match_scores
UNION ALL SELECT 'game_progress', COUNT(*) FROM game_progress;
