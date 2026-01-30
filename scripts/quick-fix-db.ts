
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fix() {
    if (!process.env.DATABASE_URL) { console.error('No DB URL'); process.exit(1); }
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();
    console.log('Applying migrations...');
    await client.query('ALTER TABLE coupons ADD COLUMN IF NOT EXISTS expected_visit_date TIMESTAMPTZ;');
    await client.query('ALTER TABLE coupons ADD COLUMN IF NOT EXISTS email_sent_stage INTEGER DEFAULT 0;');
    console.log('Done.');
    await client.end();
}
fix().catch(console.error);
