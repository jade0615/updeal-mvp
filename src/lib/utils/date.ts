
/**
 * Utility for handling New York time (America/New_York)
 */

export const NY_TIMEZONE = 'America/New_York';

/**
 * Formats a date string or object to New York time
 */
export function formatToNYTime(date: string | Date | number, options: Intl.DateTimeFormatOptions = {}) {
    const d = new Date(date);
    return d.toLocaleString('zh-CN', {
        timeZone: NY_TIMEZONE,
        hour12: false,
        ...options
    });
}

/**
 * Returns a string describing the current time in New York
 * Example: 2026年2月16日 下午3:45 EST
 */
export function getNYLastUpdatedMessage() {
    const now = new Date();

    // Custom format for "Last Updated" requirement
    const dateStr = now.toLocaleString('zh-CN', {
        timeZone: NY_TIMEZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    return `纽约时间 ${dateStr} EST`;
}

/**
 * Returns the "Start of Day" for New York time as an ISO string (UTC)
 * Useful for Supabase queries (e.g., .gte('created_at', getNYStartOfDay()))
 */
export function getNYStartOfDay(date: Date = new Date()) {
    const nyDateStr = date.toLocaleDateString('en-CA', { timeZone: NY_TIMEZONE }); // YYYY-MM-DD

    // Create a formatter for the offset/timezone name
    const nyStr = date.toLocaleString('en-US', { timeZone: NY_TIMEZONE, timeZoneName: 'short' });
    const isDST = nyStr.includes('EDT');
    const offset = isDST ? '-04:00' : '-05:00';

    return `${nyDateStr}T00:00:00${offset}`;
}

/**
 * Returns ISO strings for a given period in NY time
 */
export function getNYPeriodRange(period: string) {
    const now = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;

    switch (period) {
        case 'today':
            startDate = getNYStartOfDay(now);
            break;
        case 'yesterday':
            const yest = new Date(now);
            yest.setDate(yest.getDate() - 1);
            startDate = getNYStartOfDay(yest);
            endDate = getNYStartOfDay(now);
            break;
        case '7d':
            const d7 = new Date(now);
            d7.setDate(d7.getDate() - 7);
            startDate = getNYStartOfDay(d7);
            break;
        case '30d':
            const d30 = new Date(now);
            d30.setDate(d30.getDate() - 30);
            startDate = getNYStartOfDay(d30);
            break;
    }

    return { startDate, endDate };
}
