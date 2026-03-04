'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Resource dengan ukuran file (bytes) — dipakai untuk weighted progress ──
const RESOURCES = [
    { url: '/video/landing-page/24_oktober.mp4', size: 7_132_430 },
    { url: '/video/landing-page/24_desember.mp4', size: 16_578_920 },
    { url: '/video/landing-page/25_januari.mp4', size: 6_701_656 },
    { url: '/video/landing-page/25_februari.mp4', size: 16_074_473 },
    { url: '/video/landing-page/25_maret.mp4', size: 13_506_956 },
    { url: '/video/landing-page/25_april.mp4', size: 9_374_689 },
    { url: '/video/landing-page/25_mei.mp4', size: 16_034_114 },
    { url: '/video/landing-page/25_juni.mp4', size: 19_093_993 },
    { url: '/video/landing-page/25_september.mp4', size: 12_901_298 },
    { url: '/video/landing-page/25_oktober.mp4', size: 13_140_794 },
    { url: '/video/landing-page/25_november.mp4', size: 11_346_630 },
    { url: '/video/landing-page/25_desember.mp4', size: 14_613_456 },
    { url: '/video/landing-page/26_januari.mp4', size: 17_936_379 },
    { url: '/video/landing-page/26_februari.mp4', size: 23_199_202 },
    { url: '/audio/backsound.mp3', size: 6_000_000 },
]

const TOTAL_BYTES = RESOURCES.reduce((s, r) => s + r.size, 0)
const CACHE_NAME = 'memory-odyssey-v1'
const CACHE_DONE_KEY = 'memoryOdysseyCacheDone'

interface PreloaderScreenProps {
    onComplete: () => void
}

