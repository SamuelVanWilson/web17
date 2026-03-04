'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { updateTickets, saveCatchLoveScore, getGameProgress } from '@/lib/supabase/helpers'

interface FallingObject {
    id: number
    x: number
    y: number
    speed: number
    emoji: string
}

const GAME_DURATION = 20 // seconds
const MAX_OBJECTS = 12 // Limit simultaneous falling objects for performance
const FALLING_CHAR = '💖' // Simple dot for better performance

export default function CatchLovePage() {
    const router = useRouter()
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isGameOver, setIsGameOver] = useState(false)
    const [basketPosition, setBasketPosition] = useState(50) // percentage
    const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([])
    const [floatingScores, setFloatingScores] = useState<{ id: number, x: number, y: number }[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [hasDeductedTicket, setHasDeductedTicket] = useState(false)
    const [heartsCaught, setHeartsCaught] = useState(0)
    const [currentTickets, setCurrentTickets] = useState<number | null>(null)
    const gameAreaRef = useRef<HTMLDivElement>(null)
    const nextIdRef = useRef(0)

    // Start game
    const startGame = async () => {
        // Reset ticket deduction flag
        setHasDeductedTicket(false)

        // Deduct ticket when starting game
        try {
            await updateTickets(-1)
            setHasDeductedTicket(true)
        } catch (error) {
            console.error('Failed to deduct ticket:', error)
            return // Don't start game if ticket deduction fails
        }

        setScore(0)
        setHeartsCaught(0)
        setTimeLeft(GAME_DURATION)
        setIsPlaying(true)
        setIsGameOver(false)
        setIsGameOver(false)
        setFallingObjects([])
        setFloatingScores([])
        nextIdRef.current = 0
    }

    // Timer
    useEffect(() => {
        if (!isPlaying || timeLeft <= 0) {
            if (timeLeft <= 0 && isPlaying) {
                setIsPlaying(false)

                // Save score to database
                setIsSaving(true)
                saveCatchLoveScore(score, heartsCaught)
                    .then(() => {
                        setIsSaving(false)
                        setIsGameOver(true)
                    })
                    .catch((error) => {
                        console.error('Failed to save catch love score:', error)
                        setIsSaving(false)
                        setIsGameOver(true)
                    })
            }
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [isPlaying, timeLeft, score, heartsCaught])

    // Load tickets when game ends
    useEffect(() => {
        async function loadTickets() {
            try {
                const progress = await getGameProgress()
                setCurrentTickets(progress.tickets)
            } catch (error) {
                console.error('Failed to load tickets:', error)
            }
        }
        if (isGameOver) {
            loadTickets()
        }
    }, [isGameOver])

    // Spawn falling objects - REDUCED RATE FOR PERFORMANCE
    useEffect(() => {
        if (!isPlaying) return

        const interval = setInterval(() => {
            setFallingObjects(prev => {
                // Limit max objects for performance
                if (prev.length >= MAX_OBJECTS) return prev

                const newObject: FallingObject = {
                    id: nextIdRef.current++,
                    x: Math.random() * 90, // 0-90%
                    y: -10,
                    speed: 2 + Math.random() * 1.5,
                    emoji: FALLING_CHAR
                }
                return [...prev, newObject]
            })
        }, 1500) // Increased for better performance

        return () => clearInterval(interval)
    }, [isPlaying])

    // Update falling objects - OPTIMIZED WITH LONGER INTERVAL
    useEffect(() => {
        if (!isPlaying) return

        const interval = setInterval(() => {
            setFallingObjects(prev => {
                const updated = prev.map(obj => ({
                    ...obj,
                    y: obj.y + obj.speed
                }))

                // Check collisions with basket
                const basketWidth = 15 // percentage
                const basketY = 85 // percentage

                updated.forEach(obj => {
                    if (
                        obj.y >= basketY - 5 &&
                        obj.y <= basketY + 5 &&
                        obj.x >= basketPosition - basketWidth / 2 &&
                        obj.x <= basketPosition + basketWidth / 2
                    ) {
                        setScore(s => s + 20)
                        setHeartsCaught(h => h + 1)
                        obj.y = 200 // Remove from screen

                        // Add floating score
                        const scoreId = Date.now() + Math.random()
                        setFloatingScores(prev => [...prev, { id: scoreId, x: obj.x, y: basketY - 10 }])

                        // Remove floating score after animation
                        setTimeout(() => {
                            setFloatingScores(prev => prev.filter(s => s.id !== scoreId))
                        }, 800)
                    }
                })

                // Remove objects that are off screen
                return updated.filter(obj => obj.y < 100)
            })
        }, 60) // 60ms = ~16fps for smooth animation

        return () => clearInterval(interval)
    }, [isPlaying, basketPosition]) // Removed startTime - it's constant

    // Handle mouse/touch movement
    const handleMove = (clientX: number) => {
        if (!gameAreaRef.current) return
        const rect = gameAreaRef.current.getBoundingClientRect()
        const x = ((clientX - rect.left) / rect.width) * 100
        setBasketPosition(Math.max(10, Math.min(90, x)))
    }

    return (
        <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-rose-100 flex flex-col relative touch-action-none select-none">
            <div className="w-full max-w-lg mx-auto h-full flex flex-col p-4">
                {/* Header - Compact */}
                <div className="flex justify-between items-center mb-4 shrink-0 z-20 relative">
                    <motion.button
                        onClick={() => router.push('/lobby')}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-rose-500 hover:bg-white transition-colors"
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="sr-only">Back</span>
                        ←
                    </motion.button>

                    {isPlaying && (
                        <div className="flex gap-3 text-sm font-bold">
                            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-rose-100 text-rose-600">
                                ⏱️ {timeLeft}s
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-rose-100 text-rose-600">
                                🎯 {score}
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Container - Fills remaining space */}
                <div className="flex-1 relative w-full h-full min-h-0 flex flex-col justify-center">

                    {!isPlaying && !isGameOver ? (
                        /* Start Screen */
                        <motion.div
                            className="bg-white/60 backdrop-blur-md rounded-3xl p-6 text-center shadow-xl border border-white/50 mx-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="text-6xl mb-4 animate-bounce">💝</div>
                            <h1 className="text-2xl font-bold text-rose-600 mb-2 font-heading">Catch the Love</h1>
                            <p className="text-rose-900/70 text-sm mb-6 leading-relaxed">
                                Pokoknya tangkep semua hati, kalau kamu sayang aku
                                <br />Tangkeep semuaa pokokknyaa!!!
                            </p>
                            <Button variant="primary" size="lg" onClick={startGame} className="w-full shadow-rose-200 shadow-lg">
                                Mulai Bermain
                            </Button>
                        </motion.div>
                    ) : isGameOver ? (
                        /* Game Over Screen */
                        <motion.div
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-xl border border-white/50 mx-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="text-7xl mb-4">
                                {score >= 500 ? '🏆' : score >= 300 ? '🌟' : '💕'}
                            </div>
                            <h2 className="text-3xl font-bold text-rose-600 mb-2">
                                {score >= 500 ? 'Perfect!' : score >= 300 ? 'Great Job!' : 'Good Try!'}
                            </h2>
                            <div className="text-5xl font-black text-rose-500 mb-6 tracking-tight">
                                {score}
                            </div>

                            <div className="space-y-3">
                                <Button variant="primary" size="lg" onClick={startGame} className="w-full">
                                    Main Lagi ↺
                                </Button>
                                <Button variant="secondary" size="md" onClick={() => router.push('/lobby')} className="w-full bg-white/50">
                                    Kembali ke Lobby
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        /* Active Game Area */
                        <div
                            ref={gameAreaRef}
                            className="absolute inset-0 w-full h-full overflow-hidden touch-none"
                            onMouseMove={(e) => handleMove(e.clientX)}
                            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                        >
                            {/* Falling Objects */}
                            {fallingObjects.map(obj => (
                                <div
                                    key={obj.id}
                                    className="absolute text-4xl leading-none select-none pointer-events-none"
                                    style={{
                                        left: `${obj.x}%`,
                                        top: `${obj.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        willChange: 'top'
                                    }}
                                >
                                    {obj.emoji}
                                </div>
                            ))}

                            {/* Floating Scores */}
                            {floatingScores.map(fs => (
                                <motion.div
                                    key={fs.id}
                                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                                    animate={{ opacity: 0, y: -50, scale: 1.2 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute text-xl font-bold text-rose-600 pointer-events-none z-10"
                                    style={{
                                        left: `${fs.x}%`,
                                        top: `${fs.y}%`,
                                        transform: 'translateX(-50%)',
                                        textShadow: '0 2px 4px rgba(255,255,255,0.8)'
                                    }}
                                >
                                    +20
                                </motion.div>
                            ))}

                            {/* Basket */}
                            <div
                                className="absolute bottom-8 text-6xl leading-none transition-transform duration-75 ease-out will-change-transform select-none pointer-events-none"
                                style={{
                                    left: `${basketPosition}%`,
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                🧺
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
