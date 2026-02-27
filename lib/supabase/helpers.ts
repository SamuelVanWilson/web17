import { supabase } from './client'

// ==================== SESSION MANAGEMENT ====================

/**
 * List of all localStorage keys used by the app
 */
const LS_SESSION_ID = 'memoryOdysseySessionId'
const LS_FIRST_LOGIN = 'memoryOdysseyFirstLogin'
const LS_PROGRESS = 'memoryOdysseyProgress'

/**
 * Clear all localStorage keys and return a fresh session ID
 */
function clearAndCreateFreshSession(): string {
    localStorage.removeItem(LS_SESSION_ID)
    localStorage.removeItem(LS_FIRST_LOGIN)
    localStorage.removeItem(LS_PROGRESS)
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(LS_SESSION_ID, newId)
    console.log('🔄 Fresh session created:', newId)
    return newId
}

/**
 * Get or create a unique session ID for the user
 * Stores session ID in localStorage for persistence across page loads
 */
export function getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(LS_SESSION_ID)

    if (!sessionId) {
        // Generate unique session ID using timestamp + random string
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem(LS_SESSION_ID, sessionId)
    }

    return sessionId
}

/**
 * Initialize game progress for a new session
 * Creates a record in game_progress table if it doesn't exist.
 * If insert fails (e.g. after DB wipe), resets localStorage and retries.
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
            throw fetchError
        }

        if (!existing) {
            // Try to insert with current session ID
            const { data, error: insertError } = await supabase
                .from('game_progress')
                .insert({
                    user_session_id: sessionId,
                    tickets: 7,
                    last_login_date: new Date().toISOString().split('T')[0],
                    consecutive_days: 1,
                })
                .select()
                .single()

            if (insertError) {
                console.warn('Insert failed, clearing stale localStorage and retrying with fresh session...', insertError.code || insertError.message)

                // Clear all stale localStorage and generate a brand-new session ID
                const freshId = clearAndCreateFreshSession()

                // Retry with fresh ID
                const { data: retryData, error: retryError } = await supabase
                    .from('game_progress')
                    .insert({
                        user_session_id: freshId,
                        tickets: 7,
                        last_login_date: new Date().toISOString().split('T')[0],
                        consecutive_days: 1,
                    })
                    .select()
                    .single()

                if (retryError) {
                    console.warn('Retry insert also failed, using local fallback:', retryError.message)
                    return {
                        user_session_id: freshId,
                        tickets: 7,
                        last_login_date: new Date().toISOString().split('T')[0],
                        consecutive_days: 1,
                    }
                }
                return retryData
            }
            return data
        }

        return existing
    } catch (error: any) {
        console.warn('initializeSession error, using local fallback:', error?.message || error)
        // Instead of crashing, return a safe default
        const fallbackId = getOrCreateSessionId()
        return {
            user_session_id: fallbackId,
            tickets: 7,
            last_login_date: new Date().toISOString().split('T')[0],
            consecutive_days: 1,
        }
    }
}

// ==================== GAME PROGRESS ====================

// localStorage fallback key
const LOCAL_PROGRESS_KEY = 'memoryOdysseyProgress'

function getLocalProgress() {
    try {
        const raw = localStorage.getItem(LOCAL_PROGRESS_KEY)
        if (raw) return JSON.parse(raw)
    } catch { }
    return {
        tickets: 7,
        last_login_date: new Date().toISOString().split('T')[0],
        consecutive_days: 1,
    }
}

function setLocalProgress(data: any) {
    try { localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(data)) } catch { }
}

/**
 * Get current game progress (tickets, streak, etc.)
 * Falls back to localStorage if Supabase is unavailable.
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
            // Any other error — use local fallback silently
            console.warn('Supabase unavailable, using local progress:', error?.code || error?.message || error)
            return getLocalProgress()
        }

        // Sync to local as backup
        setLocalProgress(data)
        return data
    } catch (error: any) {
        console.warn('getGameProgress fallback to local:', error?.message || error)
        return getLocalProgress()
    }
}

/**
 * Update ticket count
 * @param change - Number to add (positive) or subtract (negative)
 */
