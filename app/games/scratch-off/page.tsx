'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { SCRATCH_OFF_MESSAGES } from '@/lib/constants/gameData'

export default function ScratchOffPage() {
    const router = useRouter()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isScratching, setIsScratching] = useState(false)
    const [scratchPercentage, setScratchPercentage] = useState(0)
    const [isRevealed, setIsRevealed] = useState(false)
    const [currentDay] = useState(1) // Will be dynamic with Supabase
    const [hasScratched, setHasScratched] = useState(false)

    const message = SCRATCH_OFF_MESSAGES[currentDay - 1]

    useEffect(() => {
        // Check if already scratched today (will use Supabase later)
        const scratched = localStorage.getItem(`scratched_day_${currentDay}`)
        if (scratched) {
            setHasScratched(true)
            setIsRevealed(true)
            setScratchPercentage(100)
        } else {
            initializeCanvas()
        }
    }, [currentDay])

    const initializeCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        // Fill with scratch-off overlay
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#f48bc1')
        gradient.addColorStop(1, '#8b5cf6')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add text hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = 'bold 24px Quicksand'
        ctx.textAlign = 'center'
        ctx.fillText('Gosok untuk membuka!', canvas.width / 2, canvas.height / 2)
        ctx.font = '16px Raleway'
        ctx.fillText('💝', canvas.width / 2, canvas.height / 2 + 30)
    }

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        const clientX = (x - rect.left) * scaleX
        const clientY = (y - rect.top) * scaleY

        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(clientX, clientY, 30, 0, Math.PI * 2)
        ctx.fill()

        // Calculate scratch percentage
        calculateScratchPercentage()
    }

    const calculateScratchPercentage = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let transparent = 0

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) {
                transparent++
            }
        }

        const percentage = (transparent / (pixels.length / 4)) * 100
        setScratchPercentage(percentage)

        if (percentage > 70 && !isRevealed) {
            setIsRevealed(true)
            localStorage.setItem(`scratched_day_${currentDay}`, 'true')
        }
    }

    const handleMouseDown = () => setIsScratching(true)
    const handleMouseUp = () => setIsScratching(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isScratching) return
        scratch(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        if (!isScratching) return
        const touch = e.touches[0]
        scratch(touch.clientX, touch.clientY)
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <motion.button
                        onClick={() => router.push('/lobby')}
                        className="text-primary-600 hover:text-primary-700 font-heading"
                        whileHover={{ x: -5 }}
                    >
                        ← Kembali ke Lobby
                    </motion.button>

                    <div className="glass rounded-lg px-4 py-2">
                        <span className="font-heading font-semibold">Hari {currentDay} / 7</span>
                    </div>
                </div>

                {/* Title */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-2">
                        🎁 Daily Surprise
                    </h1>
                    <p className="text-gray-700 font-body">
                        Gosok kartu untuk melihat kejutan hari ini!
                    </p>
                </motion.div>

                {hasScratched && !isRevealed ? (
                    /* Already Scratched Today */
                    <motion.div
                        className="glass rounded-3xl p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-6xl mb-4">⏰</div>
                        <h2 className="text-3xl font-heading font-bold gradient-text mb-4">
                            Sudah Dibuka Hari Ini!
                        </h2>
                        <p className="text-gray-700 font-body mb-6">
                            Kembali besok untuk membuka kejutan berikutnya, sayang! 💕
                        </p>
                        <Button variant="primary" size="lg" onClick={() => router.push('/lobby')}>
                            Kembali ke Lobby
                        </Button>
                    </motion.div>
                ) : (
                    /* Scratch Card */
                    <div className="glass rounded-3xl p-8">
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100">
                            {/* Hidden content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                <div className="text-6xl mb-4">{message.title === 'Hari Pertama' ? '💕' : '🎉'}</div>
                                <h2 className="text-3xl font-heading font-bold text-primary-600 mb-4">
                                    {message.title}
                                </h2>
                                <p className="text-xl text-gray-700 font-body max-w-md">
                                    {message.message}
                                </p>

                                {/* Placeholder image */}
                                <div className="mt-6 w-48 h-48 rounded-xl bg-white/50 flex items-center justify-center">
                                    <span className="text-4xl">📷</span>
                                </div>
                            </div>

                            {/* Scratch canvas overlay */}
                            {!isRevealed && (
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 w-full h-full cursor-pointer"
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseUp}
                                    onTouchStart={handleMouseDown}
                                    onTouchEnd={handleMouseUp}
                                    onTouchMove={handleTouchMove}
                                />
                            )}
                        </div>

                        {/* Progress */}
                        {scratchPercentage > 0 && scratchPercentage < 70 && (
                            <motion.div
                                className="mt-4 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary-400 to-secondary-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scratchPercentage}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-2 font-body">
                                    {Math.round(scratchPercentage)}% tergosok
                                </p>
                            </motion.div>
                        )}

                        {/* Revealed Message */}
                        <AnimatePresence>
                            {isRevealed && (
                                <motion.div
                                    className="mt-6 text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-green-600 font-heading font-semibold mb-4">
                                        ✨ Kejutan terbuka! ✨
                                    </p>
                                    <Button variant="primary" size="lg" onClick={() => router.push('/lobby')}>
                                        Kembali ke Lobby
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
