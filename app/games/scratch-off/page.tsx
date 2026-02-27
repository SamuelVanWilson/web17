'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { SCRATCH_OFF_MESSAGES } from '@/lib/constants/gameData'
import { getScratchHistory, saveScratchHistory } from '@/lib/supabase/helpers'

export default function ScratchOffPage() {
    const router = useRouter()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isScratching, setIsScratching] = useState(false)
    const [scratchPercentage, setScratchPercentage] = useState(0)
    const [isRevealed, setIsRevealed] = useState(false)
    const isRevealedRef = useRef(false)
    const [currentDay, setCurrentDay] = useState(1)
    const [hasScratched, setHasScratched] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const message = SCRATCH_OFF_MESSAGES[currentDay - 1]

    useEffect(() => {
        async function loadScratchData() {
            try {
                const today = new Date().toISOString().split('T')[0]

                // Ambil scratch history — sumber kebenaran untuk menentukan hari ke-berapa
                const history = await getScratchHistory()

                let firstLoginDate: string
                const FIRST_LOGIN_KEY = 'memoryOdysseyFirstLogin'

                if (history.length > 0) {
                    // Sudah pernah scratch → tanggal scratch hari ke-1 = hari pertama
                    const firstScratch = history.find(h => h.day === 1) || history[0]
                    firstLoginDate = firstScratch.scratched_at as string
                    // Selalu update localStorage dari history (override nilai lama yang mungkin salah)
                    localStorage.setItem(FIRST_LOGIN_KEY, firstLoginDate)
                } else {
                    // Belum pernah scratch → cek localStorage
                    const stored = localStorage.getItem(FIRST_LOGIN_KEY)
                    if (stored) {
                        firstLoginDate = stored
                    } else {
                        // Total fresh → hari ini = hari ke-1
                        firstLoginDate = today
                        localStorage.setItem(FIRST_LOGIN_KEY, today)
                    }
                }

                // Hitung hari ke-berapa sekarang (1-indexed)
                const firstDate = new Date(firstLoginDate)
                const currentDate = new Date(today)
                const daysElapsed =
                    Math.floor((currentDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

                // Cap di 7 hari
                const day = Math.min(Math.max(1, daysElapsed), 7)

                console.log('📅 Daily Surprise Date Calculation:', {
                    firstLoginDate,
                    today,
                    daysElapsed,
                    currentDay: day,
                    historyCount: history.length,
                })

                setCurrentDay(day)

                // Cek apakah sudah scratch HARI INI
                const scratchedToday = history.some(h => h.scratched_at === today)

                console.log('🔍 Scratch History Check:', {
                    totalHistory: history.length,
                    scratchedToday,
                    todayDate: today
                })

                if (scratchedToday) {
                    console.log('✅ Already scratched today! Showing completed state.')
                    setHasScratched(true)
                    setIsRevealed(true)
                    isRevealedRef.current = true
                    setScratchPercentage(100)
                } else {
                    console.log('🎁 New scratch card available for today!')
                    initializeCanvas()
                }
            } catch (error) {
                console.error('Error loading scratch data:', error)
                initializeCanvas()
            } finally {
                setIsLoading(false)
            }
        }

        loadScratchData()
    }, [])

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

        if (percentage > 50 && !isRevealedRef.current) {
            isRevealedRef.current = true
            setIsRevealed(true)
            // Save to database
            saveScratchHistory(currentDay).catch(error => {
                console.warn('Failed to save scratch history (non-critical):', error)
            })
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
        <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-100 flex flex-col relative select-none touch-action-none">
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">🎁</div>
                        <p className="text-purple-600 font-bold animate-pulse">Memuat kejutan...</p>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-lg mx-auto h-full flex flex-col p-4">
                    {/* Header - Compact */}
                    <div className="flex justify-between items-center mb-6 shrink-0 z-20 relative">
                        <motion.button
                            onClick={() => router.push('/lobby')}
                            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-purple-600 hover:bg-white transition-colors"
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="sr-only">Back</span>
                            ←
                        </motion.button>

                        <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-purple-100 text-purple-600 text-sm font-bold">
                            Hari {currentDay} / 7
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 flex flex-col justify-center items-center relative w-full">
                        {/* Title */}
                        <motion.div
                            className="text-center mb-8 absolute top-0 w-full"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-2xl font-bold text-purple-600 font-heading mb-1">
                                Daily Surprise 🎁
                            </h1>
                            <p className="text-purple-900/60 text-xs">
                                Gosok kartunya pelan-pelan ya!
                            </p>
                        </motion.div>

                        {hasScratched && !isRevealed ? (
                            /* Already Scratched Today */
                            <motion.div
                                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-xl border border-white/50 w-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="text-6xl mb-4">⏰</div>
                                <h2 className="text-2xl font-bold text-purple-600 mb-2">
                                    Sudah Dibuka!
                                </h2>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    Kamu sudah buka kejutan hari ini.<br />Besok balik lagi ya sayang! 💕
                                </p>
                                <Button variant="primary" size="lg" onClick={() => router.push('/lobby')} className="w-full shadow-lg shadow-purple-200">
                                    Kembali ke Lobby
                                </Button>
                            </motion.div>
                        ) : (
                            /* Scratch Card Area */
                            <div className="w-full flex-1 flex flex-col justify-center items-center py-8">
                                <motion.div
                                    className="bg-white p-2 rounded-3xl shadow-2xl shadow-purple-200/50 w-full max-w-sm aspect-[4/5] relative"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 border border-purple-100">
                                        {/* Hidden content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
                                            <div className="text-6xl mb-4 animate-bounce">
                                                {message.title === 'Hari Pertama' ? '💕' : '🎉'}
                                            </div>
                                            <h2 className="text-2xl font-bold text-purple-600 mb-3 font-heading">
                                                {message.title}
                                            </h2>
                                            <p className="text-gray-700 text-sm leading-relaxed max-w-xs font-medium">
                                                {message.message}
                                            </p>

                                            {/* Photo Placeholder */}
                                            <div className="mt-6 w-full max-w-[200px] aspect-square rounded-xl bg-purple-100/50 border-2 border-dashed border-purple-200 flex items-center justify-center text-purple-300">
                                                <span className="text-4xl">📷</span>
                                            </div>
                                        </div>

                                        {/* Scratch canvas overlay */}
                                        {!isRevealed && (
                                            <canvas
                                                ref={canvasRef}
                                                className="absolute inset-0 w-full h-full touch-none cursor-crosshair active:cursor-grabbing"
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
                                </motion.div>

                                {/* Progress Indicator */}
                                <div className="h-12 w-full mt-6 flex items-center justify-center">
                                    <AnimatePresence>
                                        {scratchPercentage > 0 && scratchPercentage < 70 && !isRevealed && (
                                            <motion.div
                                                className="w-full max-w-xs text-center"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <div className="h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm mx-auto w-48">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${scratchPercentage}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-purple-600 mt-2 font-bold">
                                                    {Math.round(scratchPercentage)}% Terbuka
                                                </p>
                                            </motion.div>
                                        )}
                                        {isRevealed && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="w-full"
                                            >
                                                <Button variant="primary" size="lg" onClick={() => router.push('/lobby')} className="w-full max-w-xs shadow-xl shadow-purple-200 animate-pulse">
                                                    Simpan &amp; Kembali ✨
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
