'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getTimeSinceAnniversary } from '@/lib/utils/dates'
import { ANNIVERSARY_DATE, MEMORY_TIMELINE } from '@/lib/constants/gameData'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '@/components/ui/Button'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const router = useRouter()
  const [timeElapsed, setTimeElapsed] = useState(getTimeSinceAnniversary(ANNIVERSARY_DATE))
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-heading font-bold gradient-text mb-6">
            The Memory Odyssey
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 font-body">
            Merayakan 1 Tahun Perjalanan Kita Bersama
          </p>

          {/* Real-time counter */}
          <div className="glass rounded-2xl p-6 max-w-2xl mx-auto mb-8">
            <p className="text-sm text-gray-600 mb-4 font-heading">Kita Sudah Bersama Selama:</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-3xl font-bold text-primary-500">{timeElapsed.days}</div>
                <div className="text-xs text-gray-500">Hari</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-500">{timeElapsed.hours}</div>
                <div className="text-xs text-gray-500">Jam</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-500">{timeElapsed.minutes}</div>
                <div className="text-xs text-gray-500">Menit</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-500">{timeElapsed.seconds}</div>
                <div className="text-xs text-gray-500">Detik</div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Mulai Perjalanan Kenangan 💕
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-4xl font-heading font-bold text-center gradient-text mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Perjalanan 12 Bulan Kita
          </motion.h2>

          <div className="space-y-12">
            {MEMORY_TIMELINE.map((memory, index) => (
              <motion.div
                key={memory.month}
                className="flex items-center gap-6 group"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Month number */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                  {memory.month}
                </div>

                {/* Content card */}
                <div className="flex-1 glass rounded-2xl p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-heading font-bold text-primary-600 mb-2">
                    {memory.title}
                  </h3>
                  <p className="text-gray-700 font-body">
                    {memory.description}
                  </p>
                  <div className="mt-4 h-40 bg-gray-200 rounded-xl overflow-hidden">
                    {/* Placeholder for image - will be replaced with actual photos */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📷 {memory.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to action to lobby */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/lobby')}
            >
              Lanjut ke Playground 🎮
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
