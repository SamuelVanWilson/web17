'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getTimeSinceAnniversary } from '@/lib/utils/dates'
import { ANNIVERSARY_DATE, MEMORY_TIMELINE } from '@/lib/constants/gameData'
import Button from '@/components/ui/Button'
import { FloatingBackground } from '@/components/ui/FloatingBackground'
import { StarField } from '@/components/ui/StarField'
import { PreloaderScreen } from '@/components/ui/PreloaderScreen'
import { ChevronDown, Volume2, VolumeX } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isPreloading, setIsPreloading] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(getTimeSinceAnniversary(ANNIVERSARY_DATE))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Auth + timer
  useEffect(() => {
    const auth = localStorage.getItem('memoryOdysseyAuth')
    if (!auth) { router.push('/auth'); return }
    setIsAuthenticated(true)
    // Prefetch lobby route agar navigasi ke lobby terasa instan
    router.prefetch('/lobby')
    const interval = setInterval(() => setTimeElapsed(getTimeSinceAnniversary(ANNIVERSARY_DATE)), 1000)
    return () => clearInterval(interval)
  }, [router])

  // Music on first interaction
  const tryPlayMusic = useCallback(() => {
    if (!hasInteracted && audioRef.current) {
      audioRef.current.volume = 0.4
      audioRef.current.play().catch(() => { })
      setHasInteracted(true)
    }
  }, [hasInteracted])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('click', tryPlayMusic, { once: true })
    el.addEventListener('touchstart', tryPlayMusic, { once: true })
    return () => {
      el.removeEventListener('click', tryPlayMusic)
      el.removeEventListener('touchstart', tryPlayMusic)
    }
  }, [tryPlayMusic, isAuthenticated])

  const toggleMute = () => {
    if (!audioRef.current) return
    if (!hasInteracted) {
      audioRef.current.volume = 0.4
      audioRef.current.play().catch(() => { })
      setHasInteracted(true)
      setIsMuted(false)
    } else {
      const next = !isMuted
      setIsMuted(next)
      audioRef.current.muted = next
    }
  }

  if (!isAuthenticated) return null

  // Tampilkan preloader sebelum konten utama
  if (isPreloading) {
    return <PreloaderScreen onComplete={() => setIsPreloading(false)} />
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      <audio ref={audioRef} src="/audio/backsound.mp3" loop preload="none" />

      {/* Music toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 transition-all duration-200"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
      >
        {isMuted || !hasInteracted
          ? <VolumeX size={15} className="text-white/60" />
          : <Volume2 size={15} className="text-yellow-200/80" />
        }
      </button>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="h-screen w-full snap-center relative flex flex-col items-center justify-center text-center overflow-hidden bg-black">
        <StarField count={15} />

        <motion.div
          className="z-10 relative flex flex-col items-center gap-6 px-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.25em] font-bold"
            style={{ color: 'rgba(253,230,138,0.7)' }}
          >
            ✦ Memori Kenangan Muel & Revi
          </span>

          <h1
            className="text-4xl font-bold leading-tight"
            style={{
              fontFamily: "'Quicksand', sans-serif",
              background: 'linear-gradient(135deg, #fffbe6 0%, #fde68a 40%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Perjalanan Kita Bersama
          </h1>

          <p className="text-sm leading-loose" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Setiap detik adalah cerita,<br />setiap hari adalah kenangan.
          </p>

          <button
            onClick={() => document.getElementById('memory-0')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-2 px-12 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Quicksand', sans-serif",
              background: 'linear-gradient(135deg, #78350f, #b45309, #d97706)',
              color: '#fde68a',
              border: '1px solid rgba(253,230,138,0.35)',
              boxShadow: '0 0 20px rgba(217,119,6,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
              letterSpacing: '0.05em',
              padding: '12px 24px',
            }}
          >
            Mulai Perjalanan ✨
          </button>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.25)' }} />
        </motion.div>
      </section>

      {/* ── MEMORY SECTIONS ───────────────────────────── */}
      {MEMORY_TIMELINE.map((memory, index) => {
        return (
          <section
            id={`memory-${index}`}
            key={memory.month}
            className="h-screen w-full snap-center relative flex flex-col items-center justify-center p-6 overflow-hidden bg-black"
          >
            <StarField count={12} />

            <motion.div
              className="z-10 w-full max-w-sm"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-15%' }}
              transition={{ type: 'spring', stiffness: 38, damping: 18 }}
            >
              {/* Card */}
              <div
                className="rounded-xl overflow-hidden border"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.8)',
                }}
              >
                {/* Video */}
                <div className="aspect-[4/5] relative bg-black">
                  <video
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none' }}
                  >
                    <source src={memory.image} type="video/mp4" />
                  </video>

                  {/* Fallback */}
                  <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl opacity-30">📸</span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
                      Bulan {memory.month}
                    </span>
                  </div>

                  {/* Month badge */}
                  <span
                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(253,230,138,0.3)',
                      color: '#fde68a',
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    Bulan {memory.month}
                  </span>
                </div>

                {/* Text */}
                <div className="p-4 flex flex-col gap-2 text-center">
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Quicksand', sans-serif", color: '#f3f4f6' }}
                  >
                    {memory.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {memory.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Progress dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {MEMORY_TIMELINE.map((_, i) => (
                <button
                  key={i}
                  onClick={() => document.getElementById(`memory-${i}`)?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    width: i === index ? 18 : 5,
                    height: 5,
                    borderRadius: 999,
                    background: i === index ? '#fde68a' : 'rgba(255,255,255,0.18)',
                    boxShadow: i === index ? '0 0 8px rgba(253,230,138,0.6)' : 'none',
                    transition: 'all 0.3s',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </section>
        )
      })}

      {/* ── TIMER / LOBBY ─────────────────────────────── */}
      <section
        className="h-screen w-full snap-center relative flex flex-col items-center justify-center p-8 text-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0e0008 0%, #1a0010 50%, #100015 100%)' }}
      >
        <FloatingBackground />

        <motion.div
          className="z-10 w-full max-w-sm flex flex-col items-center gap-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9 }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8" style={{ color: 'rgba(244,114,182,0.7)' }}>
              ✨ Kita Bersama Selama
            </p>
            <div className="grid grid-cols-2 gap-x-10 gap-y-7">
              {[
                { label: 'Hari', value: timeElapsed.days },
                { label: 'Jam', value: timeElapsed.hours },
                { label: 'Menit', value: timeElapsed.minutes },
                { label: 'Detik', value: timeElapsed.seconds },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <span
                    className="text-5xl font-bold leading-none"
                    style={{ fontFamily: "'Quicksand', sans-serif", color: '#f9a8d4' }}
                  >
                    {item.value}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(249,168,212,0.45)' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="italic text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              "Dan perjalanan ini baru saja dimulai..."
            </p>
            <Button onClick={() => router.push('/lobby')}>
              Masuk ke Lobby 🎮
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
