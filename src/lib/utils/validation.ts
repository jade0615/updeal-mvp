import { z } from 'zod'

// 商家创建表单验证
// 商家创建表单验证
export const merchantSchema = z.object({
  name: z.string().min(2, '商家名称至少2个字符'),
  // Validation: Relaxed slug to allow auto-generation/cleaning logic to handle it, 
  // but strictly it should be URL safe. We'll enforce a cleaner regex but give a helpful message.
  slug: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和横线 (e.g. dragon-house)'),
  // Expanded template types to avoid "Invalid enum" errors for new types
  template_type: z.enum(['nail', 'sushi', 'chinese', 'bbq', 'massage', 'boba', 'buffet', 'ramen', 'pizza', 'cafe', 'entertainment', 'other']).or(z.literal('sushi')),
  logo_url: z.string().optional().or(z.literal('')),
  ga4_measurement_id: z.string().optional().or(z.literal('')),
  meta_pixel_id: z.string().optional().or(z.literal('')),
  redeem_pin: z.string().optional().or(z.literal('')),
  // Internal ID for merchant (商家内部编号)
  internal_id: z.string().optional().or(z.literal('')),
  // Relaxed number parsing
  virtual_base_count: z.number().int().min(0).default(200).or(z.string().transform(val => parseInt(val, 10) || 200)),
  is_active: z.boolean().default(true),
  content: z.object({
    // === Basic Info ===
    businessName: z.string().min(1, 'Business Name is required'),
    businessType: z.string().optional(),
    priceRange: z.string().optional(),
    establishedYear: z.number().or(z.string().transform(val => parseInt(val, 10))).optional(),

    // === Logo ===
    logoUrl: z.string().optional().or(z.literal('')),

    // === Website ===
    website: z.string().optional().or(z.literal('')),

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

    // === Data Collection Requirements ===
    requirements: z.object({
      collectName: z.boolean().default(true),
      collectEmail: z.boolean().default(false),
    }).optional(),

    // === Custom Labels (Frontend Text Control) ===
    customLabels: z.object({
      section_title_claim: z.string().optional(),
      section_subtitle_claim: z.string().optional(),
      button_text_claim: z.string().optional(),
      success_title: z.string().optional(),
      success_subtitle: z.string().optional(),
      success_code_label: z.string().optional(),
      vip_welcome_title: z.string().optional(),
      vip_welcome_subtitle: z.string().optional(),
      section_title_visit: z.string().optional(),
      section_title_hours: z.string().optional(),
      section_title_website: z.string().optional(),
      section_title_call: z.string().optional(),
    }).optional(),
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
