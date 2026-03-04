'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { QUIZ_QUESTIONS } from '@/lib/constants/gameData'
import { updateTickets, saveQuizScore, getGameProgress } from '@/lib/supabase/helpers'

export default function QuizPage() {
    const router = useRouter()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [hasDeductedTicket, setHasDeductedTicket] = useState(false)
    const [currentTickets, setCurrentTickets] = useState<number | null>(null)

    const question = QUIZ_QUESTIONS[currentQuestion] ?? QUIZ_QUESTIONS[0]

    // Deduct ticket when game starts
    useEffect(() => {
        async function deductTicket() {
            if (!hasDeductedTicket) {
                try {
                    await updateTickets(-1)
                    setHasDeductedTicket(true)
                } catch (error) {
                    console.error('Failed to deduct ticket:', error)
                }
            }
        }
        deductTicket()
    }, [hasDeductedTicket])

    // Load current tickets for replay validation
    useEffect(() => {
        async function loadTickets() {
            try {
                const progress = await getGameProgress()
                setCurrentTickets(progress.tickets)
            } catch (error) {
                console.error('Failed to load tickets:', error)
            }
        }
        if (showResult) {
            loadTickets()
        }
    }, [showResult])

    const handleAnswerClick = (index: number) => {
        if (selectedAnswer !== null) return

        setSelectedAnswer(index)

        if (index === question.correctAnswer) {
            setScore(prev => prev + 1)
        }

        setShowMessage(true)
    }

    const handleNext = async () => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(null)
            setShowMessage(false)
        } else {
            // Save score to database before showing result
            setIsSaving(true)
            try {
                await saveQuizScore(score + (selectedAnswer === question.correctAnswer ? 1 : 0), QUIZ_QUESTIONS.length)
            } catch (error) {
                console.error('Failed to save quiz score:', error)
            } finally {
                setIsSaving(false)
                setShowResult(true)
            }
        }
    }

    const resetQuiz = async () => {
        // Check if user has enough tickets
        if (currentTickets !== null && currentTickets <= 0) {
            alert('Tiket kamu habis! Login besok untuk mendapat tiket baru 🎫')
            router.push('/lobby')
            return
        }

        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setScore(0)
        setShowResult(false)
        setShowMessage(false)
        setHasDeductedTicket(false) // Reset ticket deduction flag for replay
    }

    const getScoreMessage = () => {
        const percentage = (score / QUIZ_QUESTIONS.length) * 100
        if (percentage === 100) return {
            emoji: '💯',
            title: 'NAH KALAU INI BENER SAYANG NII',
            message: 'eviii keren inget semuaa, udah ekspek sihh, kan kita sama sama sayang🥰'
        }
        if (percentage >= 80) return {
            emoji: '😒',
            title: 'KOK GAK BENER SEMUAA',
            message: 'pasti kamu gak sayang aku yaa, makanya gak inget semuanya'
        }
        if (percentage >= 60) return {
            emoji: '🙄',
            title: 'kok segini doang',
            message: 'pasti pikun yaak makanya cuman inget segitu'
        }
        return {
            emoji: '😤',
            title: 'apa-apaan nihh',
            message: 'PARAH BANGETT SII, MASA BENER SEDIKIT'
        }
    }

    return (
        <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col relative select-none">
            <div className="w-full max-w-lg mx-auto h-full flex flex-col p-4">
                {/* Header - Compact */}
                <div className="flex justify-between items-center mb-4 shrink-0 z-20 relative">
                    <motion.button
                        onClick={() => router.push('/lobby')}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-purple-600 hover:bg-white transition-colors"
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="sr-only">Back</span>
                        ←
                    </motion.button>

                    {!showResult && (
                        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-purple-100 text-purple-600 text-sm font-bold">
                            {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                        </div>
                    )}
                </div>

                {/* Content Container - Scrollable if needed but centered by default */}
                <div className="flex-1 w-full h-full min-h-0 flex flex-col relative overflow-y-auto no-scrollbar">
                    <div className="flex-1 flex flex-col justify-center py-4">
                        {/* Title (Only show if not result) */}
                        {!showResult && (
                            <motion.div
                                className="text-center mb-6 shrink-0"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h1 className="text-2xl font-bold text-purple-600 font-heading">
                                    Our Quiz ❓
                                </h1>
                            </motion.div>
                        )}

                        {!showResult ? (
                            <div className="w-full relative">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentQuestion}
                                        className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 w-full"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center leading-relaxed">
                                            {question.question}
                                        </h2>

                                        <div className="space-y-3">
                                            {question.options.map((option, index) => (
                                                <motion.button
                                                    key={index}
                                                    onClick={() => handleAnswerClick(index)}
                                                    className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all relative overflow-hidden ${selectedAnswer === null
                                                        ? 'bg-white/80 hover:bg-white border-2 border-transparent hover:border-purple-200 shadow-sm'
                                                        : selectedAnswer === index
                                                            ? index === question.correctAnswer
                                                                ? 'bg-green-100 border-2 border-green-500 text-green-800'
                                                                : 'bg-red-100 border-2 border-red-500 text-red-800'
                                                            : index === question.correctAnswer
                                                                ? 'bg-green-100 border-2 border-green-500 text-green-800'
                                                                : 'bg-white/50 border-2 border-transparent opacity-50'
                                                        }`}
                                                    disabled={selectedAnswer !== null}
                                                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                                >
                                                    {option}
                                                    {selectedAnswer !== null && index === question.correctAnswer && (
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2">✅</span>
                                                    )}
                                                    {selectedAnswer === index && index !== question.correctAnswer && (
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2">❌</span>
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>

                                        {/* Sweet Message */}
                                        <AnimatePresence>
                                            {showMessage && (
                                                <motion.div
                                                    className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <p className="text-purple-700 text-center text-sm italic">
                                                        "{question.sweetMessage}"
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Next Button */}
                                <div className="mt-6 h-12">
                                    <AnimatePresence>
                                        {selectedAnswer !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                            >
                                                <Button variant="primary" size="lg" onClick={handleNext} disabled={isSaving} className="w-full shadow-lg shadow-purple-200">
                                                    {isSaving ? 'Menyimpan...' : currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Lanjut →' : 'Lihat Hasil 🎉'}
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            /* Results Screen */
                            <motion.div
                                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-xl border border-white/50 m-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="text-7xl mb-4 animate-bounce bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    {getScoreMessage().emoji}
                                </div>
                                <h2 className="text-2xl font-bold text-purple-600 mb-2">
                                    {getScoreMessage().title}
                                </h2>

                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-2 py-2">
                                    {score} / {QUIZ_QUESTIONS.length}
                                </div>

                                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                                    {getScoreMessage().message}
                                </p>

                                <div className="space-y-3">
                                    <Button variant="primary" size="lg" onClick={resetQuiz} className="w-full shadow-lg shadow-purple-200">
                                        Main Lagi ↺
                                    </Button>
                                    <Button variant="secondary" size="md" onClick={() => router.push('/lobby')} className="w-full bg-white/50">
                                        Kembali ke Lobby
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
