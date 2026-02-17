'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'accent'
    size?: 'sm' | 'md' | 'lg'
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'font-heading font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
        primary: 'bg-white text-primary-600 border-2 border-primary-100 hover:border-primary-300 shadow-lg shadow-pink-100 hover:shadow-xl hover:shadow-pink-200 transition-all duration-300',
        secondary: 'bg-white/80 backdrop-blur-sm text-gray-700 border border-white/50 hover:bg-white hover:text-primary-600 shadow-sm hover:shadow-md',
        accent: 'bg-gradient-to-r from-accent-200 to-accent-300 text-gray-800 hover:from-accent-300 hover:to-accent-400 shadow-md hover:shadow-lg',
    }

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-8 py-3 text-base', // Increased padding for better touch target
        lg: 'px-10 py-4 text-lg',
    }

    return (
        <motion.button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    )
}
