import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Stat {
  id: string;
  sport: string;
  category: string;
  value: string;
}

export default function AdminStatsSection() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [newStat, setNewStat] = useState<Partial<Stat>>({
    sport: '',
    category: '',
    value: ''
  });

  const handleAddStat = () => {
    if (newStat.sport && newStat.category && newStat.value) {
      const stat: Stat = {
        id: Date.now().toString(),
        ...newStat as Stat
      };
      setStats([...stats, stat]);
      setNewStat({
        sport: '',
        category: '',
        value: ''
      });
    }
  };

  const handleDeleteStat = (id: string) => {
    setStats(stats.filter(stat => stat.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistics Management</h2>
      </div>

      <div className="grid gap-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Add New Statistic</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select
              value={newStat.sport}
              onValueChange={(value) => setNewStat({ ...newStat, sport: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="soccer">Soccer</SelectItem>
                <SelectItem value="volleyball">Volleyball</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={newStat.category}
              onChange={(e) => setNewStat({ ...newStat, category: e.target.value })}
              placeholder="e.g., Points, Assists, Goals"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={newStat.value}
              onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
              placeholder="e.g., 25, 10, 5"
            />
          </div>
        </div>
        <Button onClick={handleAddStat}>Add Statistic</Button>
      </div>

      <div className="grid gap-4">
        {stats.map((stat) => (
          <Card key={stat.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="capitalize">{stat.sport} - {stat.category}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteStat(stat.id)}
                >
                  Delete
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-gray-500">Value</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 