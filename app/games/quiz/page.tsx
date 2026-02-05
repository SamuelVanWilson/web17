'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { QUIZ_QUESTIONS } from '@/lib/constants/gameData'

export default function QuizPage() {
    const router = useRouter()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [showMessage, setShowMessage] = useState(false)

    const question = QUIZ_QUESTIONS[currentQuestion]

    const handleAnswerClick = (index: number) => {
        if (selectedAnswer !== null) return

        setSelectedAnswer(index)

        if (index === question.correctAnswer) {
            setScore(prev => prev + 1)
        }

        setShowMessage(true)
    }

    const handleNext = () => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(null)
            setShowMessage(false)
        } else {
            setShowResult(true)
        }
    }

    const resetQuiz = () => {
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setScore(0)
        setShowResult(false)
        setShowMessage(false)
    }

    const getScoreMessage = () => {
        const percentage = (score / QUIZ_QUESTIONS.length) * 100
        if (percentage === 100) return {
            emoji: '🏆',
            title: 'Perfect Score, Sayang!',
            message: 'Kamu benar-benar inget semua tentang kita! I love you so much! 💖'
        }
        if (percentage >= 80) return {
            emoji: '🌟',
            title: 'Luar Biasa!',
            message: 'Kamu inget hampir semua! Kamu memang perhatian banget 💕'
        }
        if (percentage >= 60) return {
            emoji: '💝',
            title: 'Bagus Banget!',
            message: 'Kamu inget banyak tentang kita. Sweet! 🥰'
        }
        return {
            emoji: '💕',
            title: 'Tetap Manis!',
            message: 'Gapapa sayang, yang penting kita bersama! Let\'s make more memories! ✨'
        }
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

                    {!showResult && (
                        <div className="glass rounded-lg px-4 py-2">
                            <span className="font-heading font-semibold">
                                {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                            </span>
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
                        ❓ How Well Do You Remember?
                    </h1>
                    <p className="text-gray-700 font-body">
                        Seberapa inget kamu tentang kita?
                    </p>
                </motion.div>

                {!showResult ? (
                    <div className="space-y-6">
                        {/* Question Card */}
                        <motion.div
                            key={currentQuestion}
                            className="glass rounded-3xl p-8"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-6 text-center">
                                {question.question}
                            </h2>

                            <div className="space-y-3">
                                {question.options.map((option, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleAnswerClick(index)}
                                        className={`w-full p-4 rounded-xl text-left font-body transition-all ${selectedAnswer === null
                                                ? 'bg-white hover:bg-primary-50 border-2 border-gray-200 hover:border-primary-300'
                                                : selectedAnswer === index
                                                    ? index === question.correctAnswer
                                                        ? 'bg-green-100 border-2 border-green-500'
                                                        : 'bg-red-100 border-2 border-red-500'
                                                    : index === question.correctAnswer
                                                        ? 'bg-green-100 border-2 border-green-500'
                                                        : 'bg-gray-100 border-2 border-gray-300'
                                            }`}
                                        disabled={selectedAnswer !== null}
                                        whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                    >
                                        {option}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Sweet Message */}
                            <AnimatePresence>
                                {showMessage && (
                                    <motion.div
                                        className="mt-6 p-4 bg-primary-50 rounded-xl"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <p className="text-primary-700 text-center font-body italic">
                                            {question.sweetMessage}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Next Button */}
                        {selectedAnswer !== null && (
                            <motion.div
                                className="text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Button variant="primary" size="lg" onClick={handleNext}>
                                    {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Lanjut →' : 'Lihat Hasil 🎉'}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    /* Results Screen */
                    <motion.div
                        className="glass rounded-3xl p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-7xl mb-4">{getScoreMessage().emoji}</div>
                        <h2 className="text-4xl font-heading font-bold gradient-text mb-4">
                            {getScoreMessage().title}
                        </h2>

                        <div className="text-6xl font-bold text-primary-500 mb-2">
                            {score} / {QUIZ_QUESTIONS.length}
                        </div>

                        <p className="text-gray-700 font-body mb-6">
                            {getScoreMessage().message}
                        </p>

                        <div className="space-y-3">
                            <Button variant="primary" size="lg" onClick={resetQuiz} className="w-full">
                                Main Lagi
                            </Button>
                            <Button variant="secondary" size="md" onClick={() => router.push('/lobby')} className="w-full">
                                Kembali ke Lobby
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
