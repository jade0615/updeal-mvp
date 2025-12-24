export interface MerchantContent {
    // === Basic Info ===
    businessName: string;           // e.g., "The Rusty Spoon"
    businessType: string;           // e.g., "Italian Cuisine"
    priceRange: string;             // e.g., "$", "$$", "$$$", "$$$$"
    establishedYear: number;        // e.g., 2016

    // === Logo ===
    logoUrl?: string;               // Optional, auto-generated if empty

    // === Rating ===
    rating: number;                 // e.g., 4.8
    reviewCount: string;            // e.g., "1.2k" or "128"

    // === Offer ===
    offer: {
        type: string;                 // "Exclusive", "Limited", "Special", "Holiday"
        value: string;                // "50%", "Buy 1 Get 1", "$10"
        unit: string;                 // "Off", "Free", "Off Your Order"
        description: string;          // "Valid on all main courses..."
        totalLimit: number;           // Total limit, e.g., 500
        virtual_base_count?: number;  // Marketing logic: Virtual base count for social proof
    };

    // === Address ===
    address: {
        street: string;               // "123 Culinary Avenue"
        area: string;                 // "Food District, New York, NY 10001"
        fullAddress: string;          // Full address for Google Maps
    };

    // === Phone ===
    phone: string;                  // "+1 (555) 000-1234"
    phoneNote?: string;             // "Reservations & Inquiries"

    // === Opening Hours ===
    openingHours: {
        isOpen: boolean;              // Computed status
        currentStatus: string;        // "Open Now" or "Closed"
        closingTime: string;          // "10 PM"
        specialHours?: string;        // "Happy Hour 5-7 PM"
        schedule?: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
        };
    };

    // === Reviews ===
    reviews: Array<{
        id: number;
        rating: number;               // 1-5
        text: string;                 // Review content
        authorName: string;           // Author name
        date: string;                 // "2 days ago"
    }>;

    // === Legacy/Compatibility Fields (Optional) ===
    heroTitle?: string;
    heroSubtitle?: string;
    offerDiscount?: string;
}

export interface Merchant {
    id: string;
    name: string;
    slug: string;
    template_type: string;
    content: MerchantContent;
    ga4_measurement_id?: string;
    meta_pixel_id?: string;
    redeem_pin?: string;
    virtual_base_count: number;
    created_at: string;
    updated_at: string;
}
