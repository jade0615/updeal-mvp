/**
 * Google Sheets Webhook Backup
 *
 * 将每次 coupon claim 的数据实时备份到 Google Sheets
 * 使用 Google Apps Script Web App 或 Zapier/Make.com Webhook
 *
 * 设置步骤:
 * 1. 创建 Google Sheet
 * 2. 打开 Extensions > Apps Script
 * 3. 部署以下代码作为 Web App:
 *
 * function doPost(e) {
 *   const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   const data = JSON.parse(e.postData.contents);
 *   sheet.appendRow([
 *     new Date(),
 *     data.merchantId,
 *     data.merchantName,
 *     data.phone,
 *     data.name,
 *     data.couponCode,
 *     data.claimedAt
 *   ]);
 *   return ContentService.createTextOutput(JSON.stringify({success: true}))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 *
 * 4. 部署为 Web App，设置 "Anyone" 可访问
 * 5. 将 Web App URL 设置为环境变量 GOOGLE_SHEETS_WEBHOOK_URL
 */

interface BackupData {
  merchantId: string;
  merchantName: string;
  phone: string;
  name: string;
  couponCode: string;
  claimedAt: string;
}

export async function backupToGoogleSheets(data: BackupData): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    // Webhook 未配置，静默跳过
    console.log('Google Sheets webhook not configured, skipping backup');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Google Sheets backup failed:', response.status, await response.text());
      return false;
    }

    console.log('Successfully backed up to Google Sheets:', data.couponCode);
    return true;
  } catch (error) {
    console.error('Google Sheets backup error:', error);
    return false;
  }
}
