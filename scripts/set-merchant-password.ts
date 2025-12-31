
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

async function main() {
    const args = process.argv.slice(2);
    const email = args[0];
    const password = args[1];

    if (!email || !password) {
        console.error('Usage: npx tsx scripts/set-merchant-password.ts <email> <password>');
        process.exit(1);
    }

    console.log(`Setting password for merchant: ${email}`);

    const supabase = createAdminClient();

    // 1. Check if merchant exists
    const { data: merchant, error: fetchError } = await supabase
        .from('merchants')
        .select('id, name')
        .eq('email', email)
        .single();

    if (fetchError || !merchant) {
        // Try searching by slug if not found by email, or update email if slug matches? 
        // For now, assume email must match.
        // Actually, many merchants might not have email set yet (it's a new field).
        // Let's try to update by slug or exact match if email is not found but we want to set it?
        // No, let's keep it simple: we must update an EXISTING record.
        // If email is null, we can't search by it effectively. 
        // Let's allow searching by Slug OR Email.
        console.log('Merchant not found by email. Trying to search by slug or ID...');

        const { data: merchantBySlug, error: slugError } = await supabase
            .from('merchants')
            .select('id, name, email')
            .or(`slug.eq.${email},id.eq.${email},email.eq.${email}`) // user might have passed slug as first arg
            .single();

        if (slugError || !merchantBySlug) {
            console.error('Merchant not found by Email, Slug, or ID.');
            process.exit(1);
        }

        console.log(`Found merchant: ${merchantBySlug.name} (${merchantBySlug.id})`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Update password and ensure email is set (if we found by slug)
        // If the first arg was an email address format, set it as email.
        const isEmailFormat = email.includes('@');
        const updateData: any = { password_hash: hash };
        if (isEmailFormat) {
            updateData.email = email;
        }

        const { error: updateError } = await supabase
            .from('merchants')
            .update(updateData)
            .eq('id', merchantBySlug.id);

        if (updateError) {
            console.error('Error updating password:', updateError);
            process.exit(1);
        }

        console.log(`✅ Password set successfully for ${merchantBySlug.name}`);
        if (isEmailFormat) console.log(`✅ Email set to ${email}`);

    } else {
        // Merchant found by email
        console.log(`Found merchant: ${merchant.name} (${merchant.id})`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Update
        const { error: updateError } = await supabase
            .from('merchants')
            .update({ password_hash: hash })
            .eq('id', merchant.id);

        if (updateError) {
            console.error('Error updating password:', updateError);
            process.exit(1);
        }

        console.log(`✅ Password updated successfully for ${merchant.name}`);
    }
}

main().catch(console.error);
