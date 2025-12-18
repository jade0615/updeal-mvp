import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const token = request.cookies.get('updeal_admin_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await validateSession(token)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 解析表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File
    const merchantId = formData.get('merchantId') as string
    const fileType = formData.get('type') as string // 'logo' | 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 验证文件类型
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/jpg'].includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PNG, JPEG, and WebP are allowed.' }, { status: 400 })
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // 上传到 Supabase Storage
    const supabase = createAdminClient()
    const bucket = fileType === 'logo' ? 'merchant-logos' : 'merchant-images'
    const fileName = `${merchantId || 'temp'}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
