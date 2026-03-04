'use client'

import { useState, useRef, useEffect } from 'react'

export default function AudioPlayer() {
    const [hasInteracted, setHasInteracted] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        const handleFirstInteraction = () => {
            setHasInteracted(true)
            if (audioRef.current) {
                audioRef.current.play().catch(() => {})
            }
        }

        // Listen for first user interaction
        document.addEventListener('click', handleFirstInteraction, { once: true })
        document.addEventListener('touchstart', handleFirstInteraction, { once: true })

        return () => {
            document.removeEventListener('click', handleFirstInteraction)
            document.removeEventListener('touchstart', handleFirstInteraction)
        }
    }, [])

    return (
        <>
            <audio ref={audioRef} loop>
                <source src="/audio/bgm.mp3" type="audio/mpeg" />
            </audio>
        </>
    )
}
