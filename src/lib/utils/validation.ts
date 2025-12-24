import { z } from 'zod'

// 商家创建表单验证
// 商家创建表单验证
export const merchantSchema = z.object({
  name: z.string().min(2, '商家名称至少2个字符'),
  slug: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和横线'),
  template_type: z.enum(['nail', 'sushi', 'chinese', 'bbq', 'massage', 'boba']),
  logo_url: z.string().optional().or(z.literal('')), // Top level column
  ga4_measurement_id: z.string().optional().or(z.literal('')),
  meta_pixel_id: z.string().optional().or(z.literal('')),
  redeem_pin: z.string().optional().or(z.literal('')),
  virtual_base_count: z.number().int().min(0).default(200).or(z.string().transform(val => parseInt(val, 10))),
  is_active: z.boolean().default(true),
  content: z.object({
    // === Basic Info ===
    businessName: z.string().min(1, 'Business Name is required'),
    businessType: z.string().optional(),
    priceRange: z.string().optional(),
    establishedYear: z.number().or(z.string().transform(val => parseInt(val, 10))).optional(),

    // === Logo ===
    logoUrl: z.string().optional().or(z.literal('')),

    // === Rating ===
    rating: z.number().or(z.string().transform(val => parseFloat(val))).optional(),
    reviewCount: z.string().optional(),

    // === Offer ===
    offer: z.object({
      type: z.string().optional(),
      value: z.string().min(1, 'Offer Value is required'),
      unit: z.string().optional(),
      description: z.string().optional(),
      totalLimit: z.number().or(z.string().transform(val => parseInt(val, 10))).optional(),
    }).optional(),

    // === Address ===
    address: z.object({
      street: z.string().optional(),
      area: z.string().optional(),
      fullAddress: z.string().optional(),
    }).optional(),

    // === Phone ===
    phone: z.string().optional(),
    phoneNote: z.string().optional(),

    // === Opening Hours ===
    openingHours: z.object({
      isOpen: z.boolean().optional(),
      currentStatus: z.string().optional(),
      closingTime: z.string().optional(),
      specialHours: z.string().optional(),
      schedule: z.record(z.string(), z.string()).optional(),
    }).optional(),

    // === Reviews ===
    reviews: z.array(z.object({
      id: z.number().optional(),
      rating: z.number().optional(),
      text: z.string().optional(),
      authorName: z.string().optional(),
      date: z.string().optional(),
    })).optional(),

    // === Legacy/Extra Fields (Optional to prevent strip during strict parsing) ===
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroImageUrl: z.string().optional(),
    features: z.array(z.any()).optional(),
    galleryImages: z.array(z.string()).optional(),
    primaryColor: z.string().optional(),

    // Flat Offer Fields (for form compatibility)
    offerTitle: z.string().optional(),
    offerDescription: z.string().optional(),
    offer_type: z.string().optional(),
    offer_value: z.string().optional(),
    offer_badge_text: z.string().optional(),
    offerDiscount: z.string().optional(),
  })
})

export type MerchantFormData = z.infer<typeof merchantSchema>

// 优惠券领取表单验证
export const couponClaimSchema = z.object({
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  name: z.string().min(2).optional().or(z.literal('')),
})

// 登录表单验证
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
