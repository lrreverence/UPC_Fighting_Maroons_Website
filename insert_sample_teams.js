// Sample team data insertion script
// This script will insert sample teams into the database

import { supabase } from './src/integrations/supabase/client.js';

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
  }
];

async function insertSampleTeams() {
  try {
    console.log('Inserting sample teams...');
    
    // First, check if teams already exist
    const { data: existingTeams, error: selectError } = await supabase
      .from('team')
      .select('team_id');
    
    if (selectError) {
      console.error('Error checking existing teams:', selectError);
      return;
    }
    
    if (existingTeams && existingTeams.length > 0) {
      console.log('Teams already exist in database:', existingTeams.length, 'teams found');
      return;
    }
    
    // Insert sample teams
    const { data, error } = await supabase
      .from('team')
      .insert(sampleTeams)
      .select();
    
    if (error) {
      console.error('Error inserting teams:', error);
      return;
    }
    
    console.log('Successfully inserted sample teams:', data);
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

// Run the function
insertSampleTeams();
