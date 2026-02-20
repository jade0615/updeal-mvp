const { execSync } = require('child_process');

// Target time: 11:00 PM China Time (UTC+8) on Feb 17, 2026
// In UTC: 3:00 PM on Feb 17, 2026
const targetTime = new Date('2026-02-17T23:00:00+08:00');

console.log(`⏰ Scheduler started.`);
console.log(`Target Time (China): ${targetTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
console.log(`Target Time (Local): ${targetTime.toLocaleString()}`);

function check() {
    const now = new Date();
    const diff = targetTime - now;

    if (diff <= 0) {
        console.log(`\n🚀 It's time! Executing email script...`);
        try {
            // Un-dry-run for the actual scheduled send
            execSync('node scripts/send-honoo-emails.js', { stdio: 'inherit' });
            console.log(`\n✅ Email campaign execution finished.`);
        } catch (e) {
            console.error(`\n❌ Execution failed:`, e.message);
        }
        process.exit(0);
    } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        process.stdout.write(`\r⏳ Waiting... Countdown: ${hours}h ${mins}m ${secs}s    `);
        setTimeout(check, 1000);
    }
}

check();
