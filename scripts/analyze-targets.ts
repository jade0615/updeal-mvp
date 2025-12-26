
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'csv-parse/sync';

const CSV_PATH = '会员管理-202512221125342220.csv';

async function analyze() {
    console.log(`📊 Analyzing target list from: ${CSV_PATH}\n`);

    try {
        const fileContent = readFileSync(resolve(process.cwd(), '../', CSV_PATH), 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true
        });

        console.log(`Total Rows in CSV: ${records.length}`);

        const validTargets: string[] = [];
        const invalidTargets: any[] = [];

        records.forEach((row: any, index: number) => {
            const rawPhone = row['手机号码']; // Assuming second column based on header
            const name = row['昵称'] || 'Customer';

            if (!rawPhone) {
                invalidTargets.push({ row: index + 2, reason: 'Empty phone', val: rawPhone });
                return;
            }

            // Clean phone: remove all non-digits
            const digits = rawPhone.replace(/\D/g, '');

            let cleanPhone = null;

            // Logic for US numbers
            if (digits.length === 10) {
                cleanPhone = `+1${digits}`;
            } else if (digits.length === 11 && digits.startsWith('1')) {
                cleanPhone = `+${digits}`;
            } else {
                // Invalid length
                invalidTargets.push({ row: index + 2, reason: `Invalid length (${digits.length})`, val: rawPhone });
                return;
            }

            validTargets.push(cleanPhone);
        });

        console.log(`\n✅ Valid Targets: ${validTargets.length}`);
        console.log(`❌ Invalid Targets: ${invalidTargets.length}`);

        if (invalidTargets.length > 0) {
            console.log('\n--- Sample Invalid Entries (First 10) ---');
            invalidTargets.slice(0, 10).forEach(item => {
                console.log(`Row ${item.row}: ${item.val} (${item.reason})`);
            });
        }

        console.log(`\nReady to send to ${validTargets.length} recipients.`);

    } catch (error) {
        console.error('Error reading CSV:', error);
    }
}

analyze();
