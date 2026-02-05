'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

const GAME_ZONES = [
    {
        id: 'memory-match',
        title: '🎴 The Memory Match',
        description: 'Cocokkan kartu kenangan kita!',
        path: '/games/memory-match',
        color: 'from-pink-400 to-rose-500'
    },
    {
        id: 'quiz',
        title: '❓ How Well Do You Remember?',
        description: 'Seberapa ingat kamu tentang kita?',
        path: '/games/quiz',
        color: 'from-purple-400 to-indigo-500'
    },
    {
        id: 'catch-love',
        title: '💝 Catch the Love',
        description: 'Tangkap semua cinta yang jatuh!',
        path: '/games/catch-love',
        color: 'from-amber-400 to-orange-500'
    },
    {
        id: 'scratch-off',
        title: '🎁 Daily Surprise',
        description: 'Gosok dan temukan kejutan!',
        path: '/games/scratch-off',
        color: 'from-teal-400 to-cyan-500'
    },
]

export default function LobbyPage() {
    const router = useRouter()
    const [tickets, setTickets] = useState(0)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem('memoryOdysseyAuth')
        if (!auth) {
            router.push('/auth')
            return
        }
        setIsAuthenticated(true)

        // Load tickets from localStorage (will be replaced with Supabase)
        const storedTickets = localStorage.getItem('memoryOdysseyTickets')
        setTickets(storedTickets ? parseInt(storedTickets) : 7) // Start with 7 tickets for testing
    }, [router])

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header with tickets */}
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <motion.button
                        onClick={() => router.push('/')}
                        className="text-primary-600 hover:text-primary-700 font-heading"
                        whileHover={{ x: -5 }}
                    >
                        ← Kembali ke Timeline
                    </motion.button>

                    <motion.div
                        className="glass rounded-full px-6 py-3 flex items-center gap-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                    >
                        <span className="text-2xl">🎫</span>
                        <span className="font-heading font-bold text-lg">{tickets} Tiket</span>
                    </motion.div>
                </div>

                {/* Lobby Title */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl md:text-6xl font-heading font-bold gradient-text mb-4">
                        The Playground
                    </h1>
                    <p className="text-xl text-gray-700 font-body">
                        Pilih permainan untuk mendapatkan kenangan manis! 🎮
                    </p>
                </motion.div>

                {/* Game Zones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {GAME_ZONES.map((zone, index) => (
                        <motion.div
                            key={zone.id}
                            className="glass rounded-3xl p-8 hover:shadow-2xl transition-shadow cursor-pointer group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(zone.path)}
                            whileHover={{ y: -8 }}
                        >
                            <div className={`w-full h-32 rounded-2xl bg-gradient-to-br ${zone.color} mb-6 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform`}>
                                {zone.title.split(' ')[0]}
                            </div>

                            <h3 className="text-2xl font-heading font-bold text-gray-800 mb-2">
                                {zone.title}
                            </h3>
                            <p className="text-gray-600 font-body mb-4">
                                {zone.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <span className="text-lg">🎫</span> 1 Tiket
                                </span>
                                <span className="text-primary-500 font-semibold group-hover:translate-x-2 transition-transform">
                                    Mainkan →
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Info Section */}
                <motion.div
                    className="glass rounded-2xl p-6 text-center max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-gray-700 font-body mb-2">
                        💡 <strong>Tips:</strong> Login setiap hari untuk mendapatkan 1 tiket gratis!
                    </p>
                    <p className="text-sm text-gray-500">
                        Kamu bisa mengumpulkan maksimal 7 tiket dalam 7 hari
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
