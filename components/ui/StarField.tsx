'use client'

import { useMemo, useEffect, useState } from 'react'

interface GlowStar {
    id: number
    x: number
    y: number
    size: number
    opacity: number
    duration: number
    delay: number
}

function generateStars(count: number): GlowStar[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,          // 1–3px (smaller)
        opacity: Math.random() * 0.5 + 0.3,   // 0.3–0.8
        duration: Math.random() * 3 + 2,      // 2–5s float
        delay: Math.random() * 2,
    }))
}

interface StarFieldProps {
    count?: number
}

export const StarField = ({ count = 15 }: StarFieldProps) => {
    const [stars, setStars] = useState<GlowStar[]>([])
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        setIsHydrated(true)
        setStars(generateStars(count))
    }, [count])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {isHydrated && stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-yellow-200"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                        opacity: star.opacity,
                        boxShadow: `0 0 ${star.size * 2}px ${star.size}px rgba(253,230,138,0.4)`, // Reduced glow
                        animation: `float ${star.duration}s ${star.delay}s ease-in-out infinite alternate`,
                        willChange: 'transform, opacity',
                    }}
                />
            ))}

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); opacity: 0.4; }
                    100% { transform: translateY(-10px); opacity: 0.8; }
                }
            `}</style>
        </div>
    )
}
