import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart as BarChartIcon, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface StatData {
  id: string;
  title: string;
  wins?: number;
  losses?: number;
  points?: number;
  medals?: number;
  records?: number;
  events?: number;
  top_performer: string;
}

const StatsPage = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newStat, setNewStat] = useState({
    title: "",
    wins: undefined,
    losses: undefined,
    points: undefined,
    medals: undefined,
    records: undefined,
    events: undefined,
    top_performer: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .order('title');

      if (error) {
        throw error;
      }

      setStats(data as StatData[]);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        variant: "destructive",
        title: "Error loading stats",
        description: "There was a problem loading the statistics."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [toast]);

  // Fix the insert statement by ensuring required fields are properly set
  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStat.title || !newStat.top_performer) {
      toast({
        title: "Error",
        description: "Title and Top Performer fields are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const statToSubmit = {
        title: newStat.title,
        wins: newStat.wins,
        losses: newStat.losses,
        points: newStat.points,
        medals: newStat.medals,
        records: newStat.records,
        events: newStat.events,
        top_performer: newStat.top_performer
      };

      const { data, error } = await supabase
        .from('stats')
        .insert([statToSubmit])
        .select();

      if (error) throw error;

      setStats([...(data as StatData[]), ...stats]);

      toast({
        title: "Success",
        description: "Stat added successfully.",
      });

      setNewStat({
        title: "",
        wins: undefined,
        losses: undefined,
        points: undefined,
        medals: undefined,
        records: undefined,
        events: undefined,
        top_performer: ""
      });

      setOpen(false);
      fetchStats();
    } catch (error) {
      console.error('Error adding stat:', error);
      toast({
        variant: "destructive",
        title: "Error adding stat",
        description: "There was a problem adding the statistic."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <BarChartIcon className="h-8 w-8 text-forest" />
          <h1 className="text-3xl font-bold text-forest">Team Statistics</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-forest hover:bg-forest-dark">
              <Plus className="mr-2 h-4 w-4" /> Add Stat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Statistic</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStat} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newStat.title}
                  onChange={(e) => setNewStat({ ...newStat, title: e.target.value })}
                  placeholder="Statistic Title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="top_performer">Top Performer</Label>
                <Input
                  id="top_performer"
                  value={newStat.top_performer}
                  onChange={(e) => setNewStat({ ...newStat, top_performer: e.target.value })}
                  placeholder="Top Performer"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="wins">Wins</Label>
                <Input
                  type="number"
                  id="wins"
                  value={newStat.wins === undefined ? '' : newStat.wins.toString()}
                  onChange={(e) => setNewStat({ ...newStat, wins: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Wins"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="losses">Losses</Label>
                <Input
                  type="number"
                  id="losses"
                  value={newStat.losses === undefined ? '' : newStat.losses.toString()}
                  onChange={(e) => setNewStat({ ...newStat, losses: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Losses"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  type="number"
                  id="points"
                  value={newStat.points === undefined ? '' : newStat.points.toString()}
                  onChange={(e) => setNewStat({ ...newStat, points: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Points"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="medals">Medals</Label>
                <Input
                  type="number"
                  id="medals"
                  value={newStat.medals === undefined ? '' : newStat.medals.toString()}
                  onChange={(e) => setNewStat({ ...newStat, medals: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Medals"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="records">Records</Label>
                <Input
                  type="number"
                  id="records"
                  value={newStat.records === undefined ? '' : newStat.records.toString()}
                  onChange={(e) => setNewStat({ ...newStat, records: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Records"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="events">Events</Label>
                <Input
                  type="number"
                  id="events"
                  value={newStat.events === undefined ? '' : newStat.events.toString()}
                  onChange={(e) => setNewStat({ ...newStat, events: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Events"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-forest hover:bg-forest-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Stat"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-forest" />
        </div>
      ) : stats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.id} className="stats-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-forest mb-4">{stat.title}</h3>
                <div className="space-y-3">
                  {stat.wins !== null && stat.losses !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Win-Loss:</span>
                      <span className="font-semibold">{stat.wins}-{stat.losses}</span>
                    </div>
                  )}

                  {stat.points !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Points:</span>
                      <span className="font-semibold">{stat.points}</span>
                    </div>
                  )}

                  {stat.medals !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medals:</span>
                      <span className="font-semibold">{stat.medals}</span>
                    </div>
                  )}

                  {stat.records !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Records Broken:</span>
                      <span className="font-semibold">{stat.records}</span>
                    </div>
                  )}

                  {stat.events !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Events:</span>
                      <span className="font-semibold">{stat.events}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Top Performer:</span>
                    <span className="font-semibold">{stat.top_performer}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No statistics available.</p>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
