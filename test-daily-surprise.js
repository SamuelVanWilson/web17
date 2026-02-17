const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qnbnatupljivkfrpfqbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYm5hdHVwbGppdmtmcnBmcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjUwNzEsImV4cCI6MjA4NjE0MTA3MX0.YAqCJn7iSd5gGteNl6s4uPqpnUXg3MJQIzm4aIHg53w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDailySupriseLogic() {
    console.log('🧪 Testing Daily Surprise Calendar Logic\n');

    const sessionId = 'session_1770613991111_g5ivzgj'; // Use your actual session ID

    // Test 1: Get game progress
    console.log('1️⃣ Getting game progress...');
    const { data: progress, error: progressError } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_session_id', sessionId)
        .single();

    if (progressError) {
        console.log('❌ Error:', progressError);
        return;
    }

    console.log('Progress data:', {
        firstLoginDate: progress.last_login_date,
        consecutiveDays: progress.consecutive_days,
        tickets: progress.tickets
    });

    // Test 2: Calculate days
    const today = new Date().toISOString().split('T')[0];
    const firstLoginDate = progress.last_login_date || today;
    const firstDate = new Date(firstLoginDate);
    const currentDate = new Date(today);
    const daysElapsed = Math.floor((currentDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const day = Math.min(Math.max(1, daysElapsed), 7);

    console.log('\n2️⃣ Date Calculation:');
    console.log('📅 First Login:', firstLoginDate);
    console.log('📅 Today:', today);
    console.log('📊 Days Elapsed:', daysElapsed);
    console.log('🎯 Current Day (capped):', day);

    // Test 3: Get scratch history
    console.log('\n3️⃣ Getting scratch history...');
    const { data: history, error: historyError } = await supabase
        .from('scratch_history')
        .select('*')
        .eq('user_session_id', sessionId)
        .order('day', { ascending: true });

    if (historyError) {
        console.log('❌ Error:', historyError);
        return;
    }

    console.log('Scratch History:');
    history.forEach(h => {
        console.log(`  - Day ${h.day}, Scratched on: ${h.scratched_at}`);
    });

    const scratchedToday = history.some(h => h.scratched_at === today);
    console.log('\n🔍 Scratched today?', scratchedToday ? '✅ YES' : '❌ NO');

    console.log('\n✅ Test complete!');
    console.log(`\n📝 Result: Should show Day ${day}/7 ${scratchedToday ? '(Already scratched)' : '(Available to scratch)'}`);
}

testDailySupriseLogic();
