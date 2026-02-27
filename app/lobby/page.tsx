'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getGameProgress, updateLoginStreak } from '@/lib/supabase/helpers'
import { StarField } from '@/components/ui/StarField'
import { Trophy, ChevronLeft, Ticket } from 'lucide-react'

// Game Data with more visual focus
const GAME_ZONES = [
    {
        id: 'memory-match',
        title: 'Memory Match',
        emoji: '🎴',
        desc: 'Cocokkan kartu kenangan kita',
        path: '/games/memory-match',
        color: 'from-pink-500 to-rose-600',
        price: 1,
    },
    {
        id: 'quiz',
        title: 'Our Quiz',
        emoji: '❓',
        desc: 'Seberapa ingat kamu?',
        path: '/games/quiz',
        color: 'from-violet-500 to-indigo-600',
        price: 1,
    },
    {
        id: 'catch-love',
        title: 'Catch Love',
        emoji: '💝',
        desc: 'Tangkap cinta yang jatuh',
        path: '/games/catch-love',
        color: 'from-amber-400 to-orange-600',
        price: 1,
    },
    {
        id: 'scratch-off',
        title: 'Daily Surprise',
        emoji: '🎁',
        desc: 'Gosok dan temukan kejutan!',
        path: '/games/scratch-off',
        color: 'from-teal-400 to-emerald-600',
        price: 0, // Free
    },
]

export default function LobbyPage() {
    const router = useRouter()
    const [tickets, setTickets] = useState(0)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [ticketAwarded, setTicketAwarded] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function loadProgress() {
            try {
                const auth = localStorage.getItem('memoryOdysseyAuth')
                if (!auth) { router.push('/auth'); return }
                setIsAuthenticated(true)

                const streakResult = await updateLoginStreak()
                if (streakResult.awarded) {
                    setTicketAwarded(true)
                    setTimeout(() => setTicketAwarded(false), 4000)
                }

                const progress = await getGameProgress()
                setTickets(progress.tickets ?? 0)
            } catch (error) {
                console.warn('Lobby load error:', error)
                setTickets(0)
            } finally {
                setIsLoading(false)
            }
        }
        loadProgress()
    }, [router])

    const handleGameClick = (game: typeof GAME_ZONES[0]) => {
        if (game.price > 0 && tickets < game.price) {
            alert('Tiket kamu habis! Login besok lagi ya 🎫')
            return
        }
        router.push(game.path)
    }

    if (isLoading || !isAuthenticated) return null

    return (
        <div
            ref={containerRef}
            className="min-h-screen w-full bg-black text-white overflow-y-auto overflow-x-hidden relative selection:bg-yellow-500/30"
            style={{ fontFamily: "'Raleway', sans-serif" }}
        >
            {/* Background Animations */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <StarField scrollY={0} count={30} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-black/80" />
            </div>

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between px-6 pt-8 pb-6 md:py-8 max-w-5xl mx-auto">
                <button
                    onClick={() => router.push('/')}
                    className="p-3 -ml-2 rounded-full hover:bg-white/10 transition-colors group active:scale-95"
                >
                    <ChevronLeft className="w-7 h-7 text-white/70 group-hover:text-white" />
                </button>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md shadow-lg shadow-black/20">
                    <Ticket className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold font-mono text-yellow-100 text-lg tracking-wide" style={{ textShadow: '0 0 10px rgba(234,179,8,0.5)' }}>
                        {tickets}
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 pb-32 pt-4 max-w-5xl mx-auto flex flex-col items-center">

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 px-4"
                >
                    <h1
                        className="text-5xl md:text-6xl font-bold tracking-tight mb-3 leading-tight"
                        style={{
                            fontFamily: "'Quicksand', sans-serif",
                            background: 'linear-gradient(to right, #fde68a, #f59e0b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 40px rgba(245,158,11,0.3)',
                        }}
                    >
                        ARCADE<br className="md:hidden" /> ZONE
                    </h1>
                    <p className="text-white/50 text-base md:text-lg font-light tracking-wide mt-4">
                        Pilih permainan & kumpulkan kenangan
                    </p>
                </motion.div>

                {/* Game Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-3xl px-2">
                    {GAME_ZONES.map((game, i) => (
                        <motion.button
                            key={game.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleGameClick(game)}
                            className="group relative flex items-center gap-6 p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md text-left w-full overflow-hidden active:scale-[0.98]"
                        >
                            {/* Hover Glow */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${game.color}`} />

                            {/* Emoji Container */}
                            <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl shadow-xl shadow-black/30 group-hover:scale-110 transition-transform duration-300`}>
                                {game.emoji}
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white group-hover:text-yellow-200 transition-colors truncate" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                                    {game.title}
                                </h3>
                                <p className="text-xs text-white/50 mb-3 truncate">
                                    {game.desc}
                                </p>

                                {/* Price Badge */}
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 text-[10px] font-medium tracking-wide uppercase text-white/70 border border-white/5">
                                    {game.price === 0 ? (
                                        <span className="text-green-400">FREE</span>
                                    ) : (
                                        <>
                                            <span className="text-yellow-500">🎫</span> {game.price} TIKET
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Play Arrow */}
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <ChevronLeft className="w-4 h-4 text-white rotate-180" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Coming Soon Teaser */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 opacity-40 hover:opacity-100 transition-opacity duration-300 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-white/20 bg-white/5 text-xs text-white/60">
                        <Trophy className="w-3 h-3" />
                        <span>More games coming soon...</span>
                    </div>
                </motion.div>

            </main>

            {/* Daily Reward Toast */}
            <AnimatePresence>
                {ticketAwarded && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gradient-to-r from-gray-900 to-black border border-yellow-500/30 px-6 py-4 rounded-2xl shadow-2xl shadow-yellow-500/10"
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50 text-xl">
                            🎫
                        </div>
                        <div>
                            <h4 className="text-yellow-400 font-bold text-sm">Daily Reward!</h4>
                            <p className="text-white/70 text-xs">Kamu dapat 1 tiket gratis hari ini.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
