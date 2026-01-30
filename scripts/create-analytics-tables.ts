
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createAnalyticsTables() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Required for Supabase connection pooling sometimes
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Create page_views table
        console.log('Dropping page_views table...');
        await client.query('DROP TABLE IF EXISTS page_views CASCADE;');

        console.log('Creating page_views table...');
        await client.query(`
          CREATE TABLE page_views (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
            viewed_at TIMESTAMPTZ DEFAULT NOW(),
            user_agent TEXT,
            ip_address TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE INDEX idx_page_views_merchant_viewed_at ON page_views(merchant_id, viewed_at);
        `);
        console.log('page_views table created.');

        // 2. Create events table
        console.log('Dropping events table...');
        await client.query('DROP TABLE IF EXISTS events CASCADE;');

        console.log('Creating events table...');
        await client.query(`
          CREATE TABLE events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type TEXT NOT NULL,
            merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            session_id TEXT,
            page_url TEXT,
            referrer TEXT,
            user_agent TEXT,
            metadata JSONB DEFAULT '{}'::jsonb,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE INDEX idx_events_merchant_created_at ON events(merchant_id, created_at);
          CREATE INDEX idx_events_type_merchant ON events(event_type, merchant_id);
        `);
        console.log('events table created.');

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        await client.end();
    }
}

createAnalyticsTables().catch(console.error);
