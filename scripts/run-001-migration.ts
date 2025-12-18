import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL missing');
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        // Run 001_analytics.sql
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '001_analytics.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('🚀 Running 001_analytics.sql...');
        await client.query(sql);
        console.log('✅ Migration successful');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
