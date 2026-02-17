const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qnbnatupljivkfrpfqbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYm5hdHVwbGppdmtmcnBmcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjUwNzEsImV4cCI6MjA4NjE0MTA3MX0.YAqCJn7iSd5gGteNl6s4uPqpnUXg3MJQIzm4aIHg53w';

async function checkTableStructure() {
    console.log('🔍 Checking memory_match_scores table structure...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Try to fetch existing records to see structure
        const { data, error } = await supabase
            .from('memory_match_scores')
            .select('*')
            .limit(5);

        if (error) {
            console.log('❌ Error fetching:', error);
            return;
        }

        console.log('📊 Sample records:', JSON.stringify(data, null, 2));

        if (data && data.length > 0) {
            console.log('\n🔑 Table columns:', Object.keys(data[0]));
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err);
    }
}

checkTableStructure();
