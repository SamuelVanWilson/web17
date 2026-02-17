import { supabase } from './client'

// ==================== SESSION MANAGEMENT ====================

/**
 * Get or create a unique session ID for the user
 * Stores session ID in localStorage for persistence across page loads
 */
export function getOrCreateSessionId(): string {
    const storageKey = 'memoryOdysseySessionId'
    let sessionId = localStorage.getItem(storageKey)

    if (!sessionId) {
        // Generate unique session ID using timestamp + random string
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem(storageKey, sessionId)
    }

    return sessionId
}

/**
 * Initialize game progress for a new session
 * Creates a record in game_progress table if it doesn't exist
 */
export async function initializeSession() {
    const sessionId = getOrCreateSessionId()

    try {
        // Check if session already exists
        const { data: existing, error: fetchError } = await supabase
            .from('game_progress')
            .select('*')
            .eq('user_session_id', sessionId)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is expected for new sessions
            throw fetchError
        }

        if (!existing) {
            // Create new game progress record
            const { data, error: insertError } = await supabase
                .from('game_progress')
                .insert({
                    user_session_id: sessionId,
                    tickets: 7, // Start with 7 tickets
                    last_login_date: new Date().toISOString().split('T')[0],
                    consecutive_days: 1,
                })
                .select()
                .single()

            if (insertError) {
                console.error('Insert error details:', {
                    message: insertError.message,
                    code: insertError.code,
                    details: insertError.details,
                    hint: insertError.hint,
                })
                throw insertError
            }
            return data
        }

        return existing
    } catch (error: any) {
        console.error('Error initializing session:', {
            message: error?.message || 'Unknown error',
            code: error?.code,
            details: error?.details,
            hint: error?.hint,
            full: error
        })
        throw error
    }
}

// ==================== GAME PROGRESS ====================

/**
 * Get current game progress (tickets, streak, etc.)
 */
export async function getGameProgress() {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('game_progress')
            .select('*')
            .eq('user_session_id', sessionId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No record found, initialize new session
                return await initializeSession()
            }
            throw error
        }

        return data
    } catch (error: any) {
        console.error('Error getting game progress:', {
            message: error?.message || 'Unknown error',
            code: error?.code,
            details: error?.details
        })
        throw error
    }
}

/**
 * Update ticket count
 * @param change - Number to add (positive) or subtract (negative)
 */
export async function updateTickets(change: number) {
    const sessionId = getOrCreateSessionId()

    try {
        // Get current tickets
        const progress = await getGameProgress()
        const newTickets = Math.max(0, Math.min(7, progress.tickets + change))

        // Update tickets
        const { data, error } = await supabase
            .from('game_progress')
            .update({
                tickets: newTickets,
                updated_at: new Date().toISOString(),
            })
            .eq('user_session_id', sessionId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error: any) {
        console.error('Error updating tickets:', {
            message: error?.message || 'Unknown error',
            code: error?.code,
            sessionId: sessionId
        })
        throw error
    }
}

/**
 * Update login streak and award daily ticket
 * Checks if user logged in today, awards ticket if not
 */
export async function updateLoginStreak() {
    const sessionId = getOrCreateSessionId()
    const today = new Date().toISOString().split('T')[0]

    try {
        const progress = await getGameProgress()
        const lastLogin = progress.last_login_date

        // If already logged in today, do nothing
        if (lastLogin === today) {
            return { awarded: false, ...progress }
        }

        // Calculate if streak continues
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const isConsecutive = lastLogin === yesterdayStr
        const newConsecutiveDays = isConsecutive ? progress.consecutive_days + 1 : 1

        // Award 1 ticket (max 7)
        const newTickets = Math.min(7, progress.tickets + 1)

        // Update database
        const { data, error } = await supabase
            .from('game_progress')
            .update({
                tickets: newTickets,
                last_login_date: today,
                consecutive_days: newConsecutiveDays,
                updated_at: new Date().toISOString(),
            })
            .eq('user_session_id', sessionId)
            .select()
            .single()

        if (error) throw error
        return { awarded: true, ticketsAdded: 1, ...data }
    } catch (error: any) {
        console.error('Error updating login streak:', {
            message: error?.message || 'Unknown error',
            code: error?.code
        })
        throw error
    }
}

// ==================== QUIZ GAME ====================

/**
 * Save quiz score to database
 */
export async function saveQuizScore(score: number, totalQuestions: number) {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('quiz_scores')
            .insert({
                user_session_id: sessionId,
                score,
                total_questions: totalQuestions,
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error saving quiz score:', error)
        throw error
    }
}

/**
 * Get user's quiz high score
 */
export async function getQuizHighScore() {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('quiz_scores')
            .select('score, total_questions')
            .eq('user_session_id', sessionId)
            .order('score', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    } catch (error) {
        console.error('Error getting quiz high score:', error)
        return null
    }
}

// ==================== MEMORY MATCH GAME ====================

/**
 * Save memory match score to database
 */
export async function saveMemoryMatchScore(moves: number, timeSeconds: number) {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('memory_match_scores')
            .insert({
                user_session_id: sessionId,
                moves,
                time_seconds: timeSeconds,
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving memory match score:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            })
            throw error
        }
        return data
    } catch (error: any) {
        console.error('Failed to save memory match score:', {
            message: error?.message || 'Unknown error',
            code: error?.code,
            details: error?.details,
            name: error?.name,
            stack: error?.stack
        })
        throw error
    }
}

/**
 * Get user's best memory match score (lowest moves)
 */
export async function getMemoryMatchBestScore() {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('memory_match_scores')
            .select('moves, time_seconds')
            .eq('user_session_id', sessionId)
            .order('moves', { ascending: true })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    } catch (error) {
        console.error('Error getting memory match best score:', error)
        return null
    }
}

// ==================== CATCH LOVE GAME ====================

/**
 * Save catch love score to database
 */
export async function saveCatchLoveScore(score: number, heartsCaught: number) {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('catch_love_scores')
            .insert({
                user_session_id: sessionId,
                score,
                hearts_caught: heartsCaught,
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error saving catch love score:', error)
        throw error
    }
}

/**
 * Get user's catch love high score
 */
export async function getCatchLoveHighScore() {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('catch_love_scores')
            .select('score, hearts_caught')
            .eq('user_session_id', sessionId)
            .order('score', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    } catch (error) {
        console.error('Error getting catch love high score:', error)
        return null
    }
}

// ==================== SCRATCH-OFF GAME ====================

/**
 * Get scratch history for current user
 */
export async function getScratchHistory() {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('scratch_history')
            .select('*')
            .eq('user_session_id', sessionId)
            .order('day', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error getting scratch history:', error)
        throw error
    }
}

/**
 * Save scratch history
 */
export async function saveScratchHistory(day: number) {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('scratch_history')
            .insert({
                user_session_id: sessionId,
                day,
                scratched_at: new Date().toISOString().split('T')[0],
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error saving scratch history:', error)
        throw error
    }
}

/**
 * Check if a specific day has been scratched
 */
export async function isDayScratched(day: number): Promise<boolean> {
    const sessionId = getOrCreateSessionId()

    try {
        const { data, error } = await supabase
            .from('scratch_history')
            .select('id')
            .eq('user_session_id', sessionId)
            .eq('day', day)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return !!data
    } catch (error) {
        console.error('Error checking scratch status:', error)
        return false
    }
}
