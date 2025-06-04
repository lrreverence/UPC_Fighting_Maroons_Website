# Automatic Team Statistics Tracking Implementation

## Overview
This implementation provides automatic tracking of team wins and losses based on game results. The system automatically calculates and updates team statistics in the `stats` table when a game status changes to "Win" or "Loss".

## Implementation Details

### Database Structure
- **`game` table**: Contains game records with `game_status` field
- **`stats` table**: Contains team statistics with `wins` and `losses` fields
- **Foreign key relationship**: `stats.team_id` references `team.team_id`

### Core Functionality

#### `updateTeamStatistics` Function
Located in: `src/pages/FullSchedule.tsx` (inside the `FullSchedule` React component)

**Purpose**: Automatically calculates and updates team win/loss statistics based on game results.

**How it works**:
1. **Query Game Results**: Counts all games for a specific team where `game_status` is "Win" or "Loss"
2. **Check Existing Stats**: Looks for existing statistics record for the team
3. **Update or Create**: Either updates existing stats or creates a new record with calculated wins/losses
4. **Error Handling**: Catches errors to prevent disrupting the game update flow

**Code Structure**:
```typescript
const updateTeamStatistics = async (teamId: string) => {
  try {
    // Count wins and losses from game table
    const { data: games, error: gamesError } = await supabase
      .from('game')
      .select('game_status')
      .eq('team_id', teamId);

    const wins = games?.filter(game => game.game_status === 'Win').length || 0;
    const losses = games?.filter(game => game.game_status === 'Loss').length || 0;

    // Check if stats record exists
    const { data: existingStats, error: statsCheckError } = await supabase
      .from('stats')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (existingStats) {
      // Update existing record
      await supabase
        .from('stats')
        .update({ wins, losses })
        .eq('team_id', teamId);
    } else {
      // Create new record
      await supabase
        .from('stats')
        .insert({ team_id: teamId, wins, losses });
    }
  } catch (error) {
    console.error('Error updating team statistics:', error);
    // Don't throw to avoid disrupting game updates
  }
};
```

### Integration with Game Updates

The statistics update is triggered in the `handleUpdateGame` function when:

1. **Status changes from non-result to result**: When a game status changes from any status (Scheduled, In Progress, etc.) to Win or Loss
2. **Status changes from one result to another**: When changing from Win to Loss or vice versa
3. **Status changes from result to non-result**: When changing from Win/Loss back to another status

**Trigger Logic**:
```typescript
// Update team statistics if game status changed to Win or Loss
const previousStatus = editingGame.game_status;
const newStatus = updateData.game_status || previousStatus;

if ((newStatus === 'Win' || newStatus === 'Loss') && 
    (previousStatus !== 'Win' && previousStatus !== 'Loss')) {
  // Status changed from non-result to result - update statistics
  await updateTeamStatistics(values.team_id);
} else if ((previousStatus === 'Win' || previousStatus === 'Loss') && 
           (newStatus === 'Win' || newStatus === 'Loss') && 
           previousStatus !== newStatus) {
  // Status changed from one result to another - update statistics
  await updateTeamStatistics(values.team_id);
} else if ((previousStatus === 'Win' || previousStatus === 'Loss') && 
           (newStatus !== 'Win' && newStatus !== 'Loss')) {
  // Status changed from result to non-result - update statistics
  await updateTeamStatistics(values.team_id);
}
```

## Benefits

1. **Automatic Updates**: No manual intervention required to maintain accurate statistics
2. **Real-time Accuracy**: Statistics are updated immediately when game results change
3. **Data Consistency**: All win/loss calculations are based on actual game records
4. **Error Resilience**: Statistics update failures don't disrupt game management
5. **Retroactive Calculation**: Recalculates from all games, ensuring accuracy even if previous updates failed

## Usage

1. **Update Game Status**: When updating a game in the schedule, change the status to "Win" or "Loss"
2. **Automatic Processing**: The system automatically recalculates and updates team statistics
3. **View Statistics**: Updated statistics can be viewed in the stats section of the application

## Testing

To test the functionality:

1. Create a game for a team
2. Update the game status to "Win"
3. Check the stats table - should show 1 win for that team
4. Update the same game status to "Loss"
5. Check the stats table - should show 1 loss, 0 wins for that team
6. Update the game status to "Scheduled"
7. Check the stats table - should show 0 wins, 0 losses for that team

## Future Enhancements

- **Additional Statistics**: Track more metrics like total games played, points scored, etc.
- **Historical Tracking**: Maintain history of statistics changes
- **Batch Updates**: Process multiple games simultaneously for better performance
- **Statistics Dashboard**: Enhanced visualization of team performance trends
