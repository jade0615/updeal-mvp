import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载环境变量
// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// FORCE OVERRIDE for debugging
process.env.ALIYUN_SMTP_USER = 'info@hiraccoon.com';
process.env.ALIYUN_SMTP_PASS = 'Z2CrZ9punU97RaA';
process.env.ALIYUN_SMTP_HOST = 'smtp.qiye.aliyun.com'; // Standard Aliyun SMTP
process.env.ALIYUN_SMTP_PORT = '465';

// 确保环境变量已加载
console.log('检查环境变量 (Testing Context):')
console.log('  SMTP_HOST:', process.env.ALIYUN_SMTP_HOST)
console.log('  SMTP_USER:', process.env.ALIYUN_SMTP_USER)
console.log('  SMTP_PASS:', '******' + process.env.ALIYUN_SMTP_PASS?.slice(-3))
console.log('')

// import { sendT0Confirmation } from '../src/lib/email'

async function testEmail() {
  // Dynamically import to ensure env vars are loaded first
  const { sendT0Confirmation } = await import('../src/lib/email.ts')
  console.log('📧 测试邮件发送到: wisdomjadefeng@gmail.com')
  console.log('发送方: Hiraccoon <info@hiraccoon.com>')
  console.log('')

  const testData = {
    email: 'wisdomjadefeng@gmail.com',
    merchantName: 'Honoo Ramen Bar',
    couponCode: 'TEST123',
    expectedDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
    address: '123 Test Street, Chicago, IL 60601',
    merchantSlug: 'honoo-ramen-bar',
    referralCode: 'REF-TEST12'
  }

  console.log('📝 测试数据:')
  console.log('  商家:', testData.merchantName)
  console.log('  优惠券码:', testData.couponCode)
  console.log('  预约日期:', testData.expectedDate.toLocaleDateString())
  console.log('  地址:', testData.address)
  console.log('')

  console.log('📤 发送中...')
  const result = await sendT0Confirmation(testData)

  if (result.success) {
    console.log('✅ 邮件发送成功！')
    console.log('')
    console.log('请检查邮箱: wisdomjadefeng@gmail.com')
    console.log('  - 检查收件箱')
    console.log('  - 检查垃圾邮件/促销邮件文件夹')
    console.log('  - 发件人应该显示: Hiraccoon <info@hiraccoon.com>')
    console.log('  - 邮件应该包含日历邀请 (.ics 附件)')
  } else {
    console.log('❌ 邮件发送失败')
    console.log('错误:', result.error)
  }
}

testEmail().catch(console.error)
