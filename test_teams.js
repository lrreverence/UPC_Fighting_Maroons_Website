// Test script to check if teams data exists in the database
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase URL and anon key
const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';

async function testTeams() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('Testing team data fetch...');
    
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .order('team_name');
    
    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }
    
    console.log('Teams found:', data.length);
    console.log('Teams data:', data);
    
    if (data.length === 0) {
      console.log('No teams found in database. You may need to insert some team data.');
    }
    
  } catch (err) {
    console.error('Connection error:', err);
  }
}

// Uncomment and run: node test_teams.js
// testTeams();

console.log('Please update the supabaseUrl and supabaseKey variables with your actual values, then uncomment the testTeams() call and run this script.');
