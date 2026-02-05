# The Memory Odyssey 💕

Sebuah website anniversary interaktif untuk merayakan 1 tahun perjalanan cinta. Dibuat dengan Next.js, featuring gamification, animasi indah, dan sistem daily rewards.

## ✨ Features

- 🎨 **Hero Timeline**: Scroll interaktif melalui 12 bulan kenangan
- ⏱️ **Real-time Counter**: Penghitung waktu real-time sejak anniversary
- 🎮 **4 Mini Games**:
  - **The Memory Match**: Game kartu memory dengan foto kenangan
  - **Quiz**: 10 pertanyaan tentang hubungan kalian
  - **Catch the Love**: Game menangkap objek jatuh
  - **Daily Scratch-off**: Kejutan harian yang bisa digosok
- 🎫 **Ticket System**: Daily login rewards (max 7 tiket dalam 7 hari)
- 🔒 **Passcode Auth**: Login dengan kode rahasia pribadi
- 🎵 **Background Music**: Music player dengan toggle mute
- 📱 **Mobile-First**: Fully responsive design
- 💝 **Romantic Design**: Pastel colors dengan micro-animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm atau yarn

### Installation

1. Clone atau navigate ke project directory:
\`\`\`bash
cd memory-odyssey
\`\`\`

2. Install dependencies (sudah dilakukan):
\`\`\`bash
npm install
\`\`\`

3. Create \`.env.local\` file:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Edit \`.env.local\` dengan konfigurasi Supabase kamu (optional untuk testing awal)

5. Run development server:
\`\`\`bash
npm run dev
\`\`\`

6. Buka browser di [http://localhost:3000](http://localhost:3000)

### Default Passcode

Untuk testing, default passcode adalah: **ANNIVERSARY2025**

Kamu bisa mengubahnya di `app/auth/page.tsx` line 18.

## 📁 Project Structure

\`\`\`
memory-odyssey/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Passcode login
│   ├── lobby/             # Game lobby
│   ├── games/             # Mini-games
│   │   ├── memory-match/
│   │   ├── quiz/
│   │   ├── catch-love/
│   │   └── scratch-off/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Hero timeline
├── components/            # Reusable components
│   ├── ui/               # UI components
│   │   ├── AudioPlayer.tsx
│   │   └── Button.tsx
│   ├── hero/             # Hero section (future)
│   ├── lobby/            # Lobby components
│   └── games/            # Game components
├── lib/                   # Utilities & configs
│   ├── supabase/         # Supabase client
│   ├── utils/            # Helper functions
│   └── constants/        # Game data & constants
├── public/               # Static assets
│   ├── images/months/    # 12 monthly photos
│   ├── audio/            # Background music
│   └── lottie/           # Lottie animations
└── styles/               # Global styles
\`\`\`

## 🎨 Customization Guide

### 1. Mengubah Quiz Questions

Edit \`lib/constants/gameData.ts\`:

\`\`\`typescript
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Pertanyaan kamu',
    options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
    correctAnswer: 0, // Index jawaban benar (0-3)
    sweetMessage: 'Pesan manis untuk jawaban benar'
  },
  // ... tambahkan lebih banyak pertanyaan
]
\`\`\`

### 2. Mengubah Scratch-off Messages (7 Hari)

Edit \`lib/constants/gameData.ts\`:

\`\`\`typescript
export const SCRATCH_OFF_MESSAGES = [
  {
    day: 1,
    title: 'Hari Pertama',
    message: 'Pesan romantis untuk hari pertama',
    image: '/images/scratch/day1.jpg'
  },
  // ... edit untuk 7 hari
]
\`\`\`

### 3. Menambahkan Foto Kenangan

1. Siapkan 12 foto untuk setiap bulan
2. Rename jadi: \`jan.jpg\`, \`feb.jpg\`, ..., \`dec.jpg\`
3. Copy ke folder \`public/images/months/\`
4. Update descriptions di \`lib/constants/gameData.ts\` → \`MEMORY_TIMELINE\`

### 4. Menambahkan Background Music

1. Copy file musik kamu (MP3) ke \`public/audio/bgm.mp3\`
2. Audio player akan otomatis memainkannya

### 5. Mengubah Color Palette

Edit \`tailwind.config.ts\`:

\`\`\`typescript
colors: {
  primary: {
    // Ubah warna utama di sini
    500: '#ea5a9d',
  },
  secondary: {
    // Ubah warna sekunder
    500: '#8b5cf6',
  },
}
\`\`\`

## 🔐 Supabase Setup (Optional - untuk Production)

Untuk fitur lengkap dengan cross-device sync dan security:

1. Buat akun di [https://supabase.com](https://supabase.com)
2. Create new project
3. Jalankan SQL migrations untuk membuat tables (lihat \`implementation_plan.md\`)
4. Copy API keys ke \`.env.local\`
5. Deploy Edge Functions (coming soon)

## 🌐 Deployment

### Deploy ke Vercel

1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables
4. Deploy!

Atau gunakan Vercel CLI:

\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

### Environment Variables untuk Production

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion, GSAP
- **3D**: Three.js, React Three Fiber
- **Database**: Supabase (optional)
- **Deployment**: Vercel

## 📱 Mobile Testing

Website ini dioptimasi untuk mobile. Untuk testing:

1. Buka di mobile browser
2. Atau gunakan Chrome DevTools (F12) → Toggle Device Toolbar
3. Test semua touch interactions

## 🎯 Next Steps

- [ ] Upload foto kenangan (12 bulan + 7 scratch-offs)
- [ ] Customize quiz questions
- [ ] Add background music file
- [ ] Change passcode
- [ ] Setup Supabase (optional)
- [ ] Deploy to Vercel
- [ ] Share with your loved one 💕

## 💖 Tips

- Website ini akan paling bermakna jika kamu personalisasi semua konten
- Pastikan foto-foto berkualitas bagus (compress dengan [TinyPNG](https://tinypng.com))
- Test di HP pacarmu sebelum kasih link
- Consider buat video walkthrough untuk dia

## 🐛 Troubleshooting

**Background music tidak play:**
- Browser memblok autoplay. User harus klik/tap dulu di halaman

**Game lag di mobile:**
- Compress foto-foto ke .webp format
- Reduce particle count di Catch the Love game

**Passcode tidak berfungsi:**
- Check di browser console (F12)
- Pastikan passcode match dengan yang di code

## 📄 License

Made with 💖 for your special someone. Free to use and customize.

---

**Selamat merayakan anniversary! Semoga website ini membuat hari spesialmu semakin berkesan! 💕✨**
