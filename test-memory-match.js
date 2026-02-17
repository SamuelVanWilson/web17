const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = 'https://qnbnatupljivkfrpfqbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYm5hdHVwbGppdmtmcnBmcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjUwNzEsImV4cCI6MjA4NjE0MTA3MX0.YAqCJn7iSd5gGteNl6s4uPqpnUXg3MJQIzm4aIHg53w';

async function testMemoryMatchTable() {
    console.log('🔧 Testing memory_match_scores table...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);
    const testSessionId = `test_session_${Date.now()}`;

    try {
        console.log('📝 Attempting to insert into memory_match_scores...');
        console.log('Session ID:', testSessionId);

        const { data, error } = await supabase
            .from('memory_match_scores')
            .insert({
                user_session_id: testSessionId,
                moves: 10,
                time_seconds: 45,
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

            if (error.code === '42P01') {
                console.log('\n⚠️  Table does not exist! Need to create memory_match_scores table.');
            }
            return;
        }

        console.log('✅ INSERT SUCCESS!');
        console.log('Data inserted:', JSON.stringify(data, null, 2));

    } catch (err) {
        console.log('❌ UNEXPECTED ERROR:', err);
    }
}

testMemoryMatchTable();
