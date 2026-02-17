const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = 'https://qnbnatupljivkfrpfqbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYm5hdHVwbGppdmtmcnBmcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjUwNzEsImV4cCI6MjA4NjE0MTA3MX0.YAqCJn7iSd5gGteNl6s4uPqpnUXg3MJQIzm4aIHg53w';

async function testInsert() {
    console.log('🔧 Testing Supabase INSERT operation...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);
    const testSessionId = `test_session_${Date.now()}`;

    try {
        console.log('📝 Attempting to insert into game_progress...');
        console.log('Session ID:', testSessionId);

        const { data, error } = await supabase
            .from('game_progress')
            .insert({
                user_session_id: testSessionId,
                tickets: 7,
                last_login_date: new Date().toISOString().split('T')[0],
                consecutive_days: 1,
            })
            .select()
            .single();

        if (error) {
            console.log('❌ INSERT FAILED');
            console.log('Error message:', error.message);
            console.log('Error code:', error.code);
            console.log('Error details:', error.details);
            console.log('Error hint:', error.hint);
            console.log('\nFull error object:', JSON.stringify(error, null, 2));
            return;
        }

        console.log('✅ INSERT SUCCESS!');
        console.log('Data inserted:', JSON.stringify(data, null, 2));

        // Try to fetch it back
        console.log('\n📖 Fetching back the data...');
        const { data: fetchData, error: fetchError } = await supabase
            .from('game_progress')
            .select('*')
            .eq('user_session_id', testSessionId)
            .single();

        if (fetchError) {
            console.log('❌ FETCH FAILED:', fetchError.message);
        } else {
            console.log('✅ FETCH SUCCESS:', JSON.stringify(fetchData, null, 2));
        }

    } catch (err) {
        console.log('❌ UNEXPECTED ERROR:', err);
    }
}

testInsert();
