// Simple script to check if we can read teams data
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://udirgtprghlseratvyho.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXJndHByZ2hsc2VyYXR2eWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjE4ODYsImV4cCI6MjA2MTkzNzg4Nn0.NWUyBq3awnClnMa5J3bRrMHLmJsEdRJnL_knyD7XcLk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkTeamsTable() {
  try {
    console.log('Testing read access to teams table...');
    
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error reading teams:', error);
      return;
    }
    
    console.log('Successfully read teams table');
    console.log('Teams found:', data.length);
    if (data.length > 0) {
      console.log('Sample data:', data[0]);
    }
    
  } catch (err) {
    console.error('Connection error:', err);
  }
}

checkTeamsTable();
