
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createAdminClient } from '@/lib/supabase/admin';

async function checkAnalytics() {
  const supabase = createAdminClient();
  const slug = 'honoo-ramen-bar'; // The merchant in the screenshot

  console.log(`Checking analytics for merchant slug: ${slug}`);

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (!merchant) {
    console.error('Merchant not found');
    return;
  }

  console.log(`Merchant ID: ${merchant.id}`);

  // Check page_views count
  const { count: totalViews } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id);

  console.log(`Total rows in 'page_views': ${totalViews}`);

  // Check recent views
  const { data: recentViews } = await supabase
    .from('page_views')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('viewed_at', { ascending: false })
    .limit(5);

  console.log('Recent 5 views:', recentViews);

  // Check landing_page_stats
  const { data: stats } = await supabase
    .from('landing_page_stats')
    .select('*')
    .eq('merchant_id', merchant.id)
    .single();

  console.log('Landing Page Stats Record:', stats);
}

checkAnalytics().catch(console.error);
