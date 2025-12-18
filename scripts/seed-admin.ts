import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
    const email = 'admin@updeal.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Seeding admin user: ${email}`);

    // Upsert admin user
    const { data, error } = await supabase
        .from('admin_users')
        .upsert({
            email,
            password_hash: hashedPassword,
            name: 'Super Admin',
            role: 'admin',
            is_active: true
        }, { onConflict: 'email' })
        .select()
        .single();

    if (error) {
        console.error('Error seeding admin:', error);
    } else {
        console.log('✅ Admin user seeded successfully:', data);
    }
}

seed();
