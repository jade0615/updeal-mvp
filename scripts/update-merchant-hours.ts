require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    const slug = 'hot-pot-meets-bbq';
    console.log(`Updating hours for: ${slug}`);

    // 1. Fetch current data
    const { data: merchant, error: fetchError } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (fetchError || !merchant) {
        console.error('Error fetching merchant:', fetchError);
        return;
    }

    // 2. Prepare new content
    // User provided:
    // Friday 12–11 PM
    // Saturday 12–11 PM
    // Sunday 12–10:30 PM
    // Monday 12–10:30 PM
    // Tuesday 12–10:30 PM
    // Wednesday 12–10:30 PM
    // Thursday 12–10:30 PM

    const newHoursString = "Sun-Thu: 12pm-10:30pm | Fri-Sat: 12pm-11pm";

    const updatedContent = {
        ...merchant.content,
        openingHours: {
            ...merchant.content.openingHours,
            specialHours: newHoursString,
            currentStatus: "Open Now", // Default status, optional logic could be real-time
            isOpen: true
        }
    };

    // 3. Update
    const { error: updateError } = await supabase
        .from('merchants')
        .update({ content: updatedContent })
        .eq('id', merchant.id);

    if (updateError) {
        console.error('Error updating merchant:', updateError);
    } else {
        console.log('Successfully updated hours!');
        console.log('New openingHours:', updatedContent.openingHours);
    }
}

main();
