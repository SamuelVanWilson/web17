'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── semua resource yang perlu di-cache ─────────────────────────
const VIDEO_RESOURCES = [
    '/video/landing-page/24_oktober.mp4',
    '/video/landing-page/24_desember.mp4',
    '/video/landing-page/25_januari.mp4',
    '/video/landing-page/25_februari.mp4',
    '/video/landing-page/25_maret.mp4',
    '/video/landing-page/25_april.mp4',
    '/video/landing-page/25_mei.mp4',
    '/video/landing-page/25_juni.mp4',
    '/video/landing-page/25_september.mp4',
    '/video/landing-page/25_oktober.mp4',
    '/video/landing-page/25_november.mp4',
    '/video/landing-page/25_desember.mp4',
    '/video/landing-page/26_januari.mp4',
    '/video/landing-page/26_februari.mp4',
]
const AUDIO_RESOURCES = ['/audio/backsound.mp3']
const ALL_RESOURCES = [...VIDEO_RESOURCES, ...AUDIO_RESOURCES]

const CACHE_NAME = 'memory-odyssey-v1'
const CACHE_DONE_KEY = 'memoryOdysseyCacheDone'

interface PreloaderScreenProps {
    onComplete: () => void
}

export function PreloaderScreen({ onComplete }: PreloaderScreenProps) {
    const [progress, setProgress] = useState(0)
    const [loadedCount, setLoadedCount] = useState(0)
    const [currentFile, setCurrentFile] = useState('')
    const [phase, setPhase] = useState<'checking' | 'downloading' | 'done'>('checking')

    const total = ALL_RESOURCES.length

    const runPreload = useCallback(async () => {
        // Jika Cache API tidak tersedia (mis. old browser), langsung skip
        if (typeof caches === 'undefined') {
            onComplete()
            return
        }

        // Cek apakah sudah pernah di-cache sebelumnya
        const cached = sessionStorage.getItem(CACHE_DONE_KEY)
        if (cached === '1') {
            onComplete()
            return
        }

        // Cek berapa yang sudah ada di cache
        const cache = await caches.open(CACHE_NAME)
        const alreadyCached: string[] = []
        for (const url of ALL_RESOURCES) {
            const match = await cache.match(url)
            if (match) alreadyCached.push(url)
        }

        if (alreadyCached.length === ALL_RESOURCES.length) {
            // Semua sudah ada di cache — langsung lanjut
            sessionStorage.setItem(CACHE_DONE_KEY, '1')
            onComplete()
            return
        }

        // Ada yang belum di-cache — mulai download
        setPhase('downloading')

        const toDownload = ALL_RESOURCES.filter(url => !alreadyCached.includes(url))
        let done = alreadyCached.length

        // Update progress awal dari yang sudah cached
        setProgress(Math.round((done / total) * 100))
        setLoadedCount(done)

        for (const url of toDownload) {
            try {
                setCurrentFile(url.split('/').pop() ?? url)

                // Fetch dengan streaming agar progress bisa dipantau
                const response = await fetch(url)
                if (response.ok) {
                    await cache.put(url, response.clone())
                }
            } catch {
                // Non-fatal: kalau gagal download salah satu, lanjut aja
            } finally {
                done++
                setLoadedCount(done)
                setProgress(Math.round((done / total) * 100))
            }
        }

        sessionStorage.setItem(CACHE_DONE_KEY, '1')
        setPhase('done')

        // Tunggu sebentar biar animasi done keliatan
        await new Promise(r => setTimeout(r, 700))
        onComplete()
    }, [onComplete, total])

    useEffect(() => {
        runPreload()
    }, [runPreload])

    const tips = [
        '🎁 Menyiapkan kejutan untuk kamu...',
        '💕 Mengumpulkan kenangan-kenangan kita...',
        '✨ Memuat momen-momen terbaik kita...',
        '🎬 Menata kenangan indah...',
        '💖 Hampir siap, sabar ya!',
    ]
    const tipIndex = Math.floor((progress / 100) * (tips.length - 1))

    return (
        <div
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black select-none"
            style={{ fontFamily: "'Raleway', sans-serif" }}
        >
            {/* Subtle animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: Math.random() * 3 + 1,
                            height: Math.random() * 3 + 1,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: 'rgba(253,230,138,0.4)',
                        }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{
                            repeat: Infinity,
                            duration: Math.random() * 2 + 2,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <motion.div
                className="z-10 flex flex-col items-center gap-8 w-full max-w-xs px-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Logo / Icon */}
                <motion.div
                    className="text-6xl"
                    animate={phase === 'done'
                        ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] }
                        : { scale: [1, 1.08, 1] }
                    }
                    transition={{
                        repeat: phase === 'done' ? 0 : Infinity,
                        duration: phase === 'done' ? 0.6 : 2.5,
                        ease: 'easeInOut',
                    }}
                >
                    {phase === 'done' ? '✨' : '💕'}
                </motion.div>

                {/* Title */}
                <div className="text-center">
                    <h1
                        className="text-2xl font-bold mb-1"
                        style={{
                            fontFamily: "'Quicksand', sans-serif",
                            background: 'linear-gradient(135deg, #fffbe6, #fde68a, #f59e0b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {phase === 'done' ? 'Siap!' : 'Menyiapkan Kenangan'}
                    </h1>
                    <p className="text-white/40 text-xs">
                        {phase === 'checking'
                            ? 'Memeriksa cache...'
                            : phase === 'done'
                                ? 'Semua kenangan sudah siap 💖'
                                : tips[tipIndex]}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                            {phase === 'downloading' ? `${loadedCount} / ${total} file` : ''}
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#fde68a' }}>
                            {progress}%
                        </span>
                    </div>

                    {/* Track */}
                    <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                                background: 'linear-gradient(90deg, #b45309, #d97706, #fde68a)',
                                boxShadow: '0 0 10px rgba(245,158,11,0.7)',
                            }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${Math.max(progress, phase === 'checking' ? 3 : 0)}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                        {/* Shimmer */}
                        <motion.div
                            className="absolute inset-y-0 w-16 rounded-full"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
                            animate={{ left: ['-10%', '110%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        />
                    </div>

                    {/* Current file name */}
                    <AnimatePresence mode="wait">
                        {currentFile && phase === 'downloading' && (
                            <motion.p
                                key={currentFile}
                                className="text-[10px] text-white/20 mt-2 text-center truncate"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {currentFile}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Dots indicator */}
                <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'rgba(253,230,138,0.5)' }}
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                delay: i * 0.2,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
