-- SQL script to delete the sample teams that were generated
-- Run this in your Supabase SQL Editor

-- Delete the specific sample teams by their team_id
DELETE FROM team WHERE team_id IN (
  'BBL001',
  'VBL001', 
  'TBL001',
  'CHE001',
  'BAD001',
  'SWM001',
  'TRK001'
);

-- Verify the teams were deleted
SELECT * FROM team ORDER BY team_name;

-- Alternative: Delete all teams with 'UPC Fighting Maroons' in the name
-- DELETE FROM team WHERE team_name LIKE '%UPC Fighting Maroons%';

-- Alternative: Delete all teams (use with caution!)
-- DELETE FROM team;
