import { createClient } from '@supabase/supabase-js'

// This script adds the missing stat_description column to the game table
const supabaseUrl = 'https://udirgtprghlseratvyho.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXJndHByZ2hsc2VyYXR2eWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMDU5NTksImV4cCI6MjA0ODg4MTk1OX0.zYUbCx2xqEBpIvJ1rFcz9b34yO7bKBBqKGjb6QKCGAw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addStatDescriptionColumn() {
  try {
    console.log('Adding stat_description column to game table...')
    
    // Note: This requires service role key to modify schema
    // For now, let's just test the current schema
    const { data, error } = await supabase
      .from('game')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error checking game table:', error)
      return
    }
    
    console.log('Current game table columns:', Object.keys(data[0] || {}))
    
    // Check if stat_description column exists
    if (data[0] && 'stat_description' in data[0]) {
      console.log('✅ stat_description column already exists!')
    } else {
      console.log('❌ stat_description column is missing!')
      console.log('Please add this column manually in the Supabase dashboard:')
      console.log('ALTER TABLE game ADD COLUMN stat_description TEXT;')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addStatDescriptionColumn()
