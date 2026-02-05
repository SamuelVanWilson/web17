export const getDaysSinceAnniversary = (startDate: Date): number => {
    const now = new Date()
    const diff = now.getTime() - startDate.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const getTimeSinceAnniversary = (startDate: Date) => {
    const now = new Date()
    const diff = now.getTime() - startDate.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    return {
        days,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60,
        totalSeconds: seconds,
    }
}

export const getTodayDateString = (): string => {
    const now = new Date()
    return now.toISOString().split('T')[0]
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}
