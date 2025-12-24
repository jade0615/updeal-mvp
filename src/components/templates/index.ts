export type TemplateType = 'nail' | 'sushi' | 'chinese' | 'bbq' | 'massage' | 'boba'

export type OfferType = 'discount' | 'coupon' | 'bogo' | 'reservation' | 'free_item' | 'bundle'

export interface BaseTemplateContent {
  businessName: string
  heroTitle: string
  heroSubtitle: string
  heroImageUrl: string
  offerTitle: string
  offerDescription: string
  offerDiscount: string // Deprecated: use offer_value instead
  // New offer fields
  offer_type?: OfferType
  offer_value?: string // e.g., '50%', '$10', 'Buy 1 Get 1', '$29.99 Special'
  offer_badge_text?: string // e.g., 'Get $10 Off', 'Free Appetizer'
  features: Array<{
    title: string
    description: string
    imageUrl?: string
  }>
  galleryImages: string[]
  phone?: string
  address?: string
  primaryColor?: string
  rating?: string
  // Modern Template Fields
  reviewsCount?: string
  category?: string
  priceRange?: string
  yearEstablished?: string | number
}

export interface TemplateProps {
  merchant: {
    id: string
    name: string
    slug: string
    template_type: TemplateType
    content: BaseTemplateContent
    ga4_measurement_id?: string
  }
  claimedCount: number
}
