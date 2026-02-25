import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_FROM_NUMBER

if (!accountSid && process.env.NODE_ENV === 'production') {
    console.warn('TWILIO_ACCOUNT_SID is not defined in production environment')
}
if (!authToken && process.env.NODE_ENV === 'production') {
    console.warn('TWILIO_AUTH_TOKEN is not defined in production environment')
}

export const twilioClient =
    accountSid && authToken ? twilio(accountSid, authToken) : null

export const SMS_FROM_NUMBER = fromNumber || ''

/**
 * Send a single SMS via Twilio.
 * Returns { success: true } or { success: false, error: string }
 */
export async function sendSms(
    to: string,
    body: string
): Promise<{ success: boolean; error?: string }> {
    if (!twilioClient) {
        return { success: false, error: 'Twilio 未配置，请联系管理员。' }
    }
    if (!SMS_FROM_NUMBER) {
        return { success: false, error: 'TWILIO_FROM_NUMBER 环境变量未设置。' }
    }

    try {
        await twilioClient.messages.create({
            from: SMS_FROM_NUMBER,
            to,
            body,
        })
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err?.message || '发送失败' }
    }
}
