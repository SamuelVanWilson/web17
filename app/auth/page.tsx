'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function AuthPage() {
    const [passcode, setPasscode] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            // For now, use a simple hardcoded passcode (will be replaced with Supabase)
            const correctPasscode = '17022025' // Change this to your secret code

            if (passcode === correctPasscode) {
                // Store auth token in localStorage
                localStorage.setItem('memoryOdysseyAuth', 'true')
                localStorage.setItem('memoryOdysseyAuthTime', new Date().toISOString())

                // Redirect to hero section
                router.push('/')
            } else {
                setError('Passcode salah, sayang! Coba lagi ya 💕')
            }
        } catch (err) {
            setError('Terjadi kesalahan. Coba lagi ya!')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="glass rounded-3xl p-8 shadow-2xl">
                    <motion.div
                        className="text-center mb-8"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <h1 className="text-4xl font-heading font-bold gradient-text mb-2">
                            💕 The Memory Odyssey 💕
                        </h1>
                        <p className="text-gray-600 font-body">
                            Selamat datang di perjalanan kenangan kita
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="passcode"
                                className="block text-sm font-heading font-medium text-gray-700 mb-2"
                            >
                                Masukkan Passcode Rahasia
                            </label>
                            <input
                                id="passcode"
                                type="text"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-primary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-center font-heading text-lg tracking-wider"
                                placeholder="••••••••••"
                                autoComplete="off"
                                required
                            />
                        </div>

                        {error && (
                            <motion.p
                                className="text-red-500 text-sm text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={isLoading || !passcode}
                            className="w-full"
                        >
                            {isLoading ? 'Memverifikasi...' : 'Masuk ke Perjalanan 💝'}
                        </Button>
                    </form>

                    <motion.div
                        className="mt-6 text-center text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p>Dibuat dengan 💖 untuk mengenang 1 tahun kita</p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
