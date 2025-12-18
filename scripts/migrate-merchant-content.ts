import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function migrate() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is not defined in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected.');

        console.log('🚀 Updating merchants content structure...');

        // This SQL updates the content JSONB structure for existing merchants
        // It maps old fields to new fields and provides defaults
        const updateQuery = `
            UPDATE merchants
            SET content = jsonb_build_object(
              'businessName', COALESCE(content->>'heroTitle', name),
              'businessType', COALESCE(content->>'businessType', 'Restaurant'),
              'priceRange', COALESCE(content->>'priceRange', '$$'),
              'establishedYear', COALESCE((content->>'establishedYear')::int, 2020),
              'logoUrl', content->>'logoUrl',
              'rating', COALESCE((content->>'rating')::numeric, 4.5),
              'reviewCount', COALESCE(content->>'reviewCount', '100'),
              'offer', jsonb_build_object(
                'type', COALESCE(content->>'offerType', 'Exclusive'),
                'value', COALESCE(content->>'offerDiscount', '10%'),
                'unit', 'Off',
                'description', COALESCE(content->>'offerDescription', 'Valid on your first order'),
                'totalLimit', 500
              ),
              'address', jsonb_build_object(
                'street', COALESCE(content->>'address', content->>'heroSubtitle', ''),
                'area', COALESCE(content->>'city', 'New York, NY'),
                'fullAddress', COALESCE(content->>'fullAddress', content->>'address', '')
              ),
              'phone', COALESCE(content->>'phone', '(555) 123-4567'),
              'phoneNote', 'Reservations & Inquiries',
              'openingHours', jsonb_build_object(
                'isOpen', true,
                'currentStatus', 'Open Now',
                'closingTime', '10 PM',
                'specialHours', ''
              ),
              'reviews', '[]'::jsonb
            )
            WHERE content IS NOT NULL;
        `;

        const res = await client.query(updateQuery);
        console.log(`✅ Updated ${res.rowCount} merchants.`);

    } catch (err) {
        console.error('❌ Failed to migrate merchants:', err);
    } finally {
        await client.end();
    }
}

migrate();
