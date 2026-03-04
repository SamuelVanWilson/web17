'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { updateTickets, saveMemoryMatchScore, getGameProgress } from '@/lib/supabase/helpers'

// Sample memory photos for cards (will be replaced with actual photos)
const CARD_IMAGES = [
    '/images/memory/1_1.webp',
    '/images/memory/2_1.webp',
    '/images/memory/3_1.webp',
    '/images/memory/4_1.webp',
    '/images/memory/5_1.webp',
    '/images/memory/6_1.webp',
    '/images/memory/1_2.webp',
    '/images/memory/2_2.webp',
    '/images/memory/3_2.webp',
    '/images/memory/4_2.webp',
    '/images/memory/5_2.webp',
    '/images/memory/6_2.webp',
]

interface Card {
    id: number
    img: string
    isFlipped: boolean
    isMatched: boolean
}

function getPairId(img: string) {
    const base = img.substring(img.lastIndexOf('/') + 1) // e.g. "1_2.webp"
    return base.split('_')[0] // "1"
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
            .map((img, index) => ({ id: index, img, isFlipped: false, isMatched: false }))
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

                    if (firstCard && secondCard && getPairId(firstCard.img) === getPairId(secondCard.img)) {
                        // Match found based on prefix, e.g. "6_1.webp" and "6_2.webp"
                        console.log('✅ Match found!', {
                            firstCard: firstCard.img,
                            secondCard: secondCard.img,
                            firstId: first,
                            secondId: second,
                            pair: getPairId(firstCard.img)
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
            .map((img, index) => ({ id: index, img, isFlipped: false, isMatched: false }))
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
        <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col relative select-none">
            <div className="w-full max-w-lg mx-auto h-full flex flex-col p-4">
                {/* Header - Compact */}
                <div className="flex justify-between items-center mb-2 shrink-0 z-20 relative">
                    <motion.button
                        onClick={() => router.push('/lobby')}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-purple-600 hover:bg-white transition-colors"
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="sr-only">Back</span>
                        ←
                    </motion.button>

                    <h1 className="text-xl font-bold text-purple-600 font-heading absolute left-1/2 -translate-x-1/2 hidden xs:block">
                        Memory Match
                    </h1>

                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-purple-100 text-purple-600 text-sm font-bold">
                        Moves: {moves}
                    </div>
                </div>

                {/* Game Container - Fills remaining space */}
                <div className="flex-1 w-full h-full min-h-0 flex flex-col justify-center items-center py-2">
                    {/* Game Grid */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-[340px] aspect-[3/4] content-center">
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                className="aspect-[3/4] cursor-pointer"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleCardClick(card.id)}
                            >
                                <motion.div
                                    className="w-full h-full relative shadow-sm rounded-xl"
                                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Card Back */}
                                    <div
                                        className="absolute inset-0 bg-white/60 backdrop-blur-sm border-2 border-white/50 rounded-xl flex items-center justify-center text-3xl shadow-sm"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(0deg)'
                                        }}
                                    >
                                        💝
                                    </div>

                                    {/* Card Front */}
                                    <div
                                        className={`absolute inset-0 rounded-xl flex items-center justify-center overflow-hidden shadow-inner border-2 border-white/20 ${card.isMatched
                                            ? 'bg-gradient-to-br from-green-100 to-emerald-200'
                                            : 'bg-white'
                                            }`}
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)'
                                        }}
                                    >
                                        <img
                                            src={card.img}
                                            alt="Memory"
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Win Modal */}
                <AnimatePresence>
                    {isWon && (
                        <motion.div
                            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWon(false)}
                        >
                            <motion.div
                                className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl border border-white/50"
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                <h2 className="text-2xl font-bold text-purple-600 mb-2">
                                    Yeyy akhirnya selesai jugaa
                                </h2>
                                <p className="text-purple-900/70 text-sm mb-6">
                                    Hebat! Kamu menyelesaikan game ini dalam {moves} langkah! 💕
                                </p>

                                <div className="space-y-3">
                                    <Button variant="primary" size="lg" onClick={resetGame} className="w-full shadow-purple-200 shadow-lg">
                                        Main Lagi ↺
                                    </Button>
                                    <Button variant="secondary" size="md" onClick={() => router.push('/lobby')} className="w-full bg-white/50">
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
