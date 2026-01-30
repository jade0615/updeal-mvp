
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getCustomers } from '@/actions/customers';

async function testFetch() {
    console.log('Testing getCustomers...');
    try {
        const result = await getCustomers({ page: 1, limit: 10 });
        if (result.success) {
            console.log('Success!');
            console.log(`Total: ${result.total}`);
            if (result.customers && result.customers.length > 0) {
                console.log('First customer:', JSON.stringify(result.customers[0], null, 2));
            }
        } else {
            console.error('Failed:', result.error);
        }
    } catch (e) {
        console.error('Crash:', e);
    }
}

testFetch();