export async function updateTickets(change: number) {
    const sessionId = getOrCreateSessionId()

    try {
        const progress = await getGameProgress()
        const newTickets = Math.max(0, Math.min(7, (progress.tickets ?? 0) + change))

        // Try Supabase
        try {
            const { data, error } = await supabase
                .from('game_progress')
                .update({ tickets: newTickets, updated_at: new Date().toISOString() })
                .eq('user_session_id', sessionId)
                .select()
                .single()

            if (!error && data) {
                setLocalProgress(data)
                return data
            }
        } catch (_) { }

        // Supabase failed — update local only
        const updated = { ...progress, tickets: newTickets }
        setLocalProgress(updated)
        return updated
    } catch (error: any) {
        console.warn('updateTickets fallback:', error?.message || error)
        // Last resort: just update local
        const local = getLocalProgress()
        const updated = { ...local, tickets: Math.max(0, Math.min(7, (local.tickets ?? 0) + change)) }
        setLocalProgress(updated)
        return updated
    }
}

/**
 * Update login streak and award daily ticket
 * Falls back to localStorage if Supabase is unavailable.
 */
export async function updateLoginStreak() {
    const sessionId = getOrCreateSessionId()
    const today = new Date().toISOString().split('T')[0]

    try {
        const progress = await getGameProgress()
        const lastLogin = progress.last_login_date

        // Already logged in today
        if (lastLogin === today) {
            return { awarded: false, ...progress }
        }

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const isConsecutive = lastLogin === yesterdayStr
        const newConsecutiveDays = isConsecutive ? (progress.consecutive_days ?? 1) + 1 : 1
        const newTickets = Math.min(7, (progress.tickets ?? 0) + 1)

        const updated = {
            ...progress,
            tickets: newTickets,
            last_login_date: today,
            consecutive_days: newConsecutiveDays,
        }

        // Try Supabase first
        try {
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

            if (!error && data) {
                setLocalProgress(data)
                return { awarded: true, ticketsAdded: 1, ...data }
            }
        } catch (_) { }

        // Supabase failed — update local only
        setLocalProgress(updated)
        return { awarded: true, ticketsAdded: 1, ...updated }

    } catch (error: any) {
        console.warn('updateLoginStreak fallback:', error?.message || error)
        return { awarded: false, tickets: getLocalProgress().tickets }
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
            .upsert(
                {
                    user_session_id: sessionId,
                    score,
                    total_questions: totalQuestions,
                },
                { onConflict: 'user_session_id' }
            )
            .select()
            .maybeSingle()

        if (error) {
            console.warn('saveQuizScore non-critical error:', error)
        }
        return data
    } catch (error) {
        console.warn('saveQuizScore failed (non-critical):', error)
        return null
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
            .upsert(
                {
                    user_session_id: sessionId,
                    moves,
                    time_seconds: timeSeconds,
                },
                { onConflict: 'user_session_id' }
            )
            .select()
            .maybeSingle()

        if (error) {
            console.warn('saveMemoryMatchScore non-critical error:', error)
        }
        return data
    } catch (error) {
        console.warn('saveMemoryMatchScore failed (non-critical):', error)
        return null
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
            .upsert(
                {
                    user_session_id: sessionId,
                    score,
                    hearts_caught: heartsCaught,
                },
                { onConflict: 'user_session_id' }
            )
            .select()
            .maybeSingle()

        if (error) {
            console.warn('saveCatchLoveScore non-critical error:', error)
        }
        return data
    } catch (error) {
        console.warn('saveCatchLoveScore failed (non-critical):', error)
        return null
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
        console.warn('Error getting scratch history, returning empty:', error)
        return []
    }
}

/**
 * Save scratch history
 */
export async function saveScratchHistory(day: number) {
    const sessionId = getOrCreateSessionId()
    const today = new Date().toISOString().split('T')[0]

    try {
        const { data, error } = await supabase
            .from('scratch_history')
            .upsert(
                {
                    user_session_id: sessionId,
                    day,
                    scratched_at: today,
                },
                { ignoreDuplicates: true }
            )
            .select()
            .maybeSingle()

        // Ignore duplicate key errors (code 23505) - it just means already saved
        if (error && error.code !== '23505') {
            console.error('Error saving scratch history:', JSON.stringify(error, null, 2))
        } else if (error?.code === '23505') {
            console.log('ℹ️ Scratch history already exists for today, skipping.')
        }

        return data
    } catch (error) {
        // Don't rethrow - just log and continue
        console.warn('saveScratchHistory non-critical error:', error)
        return null
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
