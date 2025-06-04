// Script to insert sample team data into Supabase
// Run this with: node --loader @esbuild-kit/esm-loader insert_sample_teams.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://udirgtprghlseratvyho.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXJndHByZ2hsc2VyYXR2eWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjE4ODYsImV4cCI6MjA2MTkzNzg4Nn0.NWUyBq3awnClnMa5J3bRrMHLmJsEdRJnL_knyD7XcLk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const sampleTeams = [
  {
    team_id: 'BBL001',
    team_name: 'UPC Fighting Maroons Basketball',
    sport: 'Basketball',
    coach_name: 'Coach Rodriguez'
  },
  {
    team_id: 'VBL001',
    team_name: 'UPC Fighting Maroons Volleyball',
    sport: 'Volleyball',
    coach_name: 'Coach Santos'
  },
  {
    team_id: 'TBL001',
    team_name: 'UPC Fighting Maroons Table Tennis',
    sport: 'Table Tennis',
    coach_name: 'Coach Dela Cruz'
  },
  {
    team_id: 'CHE001',
    team_name: 'UPC Fighting Maroons Chess',
    sport: 'Chess',
    coach_name: 'Coach Garcia'
  },
  {
    team_id: 'BAD001',
    team_name: 'UPC Fighting Maroons Badminton',
    sport: 'Badminton',
    coach_name: 'Coach Reyes'
  },
  {
    team_id: 'SWM001',
    team_name: 'UPC Fighting Maroons Swimming',
    sport: 'Swimming',
    coach_name: 'Coach Torres'
  },
  {
    team_id: 'TRK001',
    team_name: 'UPC Fighting Maroons Track and Field',
    sport: 'Track and Field',
    coach_name: 'Coach Mendoza'
  }
];

async function insertSampleTeams() {
  try {
    console.log('Checking for existing teams...');
    
    // First check if teams already exist
    const { data: existingTeams, error: selectError } = await supabase
      .from('team')
      .select('team_id, team_name');
    
    if (selectError) {
      console.error('Error checking existing teams:', selectError);
      return;
    }
    
    if (existingTeams && existingTeams.length > 0) {
      console.log(`Found ${existingTeams.length} existing teams:`);
      existingTeams.forEach(team => console.log(`- ${team.team_name} (${team.team_id})`));
      console.log('Skipping insertion as teams already exist.');
      return;
    }
    
    console.log('No teams found. Inserting sample teams...');
    
    // Insert sample teams
    const { data, error } = await supabase
      .from('team')
      .insert(sampleTeams)
      .select();
    
    if (error) {
      console.error('Error inserting teams:', error);
      return;
    }
    
    console.log(`Successfully inserted ${data.length} teams:`);
    data.forEach(team => console.log(`- ${team.team_name} (${team.team_id})`));
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

// Run the function
insertSampleTeams().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
