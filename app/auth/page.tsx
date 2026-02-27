'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { StarField } from '@/components/ui/StarField'

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
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 bg-black overflow-hidden relative"
            style={{ fontFamily: "'Raleway', sans-serif" }}
        >
            <StarField count={20} />

            <motion.div
                className="w-full max-w-md z-10 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div
                    className="rounded-3xl p-8 md:p-10 text-center"
                    style={{
                        background: 'rgba(20, 10, 5, 0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(253, 230, 138, 0.1)',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(253, 230, 138, 0.05)'
                    }}
                >
                    <motion.div
                        className="mb-10"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold block mb-3 text-yellow-500/60">
                            Kado Terspesial Untuk
                        </span>

                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{
                                fontFamily: "'Quicksand', sans-serif",
                                background: 'linear-gradient(135deg, #fffbe6 0%, #fde68a 40%, #f59e0b 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 2px 10px rgba(245, 158, 11, 0.2))'
                            }}
                        >
                            Tecantikku<br />Revi
                        </h1>

                        <p className="text-sm font-medium leading-relaxed text-white/40 font-heading">
                            Masukkan kode rahasia<br />
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <input
                                id="passcode"
                                type="text"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="w-full px-4 py-4 rounded-2xl bg-black/40 border-2 border-white/10 focus:border-yellow-500/50 outline-none transition-all text-center text-xl tracking-[0.5em] text-yellow-100 placeholder-white/10"
                                placeholder="••••••••"
                                autoComplete="off"
                                required
                                style={{ fontFamily: "'Quicksand', sans-serif" }}
                            />
                        </div>

                        {error && (
                            <motion.div
                                className="p-3 rounded-xl bg-red-900/30 border border-red-500/30"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className="text-red-200 text-xs font-medium">
                                    {error}
                                </p>
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isLoading || !passcode}
                            className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "'Quicksand', sans-serif",
                                background: 'linear-gradient(135deg, #78350f, #b45309, #d97706)',
                                color: '#fde68a',
                                border: '1px solid rgba(253,230,138,0.3)',
                                boxShadow: '0 4px 20px rgba(217,119,6,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}
                            whileHover={{ boxShadow: '0 6px 25px rgba(217,119,6,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-200 animate-bounce" />
                                    <span className="w-2 h-2 rounded-full bg-yellow-200 animate-bounce delay-100" />
                                    <span className="w-2 h-2 rounded-full bg-yellow-200 animate-bounce delay-200" />
                                </span>
                            ) : (
                                'Buka Kado 🔐'
                            )}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">
                            Buatan Pacar Yaitu Samuell
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
