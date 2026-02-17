const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qnbnatupljivkfrpfqbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYm5hdHVwbGppdmtmcnBmcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjUwNzEsImV4cCI6MjA4NjE0MTA3MX0.YAqCJn7iSd5gGteNl6s4uPqpnUXg3MJQIzm4aIHg53w';

async function fixTableSchema() {
    console.log('🔧 Fixing memory_match_scores table schema...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Step 1: Get existing data
        console.log('1️⃣ Fetching existing data...');
        const { data: existingData, error: fetchError } = await supabase
            .from('memory_match_scores')
            .select('*');

        if (fetchError) {
            console.log('❌ Fetch error:', fetchError);
            return;
        }

        console.log(`   Found ${existingData.length} existing records`);
        console.log('   Data:', JSON.stringify(existingData, null, 2));

        // Step 2: Drop the old table (be careful!)
        console.log('\n2️⃣ Dropping old table...');
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: 'DROP TABLE IF EXISTS memory_match_scores CASCADE;'
        });

        if (dropError) {
            console.log('❌ Drop error:', dropError);
            console.log('   ℹ️  You may need to do this manually in Supabase dashboard');
            console.log('   Go to SQL Editor and run:');
            console.log('   DROP TABLE IF EXISTS memory_match_scores CASCADE;');
            return;
        }

        console.log('   ✅ Table dropped');

        // Step 3: Create new table with correct schema
        console.log('\n3️⃣ Creating new table with ID column...');
        const createTableSQL = `
            CREATE TABLE memory_match_scores (
                id BIGSERIAL PRIMARY KEY,
                user_session_id TEXT NOT NULL,
                moves INTEGER NOT NULL,
                time_seconds INTEGER NOT NULL,
                completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX idx_memory_match_session ON memory_match_scores(user_session_id);
        `;

        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: createTableSQL
        });

        if (createError) {
            console.log('❌ Create error:', createError);
            console.log('   ℹ️  You may need to do this manually in Supabase dashboard');
            console.log('   Go to SQL Editor and run:');
            console.log(createTableSQL);
            return;
        }

        console.log('   ✅ New table created with auto-increment ID');

        // Step 4: Restore data
        if (existingData.length > 0) {
            console.log('\n4️⃣ Restoring existing data...');
            const { error: insertError } = await supabase
                .from('memory_match_scores')
                .insert(existingData);

            if (insertError) {
                console.log('❌ Insert error:', insertError);
            } else {
                console.log(`   ✅ Restored ${existingData.length} records`);
            }
        }

        console.log('\n✅ Schema fix complete!');

    } catch (err) {
        console.log('❌ Unexpected error:', err);
    }
}

fixTableSchema();