export function PreloaderScreen({ onComplete }: PreloaderScreenProps) {
    // Progress hanya boleh naik — floor disimpan di ref
    const progressFloor = useRef(0)
    const [progress, setProgress] = useState(0)
    const [currentFile, setCurrentFile] = useState('')
    const [phase, setPhase] = useState<'checking' | 'downloading' | 'done'>('checking')

    /** Set progress yang dijamin tidak pernah turun */
    const safeSetProgress = useCallback((val: number) => {
        const clamped = Math.min(100, Math.max(0, Math.round(val)))
        if (clamped > progressFloor.current) {
            progressFloor.current = clamped
            setProgress(clamped)
        }
    }, [])

    const runPreload = useCallback(async () => {
        // Cache API tidak tersedia (old browser / private mode Firefox) — skip
        if (typeof caches === 'undefined') { onComplete(); return }

        // Kunjungan berulang di session yang sama — langsung masuk
        if (sessionStorage.getItem(CACHE_DONE_KEY) === '1') { onComplete(); return }

        const cache = await caches.open(CACHE_NAME)

        // Hitung bytes yang sudah ada di cache
        let cachedBytes = 0
        const toDownload: typeof RESOURCES = []
        for (const res of RESOURCES) {
            const match = await cache.match(res.url)
            if (match) {
                cachedBytes += res.size
            } else {
                toDownload.push(res)
            }
        }

        // Semua sudah ada di cache
        if (toDownload.length === 0) {
            sessionStorage.setItem(CACHE_DONE_KEY, '1')
            onComplete()
            return
        }

        setPhase('downloading')
        safeSetProgress((cachedBytes / TOTAL_BYTES) * 100)

        let downloadedBytes = cachedBytes

        for (const res of toDownload) {
            setCurrentFile(res.url.split('/').pop() ?? '')
            try {
                const response = await fetch(res.url)
                if (!response.ok || !response.body) {
                    // Gagal — skip, anggap file ini selesai agar tidak stuck
                    downloadedBytes += res.size
                    safeSetProgress((downloadedBytes / TOTAL_BYTES) * 100)
                    continue
                }

                // Streaming — update progress per chunk bytes (MONOTONIC karena safeSetProgress)
                const reader = response.body.getReader()
                const chunks: Uint8Array[] = []
                let fileBytesReceived = 0

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    chunks.push(value)
                    fileBytesReceived += value.length
                    safeSetProgress(((downloadedBytes + fileBytesReceived) / TOTAL_BYTES) * 100)
                }

                // Rekonstruksi response untuk disimpan ke cache
                const totalLen = chunks.reduce((a, c) => a + c.length, 0)
                const fullData = new Uint8Array(totalLen)
                let offset = 0
                for (const chunk of chunks) { fullData.set(chunk, offset); offset += chunk.length }

                await cache.put(res.url, new Response(fullData, {
                    status: response.status,
                    headers: response.headers,
                }))

                downloadedBytes += fileBytesReceived
            } catch {
                // Non-fatal — majukan progress pakai estimated size
                downloadedBytes += res.size
                safeSetProgress((downloadedBytes / TOTAL_BYTES) * 100)
            }
        }

        safeSetProgress(100)
        sessionStorage.setItem(CACHE_DONE_KEY, '1')
        setPhase('done')

        await new Promise(r => setTimeout(r, 600))
        onComplete()
    }, [onComplete, safeSetProgress])

    useEffect(() => { runPreload() }, [runPreload])

    const tips = [
        '🎁 Menyiapkan kejutan untuk kamu...',
        '💕 Mengumpulkan kenangan-kenangan kita...',
        '✨ Memuat momen-momen terbaik kita...',
        '🎬 Menata kenangan indah...',
        '💖 Hampir siap, sabar ya!',
    ]
    const tipIndex = Math.min(Math.floor((progress / 100) * tips.length), tips.length - 1)

    return (
        <div
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black select-none"
            style={{ fontFamily: "'Raleway', sans-serif" }}
        >
            {/* Bintang-bintang latar */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(14)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: (i % 3) + 1.5,
                            height: (i % 3) + 1.5,
                            left: `${(i * 7.3) % 100}%`,
                            top: `${(i * 13.7) % 100}%`,
                            background: 'rgba(253,230,138,0.45)',
                        }}
                        animate={{ opacity: [0.15, 0.9, 0.15] }}
                        transition={{ repeat: Infinity, duration: 2.5 + (i % 3), delay: i * 0.18 }}
                    />
                ))}
            </div>

            <motion.div
                className="z-10 flex flex-col items-center gap-8 w-full max-w-xs px-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Ikon */}
                <motion.div
                    className="text-6xl"
                    animate={phase === 'done'
                        ? { scale: [1, 1.4, 1], rotate: [0, 12, -12, 0] }
                        : { scale: [1, 1.08, 1] }
                    }
                    transition={{
                        repeat: phase === 'done' ? 0 : Infinity,
                        duration: phase === 'done' ? 0.5 : 2.5,
                        ease: 'easeInOut',
                    }}
                >
                    {phase === 'done' ? '✨' : '💕'}
                </motion.div>

                {/* Judul */}
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
                        <span className="text-[10px] uppercase tracking-widest text-white/25 font-bold">
                            {phase === 'downloading' ? 'Mengunduh...' : ''}
                        </span>
                        <span
                            className="text-sm font-bold tabular-nums"
                            style={{ color: '#fde68a', fontFamily: "'Quicksand', sans-serif" }}
                        >
                            {progress}%
                        </span>
                    </div>

                    {/* Trek progress */}
                    <div
                        className="relative w-full h-2.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        {/* Fill — animate ke width terbaru, TIDAK PERNAH mundur */}
                        <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                                background: 'linear-gradient(90deg, #92400e, #b45309, #d97706, #fde68a)',
                                boxShadow: '0 0 12px rgba(245,158,11,0.6)',
                            }}
                            animate={{ width: `${Math.max(progress, phase === 'checking' ? 2 : 0)}%` }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                        />
                        {/* Shimmer */}
                        <motion.div
                            className="absolute inset-y-0 w-20 rounded-full"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
                            animate={{ left: ['-15%', '115%'] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                        />
                    </div>

                    {/* Nama file */}
                    <AnimatePresence mode="wait">
                        {currentFile && phase === 'downloading' && (
                            <motion.p
                                key={currentFile}
                                className="text-[10px] mt-2 text-center truncate"
                                style={{ color: 'rgba(255,255,255,0.18)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {currentFile}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'rgba(253,230,138,0.5)' }}
                            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
