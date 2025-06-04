-- Add stat_description column to game table
ALTER TABLE game ADD COLUMN stat_description TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN game.stat_description IS 'Game statistics and description, used for storing game summary, final scores, or other game-related information';
