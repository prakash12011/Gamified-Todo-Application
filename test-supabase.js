const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqsfhnmpknusoffnjcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxc2Zobm1wa251c29mZm5qY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzQyMzcsImV4cCI6MjA3Mjc1MDIzN30.FgJYOg2mI8jxR_Iowpj6YvF_3xxQLNVDxFnNRnV0raE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('✅ Connection successful!');
      console.log('Tables accessible:', data !== null);
    }
  } catch (err) {
    console.error('❌ Failed to connect:', err.message);
  }
}

testConnection();
