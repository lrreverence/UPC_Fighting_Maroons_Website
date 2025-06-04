import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjqbzybpfxhgwdkxcgzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcWJ6eWJwZnhoZ3dka3hjZ3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNzc3ODQsImV4cCI6MjA0ODk1Mzc4NH0.XdLW9bQpbOKnyN9aPCL5-BSp9BxW97TqjRvVVGFvMgg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSports() {
  try {
    console.log('Checking available sports in the database...');
    
    // Check what sports are in the team table
    const { data: teams, error: teamsError } = await supabase
      .from('team')
      .select('sport')
      .order('sport');
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return;
    }
    
    // Get unique sports
    const uniqueSports = [...new Set(teams.map(team => team.sport))].filter(Boolean);
    
    console.log('Available sports:', uniqueSports);
    console.log('Total unique sports:', uniqueSports.length);
    
    // Also check all teams to see the data structure
    const { data: allTeams, error: allTeamsError } = await supabase
      .from('team')
      .select('team_id, team_name, sport')
      .order('sport, team_name');
    
    if (!allTeamsError) {
      console.log('\nAll teams:');
      allTeams.forEach(team => {
        console.log(`- ${team.team_name} (${team.sport}) - ID: ${team.team_id}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSports();
