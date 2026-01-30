/**
 * 测试生产环境的 coupon claim API
 * 这个脚本会调用真实的 API endpoint 来测试邮件发送
 */

async function testClaimAPI() {
  const apiUrl = 'https://hiraccoon.com/api/public/coupons/claim'

  // 明天的日期作为预约日期
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const testData = {
    merchantId: '3ecfe0cc-62fe-4174-a4f0-59a6e4ca4d15',
    phone: '+1-555-TEST-001',
    name: 'Test User',
    email: 'wisdomjadefeng@gmail.com',
    expectedVisitDate: tomorrow.toISOString()
  }

  console.log('🚀 测试 Coupon Claim API')
  console.log('API URL:', apiUrl)
  console.log('\n📝 请求数据:')
  console.log(JSON.stringify(testData, null, 2))
  console.log('\n📤 发送请求...\n')

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log('📊 响应状态:', response.status, response.statusText)

    const result = await response.json()

    console.log('\n📨 响应数据:')
    console.log(JSON.stringify(result, null, 2))

    if (result.success) {
      console.log('\n✅ API 调用成功！')
      console.log('优惠券码:', result.coupon?.code)
      console.log('邮件发送:', result.emailSent ? '✅ 成功' : '❌ 失败')
      console.log('\n📧 请检查邮箱: wisdomjadefeng@gmail.com')
      console.log('  - 发件人应该是: Hiraccoon <info@hiraccoon.com>')
      console.log('  - 应该包含日历邀请附件 (.ics)')
    } else {
      console.log('\n❌ API 调用失败')
      console.log('错误:', result.error)
    }

  } catch (error) {
    console.error('\n❌ 请求失败:', error)
  }
}

testClaimAPI()
