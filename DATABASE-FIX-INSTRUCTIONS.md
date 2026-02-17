# Cara Memperbaiki Database Error

## Masalah
Error: `duplicate key value violates unique constraint "memory_match_scores_pkey"`

## Penyebab
Tabel `memory_match_scores` menggunakan `user_session_id` sebagai PRIMARY KEY, padahal setiap user bisa bermain berkali-kali. Tabel perlu kolom `id` yang auto-increment.

## Solusi

### Langkah 1: Buka Supabase Dashboard
1. Buka https://supabase.com/dashboard
2. Login ke project kamu
3. Pilih project "Memory Odyssey" atau project yang kamu pakai
4. Klik tab **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan SQL Script
1. Klik **New query** atau **+ New Query**
2. Copy semua isi file [`fix-memory-match-table.sql`](file:///c:/Users/p/Documents/PROJECT/Web%2017%20Februari/memory-odyssey/fix-memory-match-table.sql)
3. Paste ke SQL Editor
4. Klik **Run** atau tekan `Ctrl+Enter`

### Langkah 3: Verifikasi
Setelah script berhasil, jalankan query ini untuk memastikan:
```sql
SELECT * FROM memory_match_scores ORDER BY completed_at DESC LIMIT 10;
```

Kamu harus melihat kolom `id` baru di hasil query.

## Hasil
Setelah fix ini:
- ✅ Bisa menyimpan multiple scores per user
- ✅ Tidak ada lagi error duplicate key
- ✅ Setiap game win akan tersimpan ke database

## Tentang "Batasan Move 20"
**Tidak ada batasan move di game ini!** Jika kamu melihat angka 20+, itu adalah jumlah moves yang sudah kamu lakukan, bukan batasan. Kamu bisa bermain selama yang kamu mau dengan moves sebanyak yang diperlukan.

Game ini **tidak membatasi** jumlah moves sama sekali. 🎴
