
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars FIRST
dotenv.config({ path: '.env.local' });

async function run() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('No DATABASE_URL found in .env.local');
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync('.env.local')) {
            console.error('.env.local file also not found!');
        }
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        console.log('🔌 Connecting to DB...');
        await client.connect();

        console.log('🛠 Adding redeem_pin column if not exists...');
        await client.query(`alter table merchants add column if not exists redeem_pin text;`);

        console.log('✅ Success! Column added.');
    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

run();
