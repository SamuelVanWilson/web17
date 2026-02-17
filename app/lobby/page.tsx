'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { getGameProgress, updateLoginStreak } from '@/lib/supabase/helpers'
import { FloatingBackground } from '@/components/ui/FloatingBackground'

const GAME_ZONES = [
    {
        id: 'memory-match',
        title: '🎴 The Memory Match',
        description: 'Cocokkan kartu kenangan kita!',
        path: '/games/memory-match',
        color: 'from-pink-400 to-rose-500',
        requiresTicket: true
    },
    {
        id: 'quiz',
        title: '❓ How Well Do You Remember?',
        description: 'Seberapa ingat kamu tentang kita?',
        path: '/games/quiz',
        color: 'from-purple-400 to-indigo-500',
        requiresTicket: true
    },
    {
        id: 'catch-love',
        title: '💝 Catch the Love',
        description: 'Tangkap semua cinta yang jatuh!',
        path: '/games/catch-love',
        color: 'from-amber-400 to-orange-500',
        requiresTicket: true
    },
    {
        id: 'scratch-off',
        title: '🎁 Daily Surprise',
        description: 'Gosok dan temukan kejutan!',
        path: '/games/scratch-off',
        color: 'from-teal-400 to-cyan-500',
        requiresTicket: false // Free daily game
    },
]

export default function LobbyPage() {
    const router = useRouter()
    const [tickets, setTickets] = useState(0)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [ticketAwarded, setTicketAwarded] = useState(false)

    useEffect(() => {
        async function loadProgress() {
            try {
                // Check authentication
                const auth = localStorage.getItem('memoryOdysseyAuth')
                if (!auth) {
                    router.push('/auth')
                    return
                }
                setIsAuthenticated(true)

                // Update login streak and check for daily ticket reward
                const streakResult = await updateLoginStreak()

                if (streakResult.awarded) {
                    setTicketAwarded(true)
                    // Show notification briefly
                    setTimeout(() => setTicketAwarded(false), 3000)
                }

                // Load current tickets from database
                const progress = await getGameProgress()
                setTickets(progress.tickets)

            } catch (error) {
                console.error('Error loading game progress:', error)
                // Fallback: if database fails, still allow play but show 0 tickets
                setTickets(0)
            } finally {
                setIsLoading(false)
            }
        }

        loadProgress()
    }, [router])

    const handleGameClick = (zone: typeof GAME_ZONES[0]) => {
        // Check if game requires ticket
        if (zone.requiresTicket && tickets <= 0) {
            alert('Tiket kamu habis! Login besok untuk mendapat tiket baru 🎫')
            return
        }
        router.push(zone.path)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🎮</div>
                    <p className="text-gray-600 font-body">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen p-6 md:p-8 relative overflow-hidden bg-orange-50/30">
            <FloatingBackground />

            {/* Ticket Awarded Notification */}
            {ticketAwarded && (
                <motion.div
                    className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-green-100"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🎫</span>
                        <div>
                            <p className="font-heading font-bold text-green-600">+1 Tiket!</p>
                            <p className="text-sm text-gray-600 font-body">Login harian kamu</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Header with tickets */}
            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="flex flex-col-reverse md:flex-row justify-between items-center mb-8 gap-4">
                    <motion.button
                        onClick={() => router.push('/')}
                        className="text-primary-600 hover:text-primary-700 font-heading font-semibold text-sm md:text-base bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
                        whileHover={{ x: -5 }}
                    >
                        ← Kembali ke Timeline
                    </motion.button>

                    <motion.div
                        className="bg-white/80 backdrop-blur-md rounded-full px-6 py-2 md:py-3 flex items-center gap-2 shadow-sm border border-white/50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                    >
                        <span className="text-xl md:text-2xl">🎫</span>
                        <span className="font-heading font-bold text-base md:text-lg text-gray-800">{tickets} Tiket</span>
                    </motion.div>
                </div>

                {/* Lobby Title */}
                <motion.div
                    className="text-center mb-10 md:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-6xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-3 drop-shadow-sm">
                        The Playground
                    </h1>
                    <p className="text-base md:text-xl text-gray-600 font-body max-w-md mx-auto leading-relaxed">
                        Pilih permainan untuk mendapatkan kenangan manis! 🎮
                    </p>
                </motion.div>

                {/* Game Zones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {GAME_ZONES.map((zone, index) => (
                        <motion.div
                            key={zone.id}
                            className={`bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-white/60 relative overflow-hidden ${zone.requiresTicket && tickets <= 0 ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleGameClick(zone)}
                            whileHover={zone.requiresTicket && tickets <= 0 ? {} : { y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={`w-full h-24 md:h-32 rounded-2xl bg-gradient-to-br ${zone.color} mb-6 flex items-center justify-center text-4xl md:text-6xl shadow-inner group-hover:scale-[1.02] transition-transform duration-500`}>
                                <span className="drop-shadow-md filter">{zone.title.split(' ')[0]}</span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-heading font-bold text-gray-800 mb-2">
                                {zone.title.substring(2)} {/* Remove icon from title string if needed, currently reusing full string */}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 font-body mb-6 leading-relaxed">
                                {zone.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs md:text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                                    <span>🎫</span> {zone.requiresTicket ? '1 Tiket' : 'Gratis'}
                                </span>
                                <span className="text-primary-600 font-bold text-sm md:text-base group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                    Mainkan <span className="text-lg">→</span>
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Info Section */}
                <motion.div
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 text-center max-w-xl mx-auto border border-white/50 shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-gray-700 font-body mb-2 text-sm md:text-base">
                        💡 <strong>Tips:</strong> Login setiap hari untuk mendapatkan 1 tiket gratis!
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                        Kamu bisa mengumpulkan maksimal 7 tiket dalam 7 hari
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
