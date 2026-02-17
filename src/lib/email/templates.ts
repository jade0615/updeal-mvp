/**
 * Email Templates for Updeal
 * Branded with Gold (#D4AF37) and Dark (#0F172A) aesthetics.
 */

export const getCouponClaimedEmailTemplate = (data: {
    name: string;
    couponCode: string;
    merchantName?: string;
    description?: string;
}) => {
    const { name, couponCode, merchantName = 'Updeal Merchant', description = 'Your coupon is ready to use!' } = data;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Coupon is Ready!</title>
            <style>
                body {
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f4f4f5;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .header {
                    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
                    padding: 40px 20px;
                    text-align: center;
                }
                .logo {
                    color: #D4AF37; /* Gold */
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: -0.5px;
                    margin-bottom: 10px;
                }
                .content {
                    padding: 40px;
                    color: #1E293B;
                    line-height: 1.6;
                }
                .greeting {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 20px;
                }
                .coupon-card {
                    background-color: #F8FAFC;
                    border: 2px dashed #D4AF37;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                }
                .coupon-label {
                    text-transform: uppercase;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748B;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .coupon-code {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 10px 0;
                    letter-spacing: 2px;
                }
                .footer {
                    padding: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #64748B;
                    background-color: #F8FAFC;
                    border-top: 1px solid #E2E8F0;
                }
                .button {
                    display: inline-block;
                    background-color: #D4AF37;
                    color: #ffffff !important;
                    padding: 14px 28px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 20px;
                    transition: all 0.2s ease;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">UPDEAL</div>
                    <div style="color: #cbd5e1; font-size: 14px;">Exclusive Rewards</div>
                </div>
                <div class="content">
                    <div class="greeting">Hi ${name},</div>
                    <p>Great news! You have successfully claimed a coupon from <strong>${merchantName}</strong>.</p>
                    <p>${description}</p>
                    
                    <div class="coupon-card">
                        <div class="coupon-label">Your Discount Code</div>
                        <div class="coupon-code">${couponCode}</div>
                        <p style="font-size: 14px; color: #64748B;">Show this code at the store to redeem your reward.</p>
                    </div>
                    
                    <p>We hope you enjoy your visit!</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Updeal. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const getExpirationReminderEmailTemplate = (data: {
    name: string;
    merchantName: string;
    merchantAddress?: string;
    merchantPhone?: string;
    merchantSlug: string;
}) => {
    const { name, merchantName, merchantAddress, merchantPhone, merchantSlug } = data;
    const previewUrl = `https://hiraccoon.com/${merchantSlug}`;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your ${merchantName} coupon is expiring soon!</title>
            <style>
                body {
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f4f4f5;
                    margin: 0;
                    padding: 0;
                    line-height: 1.6;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .header {
                    background: #0F172A;
                    padding: 30px 20px;
                    text-align: center;
                }
                .logo {
                    color: #D4AF37;
                    font-size: 28px;
                    font-weight: bold;
                }
                .content {
                    padding: 40px;
                    color: #1E293B;
                }
                .content p {
                    margin-bottom: 20px;
                }
                .address-box {
                    background-color: #F8FAFC;
                    border-left: 4px solid #D4AF37;
                    padding: 20px;
                    margin: 30px 0;
                }
                .button {
                    display: inline-block;
                    background-color: #0F172A;
                    color: #ffffff !important;
                    padding: 14px 28px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .footer {
                    padding: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #64748B;
                    background-color: #F8FAFC;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">UPDEAL</div>
                </div>
                <div class="content">
                    <p>Hi ${name || 'there'},</p>
                    <p>Just a friendly reminder — your exclusive coupon for <strong>${merchantName}</strong> is expiring soon! Don't miss out on this deal.</p>
                    
                    <p>Come visit us before it's too late:</p>
                    
                    <div class="address-box">
                        <strong>📍 ${merchantName}</strong><br>
                        ${merchantAddress ? `📫 ${merchantAddress}<br>` : ''}
                        ${merchantPhone ? `📞 ${merchantPhone}` : ''}
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${previewUrl}" class="button">View your coupon</a>
                    </div>
                    
                    <p style="margin-top: 30px;">We can't wait to see you!</p>
                    <p>Best,<br>${merchantName}</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Updeal & ${merchantName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
