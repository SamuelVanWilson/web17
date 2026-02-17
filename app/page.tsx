'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { getTimeSinceAnniversary } from '@/lib/utils/dates'
import { ANNIVERSARY_DATE, MEMORY_TIMELINE } from '@/lib/constants/gameData'
import Button from '@/components/ui/Button'
import { ChevronDown } from 'lucide-react'

import { FloatingBackground } from '@/components/ui/FloatingBackground'


export default function HomePage() {
  const router = useRouter()
  const [timeElapsed, setTimeElapsed] = useState(getTimeSinceAnniversary(ANNIVERSARY_DATE))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('memoryOdysseyAuth')
    if (!auth) {
      router.push('/auth')
      return
    }
    setIsAuthenticated(true)

    // Update timer every second
    const interval = setInterval(() => {
      setTimeElapsed(getTimeSinceAnniversary(ANNIVERSARY_DATE))
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  if (!isAuthenticated) return null

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-orange-50 scroll-smooth font-sans text-gray-900"
    >

      {/* Hero Section */}
      <section className="h-screen w-full snap-center relative flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        <FloatingBackground />

        <motion.div
          className="z-10 relative w-full max-w-lg flex flex-col items-center gap-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: false }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-block px-6 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/50 text-xs font-bold text-primary-500 shadow-sm tracking-[0.2em] uppercase"
          >
            The Memory Odyssey
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-8xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 drop-shadow-sm leading-tight"
          >
            Our Journey<br />Together
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-base md:text-xl text-gray-600 font-body max-w-xs md:max-w-md mx-auto leading-loose"
          >
            Setiap detik adalah cerita, setiap hari adalah kenangan.
            <br />Selamat merayakan perjalanan hebat ini.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => {
                const nextSection = document.getElementById('memory-0')
                nextSection?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Mulai Perjalanan 👇
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-gray-400/60"
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* Memory Timeline Sections */}
      {MEMORY_TIMELINE.map((memory, index) => (
        <section
          id={`memory-${index}`}
          key={memory.month}
          className="h-screen w-full snap-center relative flex flex-col items-center justify-center p-6 overflow-hidden"
        >
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40 pointer-events-none" />

          <motion.div
            className="z-10 w-[90vw] max-w-md"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ type: "spring", stiffness: 40, damping: 20, duration: 0.8 }}
          >
            {/* Polaroid Card */}
            <div className="bg-white p-6 pb-8 md:p-8 md:pb-12 shadow-xl rounded-sm transform transition-all duration-700 hover:shadow-2xl border border-gray-100">
              {/* Image Placeholder */}
              <div className="aspect-[4/5] bg-gray-50 mb-8 relative overflow-hidden group w-full shadow-inner rounded-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-6xl mb-4"
                  >
                    📸
                  </motion.span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-40">Memory {index + 1}</span>
                </div>

                {/* Month Badge - Cleaner look */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/60">
                  <span className="font-bold text-sm text-primary-500 uppercase tracking-widest">Bulan {memory.month}</span>
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center px-2 flex flex-col gap-4">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-heading text-2xl md:text-3xl font-bold text-gray-800"
                >
                  {memory.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="font-body text-gray-500 text-sm md:text-base leading-loose"
                >
                  {memory.description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </section>
      ))}

      {/* Timer Section - The Finale */}
      <section className="h-screen w-full snap-center relative flex flex-col items-center justify-center p-8 text-center overflow-hidden bg-gradient-to-b from-orange-50/50 to-pink-50/50">
        <FloatingBackground />

        <motion.div
          className="z-10 w-full max-w-lg flex flex-col items-center gap-12"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1 }}
        >
          <div>
            <h3 className="text-sm font-bold text-primary-400 mb-12 uppercase tracking-[0.3em]">
              Kita Bersama Selama
            </h3>

            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
              {[
                { label: 'Hari', value: timeElapsed.days },
                { label: 'Jam', value: timeElapsed.hours },
                { label: 'Menit', value: timeElapsed.minutes },
                { label: 'Detik', value: timeElapsed.seconds }
              ].map((item, i) => (
                <div key={item.label} className="flex flex-col items-center">
                  <span className="text-5xl md:text-7xl font-bold text-primary-600 font-heading tracking-tight leading-none">
                    {item.value}
                  </span>
                  <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-gray-500 italic text-sm font-medium">
              "Dan perjalanan ini baru saja dimulai..."
            </p>
            <Button
              onClick={() => router.push('/lobby')}
            >
              Masuk ke Lobby ✨
            </Button>
          </motion.div>
        </motion.div>
      </section>

    </div>
  )
}
