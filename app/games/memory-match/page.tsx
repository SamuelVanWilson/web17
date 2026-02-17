'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { updateTickets, saveMemoryMatchScore, getGameProgress } from '@/lib/supabase/helpers'

// Sample memory photos for cards (will be replaced with actual photos)
const CARD_IMAGES = [
    '💕', '🌹', '💝', '🎁', '🌟', '💖',
    '💕', '🌹', '💝', '🎁', '🌟', '💖',
]

interface Card {
    id: number
    emoji: string
    isFlipped: boolean
    isMatched: boolean
}

export default function MemoryMatchPage() {
    const router = useRouter()
    const [cards, setCards] = useState<Card[]>([])
    const [flippedCards, setFlippedCards] = useState<number[]>([])
    const [matchedPairs, setMatchedPairs] = useState(0)
    const [moves, setMoves] = useState(0)
    const [isWon, setIsWon] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [hasDeductedTicket, setHasDeductedTicket] = useState(false)
    const [startTime] = useState(Date.now())
    const [currentTickets, setCurrentTickets] = useState<number | null>(null)
    const [isChecking, setIsChecking] = useState(false)

    // Initialize cards
    useEffect(() => {
        const shuffled = CARD_IMAGES
            .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }))
            .sort(() => Math.random() - 0.5)
        setCards(shuffled)
    }, [])

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

    // Load current tickets when game is won
    useEffect(() => {
        async function loadTickets() {
            try {
                const progress = await getGameProgress()
                setCurrentTickets(progress.tickets)
            } catch (error) {
                console.error('Failed to load tickets:', error)
            }
        }
        if (isWon) {
            loadTickets()
        }
    }, [isWon])

    // Check for win condition when cards state changes
    useEffect(() => {
        // Don't check if already won or still saving or no cards yet
        if (isWon || isSaving || cards.length === 0) return

        const matchedCount = cards.filter(card => card.isMatched).length
        console.log(`🔍 Checking win condition: ${matchedCount}/12 cards matched`)

        // Win when ALL 12 cards are matched
        if (matchedCount === 12 && !isChecking) {
            console.log('🎉 ALL 12 CARDS MATCHED! All cards are open!')
            // Wait a bit so user can see all 12 cards opened with green background
            setTimeout(async () => {
                console.log('🎊 Now showing win popup!')

                // Calculate time taken
                const timeSeconds = Math.floor((Date.now() - startTime) / 1000)

                // Save score to database
                setIsSaving(true)
                try {
                    await saveMemoryMatchScore(moves, timeSeconds)
                    console.log('✅ Score saved successfully!')
                } catch (error: any) {
                    console.error('Failed to save memory match score:', {
                        message: error?.message || 'Unknown error',
                        code: error?.code,
                        details: error?.details,
                        name: error?.name
                    })
                } finally {
                    setIsSaving(false)
                    setIsWon(true)
                }
            }, 1500)
        }
    }, [cards, isWon, isSaving, isChecking, startTime, moves])

    const handleCardClick = useCallback((id: number) => {
        // Prevent interaction during checking, or if card is already flipped/matched
        setCards(currentCards => {
            const clickedCard = currentCards.find(card => card.id === id)

            // Don't allow interaction if card not found
            if (!clickedCard) {
                return currentCards
            }

            setFlippedCards(currentFlipped => {
                // Don't allow clicks if we're checking, already have 2 flipped, or card is already matched/flipped
                if (isChecking || currentFlipped.length === 2 || clickedCard.isMatched || currentFlipped.includes(id)) {
                    return currentFlipped
                }

                const newFlippedCards = [...currentFlipped, id]

                // Update card to flipped state
                const updatedCards = currentCards.map(card =>
                    card.id === id ? { ...card, isFlipped: true } : card
                )
                setCards(updatedCards)

                // Check for match when 2 cards are flipped
                if (newFlippedCards.length === 2) {
                    setIsChecking(true)
                    setMoves(prev => prev + 1)
                    const [first, second] = newFlippedCards

                    // Find the actual cards to compare their emojis
                    const firstCard = updatedCards.find(card => card.id === first)
                    const secondCard = updatedCards.find(card => card.id === second)

                    if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
                        // Match found!
                        console.log('✅ Match found!', {
                            firstCard: firstCard.emoji,
                            secondCard: secondCard.emoji,
                            firstId: first,
                            secondId: second
                        })

                        setTimeout(() => {
                            setCards(prev =>
                                prev.map(card =>
                                    card.id === first || card.id === second
                                        ? { ...card, isMatched: true }
                                        : card
                                )
                            )
                            setMatchedPairs(prev => {
                                const newMatchedPairs = prev + 1
                                console.log(`🎯 Matched pairs: ${newMatchedPairs}/6 (${newMatchedPairs * 2}/12 cards)`)
                                return newMatchedPairs
                            })
                            setFlippedCards([])
                            setIsChecking(false)
                        }, 600)
                    } else {
                        // No match
                        setTimeout(() => {
                            setCards(prev =>
                                prev.map(card =>
                                    card.id === first || card.id === second
                                        ? { ...card, isFlipped: false }
                                        : card
                                )
                            )
                            setFlippedCards([])
                            setIsChecking(false)
                        }, 1000)
                    }
                }

                return newFlippedCards
            })
            return currentCards
        })
    }, [isChecking, startTime, moves])

    const resetGame = async () => {
        // Check if user has enough tickets
        if (currentTickets !== null && currentTickets <= 0) {
            alert('Tiket kamu habis! Login besok untuk mendapat tiket baru 🎫')
            router.push('/lobby')
            return
        }

        const shuffled = CARD_IMAGES
            .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }))
            .sort(() => Math.random() - 0.5)
        setCards(shuffled)
        setFlippedCards([])
        setMatchedPairs(0)
        setMoves(0)
        setIsWon(false)
        setIsChecking(false)
        setHasDeductedTicket(false) // Reset ticket deduction flag for replay
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

                    <div className="glass rounded-lg px-4 py-2">
                        <span className="font-heading font-semibold">Moves: {moves}</span>
                    </div>
                </div>

                {/* Title */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-2">
                        🎴 The Memory Match
                    </h1>
                    <p className="text-gray-700 font-body">
                        Cocokkan semua kartu kenangan kita!
                    </p>
                </motion.div>

                {/* Game Grid */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            className="aspect-square cursor-pointer"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleCardClick(card.id)}
                        >
                            <motion.div
                                className="w-full h-full relative"
                                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                                transition={{ duration: 0.6 }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Card Back */}
                                <div
                                    className="absolute inset-0 glass rounded-2xl flex items-center justify-center text-4xl"
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(0deg)'
                                    }}
                                >
                                    💝
                                </div>

                                {/* Card Front */}
                                <div
                                    className={`absolute inset-0 rounded-2xl flex items-center justify-center text-5xl ${card.isMatched ? 'bg-gradient-to-br from-green-200 to-green-300' : 'bg-gradient-to-br from-primary-200 to-secondary-200'
                                        }`}
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                >
                                    {card.emoji}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Win Modal */}
                <AnimatePresence>
                    {isWon && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWon(false)}
                        >
                            <motion.div
                                className="glass rounded-3xl p-8 max-w-md w-full text-center"
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-3xl font-heading font-bold gradient-text mb-4">
                                    Kamu Menang, Sayang!
                                </h2>
                                <p className="text-gray-700 font-body mb-2">
                                    Selamat! Kamu berhasil mencocokkan semua kenangan kita dengan {moves} moves!
                                </p>
                                <p className="text-primary-600 italic mb-6">
                                    "Setiap kenangan bersama kamu adalah harta yang paling berharga" 💕
                                </p>

                                <div className="space-y-3">
                                    <Button variant="primary" size="lg" onClick={resetGame} className="w-full">
                                        Main Lagi
                                    </Button>
                                    <Button variant="secondary" size="md" onClick={() => router.push('/lobby')} className="w-full">
                                        Kembali ke Lobby
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
