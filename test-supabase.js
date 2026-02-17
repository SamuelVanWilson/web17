const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = 'https://qnbnatupljivkfrpfqbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYm5hdHVwbGppdmtmcnBmcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjUwNzEsImV4cCI6MjA4NjE0MTA3MX0.YAqCJn7iSd5gGteNl6s4uPqpnUXg3MJQIzm4aIHg53w';

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey.substring(0, 30) + '...\n');

    try {
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('✅ Supabase client created successfully\n');

        // Test with ACTUAL SELECT queries to get real errors
        console.log('� Checking available tables with actual queries...\n');
        const tablesToCheck = ['quiz_scores', 'users', 'memories', 'progress', 'tickets', 'unlocks'];

        for (const table of tablesToCheck) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (!error) {
                console.log(`  ✅ ${table} - TABLE EXISTS (${data.length} rows fetched)`);
            } else {
                console.log(`  ❌ ${table} - ERROR: ${error.message}`);
                if (error.code) {
                    console.log(`     Code: ${error.code}`);
                }
                if (error.hint) {
                    console.log(`     Hint: ${error.hint}`);
                }
            }
        }

        console.log('\n🎉 Test completed!');

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
        console.log('\nFull error:', err);
    }
}

testConnection();
