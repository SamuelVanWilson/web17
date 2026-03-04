-- ============================================================
-- RESET ALL DATA - Memory Odyssey
-- ⚠️  WARNING: Menghapus SEMUA data dari semua tabel!
--              Jalankan hanya di Supabase SQL Editor.
-- ============================================================

-- Hapus semua scratch history
TRUNCATE TABLE scratch_history RESTART IDENTITY CASCADE;

-- Hapus semua skor quiz
TRUNCATE TABLE quiz_scores RESTART IDENTITY CASCADE;

-- Hapus semua skor memory match
TRUNCATE TABLE memory_match_scores RESTART IDENTITY CASCADE;

-- Hapus semua skor catch love
TRUNCATE TABLE catch_love_scores RESTART IDENTITY CASCADE;

-- Hapus semua game progress (ini yang paling utama — hapus session user)
TRUNCATE TABLE game_progress RESTART IDENTITY CASCADE;

-- Verifikasi semua tabel sudah kosong
SELECT 'game_progress'      AS tabel, COUNT(*) AS jumlah_baris FROM game_progress
UNION ALL
SELECT 'scratch_history'    AS tabel, COUNT(*) AS jumlah_baris FROM scratch_history
UNION ALL
SELECT 'quiz_scores'        AS tabel, COUNT(*) AS jumlah_baris FROM quiz_scores
UNION ALL
SELECT 'memory_match_scores' AS tabel, COUNT(*) AS jumlah_baris FROM memory_match_scores
UNION ALL
SELECT 'catch_love_scores'  AS tabel, COUNT(*) AS jumlah_baris FROM catch_love_scores;
