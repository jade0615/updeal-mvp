import ical, { ICalCalendarMethod } from 'ical-generator';

interface CalendarEventData {
    merchantName: string;
    expectedDate: Date;
    couponCode: string;
    address?: string;
    merchantSlug: string;
}

/**
 * Generates ICS file content for email attachments
 */
export function generateICS(data: CalendarEventData): string {
    const calendar = ical({
        name: 'UpDeal Reservation',
        method: ICalCalendarMethod.PUBLISH,
    });

    const startTime = new Date(data.expectedDate);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

    calendar.createEvent({
        start: startTime,
        end: endTime,
        summary: `🍽️ Dine at ${data.merchantName}`,
        description: `Don't forget to show your coupon code: ${data.couponCode} to the staff.\n\nVerify Link: https://pay.miaojieai.com/verify/${data.couponCode}`,
        location: data.address || 'Reserved Restaurant',
        busystatus: 'busy',
        url: `https://pay.miaojieai.com/verify/${data.couponCode}`
    });

    return calendar.toString();
}

/**
 * Generates direct links for Google Calendar, Outlook, etc.
 * Useful for "Add to Calendar" buttons in the email body
 */
export function generateCalendarLinks(data: CalendarEventData) {
    const start = data.expectedDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(data.expectedDate.getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, '');

    const title = encodeURIComponent(`🍽️ Dine at ${data.merchantName}`);
    const details = encodeURIComponent(`Coupon Code: ${data.couponCode}\nShow this to staff for your discount.`);
    const location = encodeURIComponent(data.address || '');

    return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${data.expectedDate.toISOString()}&enddt=${new Date(data.expectedDate.getTime() + 2 * 60 * 60 * 1000).toISOString()}&body=${details}&location=${location}`,
    };
}
