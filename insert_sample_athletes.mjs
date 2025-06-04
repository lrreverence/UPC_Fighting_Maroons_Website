// Script to insert sample athlete data for testing
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://udirgtprghlseratvyho.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXJndHByZ2hsc2VyYXR2eWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjE4ODYsImV4cCI6MjA2MTkzNzg4Nn0.NWUyBq3awnClnMa5J3bRrMHLmJsEdRJnL_knyD7XcLk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const sampleAthletes = [
  {
    student_id: 2023001,
    fname: 'Juan',
    mname: 'Miguel',
    lname: 'Cruz',
    team_id: 'ATHL',
    birthdate: '2003-05-15',
    email: 'juan.cruz@upc.edu.ph',
    department: 'Computer Science',
    course: 'BSCS',
    year_level: 2
  },
  {
    student_id: 2023002,
    fname: 'Maria',
    mname: 'Santos',
    lname: 'Garcia',
    team_id: 'ATHL',
    birthdate: '2003-08-22',
    email: 'maria.garcia@upc.edu.ph',
    department: 'Computer Science',
    course: 'BSCS',
    year_level: 2
  },
  {
    student_id: 2023003,
    fname: 'Carlos',
    mname: 'Jose',
    lname: 'Reyes',
    team_id: 'ATHL',
    birthdate: '2002-12-10',
    email: 'carlos.reyes@upc.edu.ph',
    department: 'Engineering',
    course: 'BSCE',
    year_level: 3
  },
  {
    student_id: 2023004,
    fname: 'Ana',
    mname: 'Rose',
    lname: 'Dela Cruz',
    team_id: 'BBAL',
    birthdate: '2003-03-18',
    email: 'ana.delacruz@upc.edu.ph',
    department: 'Business',
    course: 'BSBA',
    year_level: 2
  },
  {
    student_id: 2023005,
    fname: 'Miguel',
    mname: 'Angel',
    lname: 'Torres',
    team_id: 'BBAL',
    birthdate: '2002-07-25',
    email: 'miguel.torres@upc.edu.ph',
    department: 'Computer Science',
    course: 'BSIT',
    year_level: 3
  },
  {
    student_id: 2023006,
    fname: 'Sofia',
    mname: 'Mae',
    lname: 'Villanueva',
    team_id: 'BBAL',
    birthdate: '2003-11-03',
    email: 'sofia.villanueva@upc.edu.ph',
    department: 'Education',
    course: 'BEED',
    year_level: 2
  }
];

async function insertSampleAthletes() {
  try {
    console.log('Checking existing athletes...');
    
    // First, check if athletes already exist
    const { data: existingAthletes, error: selectError } = await supabase
      .from('athlete')
      .select('student_id')
      .limit(5);
    
    if (selectError) {
      console.error('Error checking existing athletes:', selectError);
      return;
    }
    
    if (existingAthletes && existingAthletes.length > 0) {
      console.log('Athletes already exist in database:', existingAthletes.length, 'athletes found');
      console.log('Sample athletes:', existingAthletes);
      return;
    }
    
    console.log('Inserting sample athletes...');
    
    // Insert sample athletes
    const { data, error } = await supabase
      .from('athlete')
      .insert(sampleAthletes)
      .select();
    
    if (error) {
      console.error('Error inserting athletes:', error);
      return;
    }
    
    console.log('Successfully inserted sample athletes:', data.length);
    console.log('Sample athletes:', data);
    
  } catch (err) {
    console.error('Connection error:', err);
  }
}

insertSampleAthletes();
