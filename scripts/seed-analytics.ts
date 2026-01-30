
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedAnalytics() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    const merchantId = '3ecfe0cc-62fe-4174-a4f0-59a6e4ca4d15'; // Honoo Ramen Bar

    try {
        await client.connect();

        // Insert 5 views for yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(12, 0, 0, 0);

        console.log(`Seeding 5 views for merchant ${merchantId} at ${yesterday.toISOString()}...`);

        for (let i = 0; i < 5; i++) {
            await client.query(`
                INSERT INTO page_views (merchant_id, viewed_at, user_agent)
                VALUES ($1, $2, 'Seeding Script')
            `, [merchantId, yesterday.toISOString()]);
        }

        // Insert 3 views for today
        const today = new Date();
        console.log(`Seeding 3 views for merchant ${merchantId} at ${today.toISOString()}...`);
        for (let i = 0; i < 3; i++) {
            await client.query(`
                INSERT INTO page_views (merchant_id, viewed_at, user_agent)
                VALUES ($1, $2, 'Seeding Script')
            `, [merchantId, today.toISOString()]);
        }

        console.log('Seeding complete.');

    } catch (error) {
        console.error('Error seeding:', error);
    } finally {
        await client.end();
    }
}

seedAnalytics().catch(console.error);
