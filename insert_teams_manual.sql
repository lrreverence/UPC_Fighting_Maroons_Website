-- SQL script to insert sample team data
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS for team table (if needed)
-- ALTER TABLE team DISABLE ROW LEVEL SECURITY;

-- Insert sample team data
INSERT INTO team (team_id, team_name, sport, coach_name) VALUES 
('BBL001', 'UPC Fighting Maroons Basketball', 'Basketball', 'Coach Rodriguez'),
('VBL001', 'UPC Fighting Maroons Volleyball', 'Volleyball', 'Coach Santos'),
('TBL001', 'UPC Fighting Maroons Table Tennis', 'Table Tennis', 'Coach Dela Cruz'),
('CHE001', 'UPC Fighting Maroons Chess', 'Chess', 'Coach Garcia'),
('BAD001', 'UPC Fighting Maroons Badminton', 'Badminton', 'Coach Reyes'),
('SWM001', 'UPC Fighting Maroons Swimming', 'Swimming', 'Coach Torres'),
('TRK001', 'UPC Fighting Maroons Track and Field', 'Track and Field', 'Coach Mendoza')
ON CONFLICT (team_id) DO NOTHING;

-- Re-enable RLS for team table (if it was disabled)
-- ALTER TABLE team ENABLE ROW LEVEL SECURITY;

-- Verify the data was inserted
SELECT * FROM team ORDER BY team_name;
