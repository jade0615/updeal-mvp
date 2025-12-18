import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function deploy() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is not defined in .env.local');
        console.log('👉 Please go to Supabase > Project Settings > Database > Connection pooler (or Direct connection) and copy the URI.');
        console.log('   Format: postgres://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected.');

        const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
        console.log(`📄 Reading schema from ${schemaPath}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Executing schema...');
        await client.query(schemaSql);
        console.log('✅ Schema deployed successfully!');

    } catch (err) {
        console.error('❌ Failed to deploy schema:', err);
    } finally {
        await client.end();
    }
}

deploy();
