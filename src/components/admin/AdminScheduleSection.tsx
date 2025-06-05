import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

interface Game {
  id: string;
  date: string;
  time: string;
  opponent: string;
  location: string;
}

export default function AdminScheduleSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [newGame, setNewGame] = useState<Partial<Game>>({
    date: '',
    time: '',
    opponent: '',
    location: ''
  });

  const handleAddGame = () => {
    if (newGame.date && newGame.time && newGame.opponent && newGame.location) {
      const game: Game = {
        id: Date.now().toString(),
        ...newGame as Game
      };
      setGames([...games, game]);
      setNewGame({
        date: '',
        time: '',
        opponent: '',
        location: ''
      });
    }
  };

  const handleDeleteGame = (id: string) => {
    setGames(games.filter(game => game.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Game Schedule Management</h2>
      </div>

      <div className="grid gap-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Add New Game</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={newGame.date}
              onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={newGame.time}
              onChange={(e) => setNewGame({ ...newGame, time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opponent">Opponent</Label>
            <Input
              id="opponent"
              value={newGame.opponent}
              onChange={(e) => setNewGame({ ...newGame, opponent: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={newGame.location}
              onChange={(e) => setNewGame({ ...newGame, location: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleAddGame}>Add Game</Button>
      </div>

      <div className="grid gap-4">
        {games.map((game) => (
          <Card key={game.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{game.opponent}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGame(game.id)}
                >
                  Delete
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p>{new Date(game.date).toLocaleDateString()} at {game.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p>{game.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 