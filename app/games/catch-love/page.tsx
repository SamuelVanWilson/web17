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

const GAME_DURATION = 60 // seconds
const MAX_OBJECTS = 12 // Limit simultaneous falling objects for performance
const FALLING_CHAR = '•' // Simple dot for better performance

export default function CatchLovePage() {
    const router = useRouter()
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isGameOver, setIsGameOver] = useState(false)
    const [basketPosition, setBasketPosition] = useState(50) // percentage
    const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([])
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
        setFallingObjects([])
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
                        setScore(s => s + 10)
                        setHeartsCaught(h => h + 1)
                        obj.y = 200 // Remove from screen
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
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <motion.button
                        onClick={() => router.push('/lobby')}
                        className="text-primary-600 hover:text-primary-700 font-heading"
                        whileHover={{ x: -5 }}
                    >
                        ← Kembali ke Lobby
                    </motion.button>

                    {isPlaying && (
                        <div className="flex gap-4">
                            <div className="glass rounded-lg px-4 py-2">
                                <span className="font-heading font-semibold">⏱️ {timeLeft}s</span>
                            </div>
                            <div className="glass rounded-lg px-4 py-2">
                                <span className="font-heading font-semibold">🎯 {score}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Title */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-2">
                        💝 Catch the Love
                    </h1>
                    <p className="text-gray-700 font-body">
                        Tangkap semua cinta yang jatuh!
                    </p>
                </motion.div>

                {!isPlaying && !isGameOver ? (
                    /* Start Screen */
                    <motion.div
                        className="glass rounded-3xl p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-6xl mb-4">💝</div>
                        <h2 className="text-2xl font-heading font-bold mb-4">
                            Cara Bermain
                        </h2>
                        <p className="text-gray-700 font-body mb-6">
                            Gerakkan keranjang (🧺) menggunakan mouse atau jari untuk menangkap titik-titik yang jatuh!<br />
                            Kamu punya 60 detik untuk mengumpulkan score sebanyak-banyaknya!
                        </p>
                        <Button variant="primary" size="lg" onClick={startGame}>
                            Mulai Permainan 🎮
                        </Button>
                    </motion.div>
                ) : isGameOver ? (
                    /* Game Over Screen */
                    <motion.div
                        className="glass rounded-3xl p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-7xl mb-4">
                            {score >= 500 ? '🏆' : score >= 300 ? '🌟' : '💕'}
                        </div>
                        <h2 className="text-4xl font-heading font-bold gradient-text mb-4">
                            {score >= 500 ? 'Luar Biasa!' : score >= 300 ? 'Bagus Banget!' : 'Good Try!'}
                        </h2>

                        <div className="text-6xl font-bold text-primary-500 mb-2">
                            {score} poin
                        </div>

                        <p className="text-gray-700 font-body mb-6">
                            {score >= 500
                                ? 'Kamu hebat banget! Seperti kamu menangkap hatiku 💖'
                                : score >= 300
                                    ? 'Bagus sayang! Kamu selalu bisa bikin aku tersenyum 😊'
                                    : 'Tetap manis! Yang penting kita bersenang-senang bareng 🥰'
                            }
                        </p>

                        <div className="space-y-3">
                            <Button variant="primary" size="lg" onClick={startGame} className="w-full">
                                Main Lagi
                            </Button>
                            <Button variant="secondary" size="md" onClick={() => router.push('/lobby')} className="w-full">
                                Kembali ke Lobby
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    /* Game Area */
                    <div
                        ref={gameAreaRef}
                        className="relative w-full h-[600px] glass rounded-3xl overflow-hidden cursor-none"
                        onMouseMove={(e) => handleMove(e.clientX)}
                        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                    >
                        {/* Falling Objects - Plain divs for performance */}
                        {fallingObjects.map(obj => (
                            <div
                                key={obj.id}
                                className="absolute text-4xl font-bold text-gray-700 transition-none"
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

                        {/* Basket - No animation for better performance */}
                        <div
                            className="absolute bottom-[10%] text-5xl transition-none"
                            style={{
                                left: `${basketPosition}%`,
                                transform: 'translateX(-50%)',
                                willChange: 'left'
                            }}
                        >
                            🧺
                        </div>

                        {/* Instructions */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass rounded-lg px-4 py-2">
                            <p className="text-sm font-body text-gray-700">
                                Gerakkan mouse/jari untuk mengontrol keranjang!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
