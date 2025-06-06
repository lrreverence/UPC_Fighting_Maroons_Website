import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart as BarChartIcon, Loader2, Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface StatData {
  team_id: string;
  team_name?: string; // Keep for display purposes
  top_performer?: string;
  wins?: number;
  losses?: number;
  points?: number;
  medals?: number;
  records?: number;
  events?: number;
}

interface Team {
  team_id: string;
  team_name: string;
  sport: string;
}

const StatsPage = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStat, setNewStat] = useState({
    team_id: "",
    wins: undefined,
    losses: undefined,
    points: undefined,
    medals: undefined,
    records: undefined,
    events: undefined,
    top_performer: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('team_id, team_name, sport')
        .order('team_name');

      if (error) throw error;
      setTeams(data as Team[]);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stats')
        .select(`
          *,
          team:team_id (
            team_name
          )
        `)
        .order('team_id');

      if (error) throw error;
      
      // Transform data to include team_name
      const transformedStats = data?.map((stat: any) => ({
        ...stat,
        team_name: stat.team?.team_name
      })) || [];
      
      setStats(transformedStats);
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
    fetchTeams();
    fetchStats();
  }, []);

  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStat.team_id) {
      toast({
        title: "Error",
        description: "Team selection is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const statToSubmit = {
        team_id: newStat.team_id,
        wins: newStat.wins === undefined ? null : newStat.wins,
        losses: newStat.losses === undefined ? null : newStat.losses,
        points: newStat.points === undefined ? null : newStat.points,
        medals: newStat.medals === undefined ? null : newStat.medals,
        records: newStat.records === undefined ? null : newStat.records,
        events: newStat.events === undefined ? null : newStat.events,
        top_performer: newStat.top_performer === "" ? null : newStat.top_performer
      };

      // Check if stats already exist for this team
      const { data: existingStats, error: checkError } = await supabase
        .from('stats')
        .select('*')
        .eq('team_id', newStat.team_id)
        .single();

      let result;
      if (existingStats) {
        // Update existing stats
        result = await supabase
          .from('stats')
          .update(statToSubmit)
          .eq('team_id', newStat.team_id)
          .select();
      } else {
        // Insert new stats
        result = await supabase
          .from('stats')
          .insert([statToSubmit])
          .select();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: existingStats ? "Stats updated successfully." : "Stats added successfully.",
      });

      setNewStat({
        team_id: "",
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
      console.error('Error adding/updating stat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving the statistics."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteStat = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this stat?")) return;

    try {
      const { error } = await supabase
        .from('stats')
        .delete()
        .eq('team_id', teamId);
      
      if (error) throw error;
      
      setStats(stats.filter(stat => stat.team_id !== teamId));
      
      toast({
        title: "Success",
        description: "Stat deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting stat:", error);
      toast({
        title: "Error",
        description: "Failed to delete stat.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (stat: StatData) => {
    setIsEditing(true);
    setNewStat({
      team_id: stat.team_id,
      wins: stat.wins ?? undefined,
      losses: stat.losses ?? undefined,
      points: stat.points ?? undefined,
      medals: stat.medals ?? undefined,
      records: stat.records ?? undefined,
      events: stat.events ?? undefined,
      top_performer: stat.top_performer ?? ""
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setIsEditing(false);
      setNewStat({
        team_id: "",
        wins: undefined,
        losses: undefined,
        points: undefined,
        medals: undefined,
        records: undefined,
        events: undefined,
        top_performer: ""
      });
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <BarChartIcon className="h-8 w-8 text-forest" />
          <h1 className="text-3xl font-maroons-strong text-forest">Team Statistics</h1>
        </div>

        <Button 
          className="bg-forest hover:bg-forest-dark"
          onClick={() => {
            setIsEditing(false);
            setNewStat({
              team_id: "",
              wins: undefined,
              losses: undefined,
              points: undefined,
              medals: undefined,
              records: undefined,
              events: undefined,
              top_performer: ""
            });
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Stat
        </Button>

        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Statistics" : "Add New Statistic"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStat} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="team_id">Team</Label>
                <Select 
                  value={newStat.team_id} 
                  onValueChange={(value) => setNewStat({ ...newStat, team_id: value })}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="top_performer">Top Performer</Label>
                <Input
                  id="top_performer"
                  value={newStat.top_performer}
                  onChange={(e) => setNewStat({ ...newStat, top_performer: e.target.value })}
                  placeholder="Top Performer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-forest hover:bg-forest-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Stat"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.team_id} className="relative h-full">
              <CardContent className="p-6 h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-forest font-maroons-strong">{stat.team_name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(stat)}
                      className="text-forest hover:text-forest-dark"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStat(stat.team_id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {stat.wins !== null && stat.losses !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-maroons-strong">Win-Loss:</span>
                      <span className="font-maroons-strong">{stat.wins}-{stat.losses}</span>
                    </div>
                  )}

                  {stat.points !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-maroons-strong">Total Points:</span>
                      <span className="font-maroons-strong">{stat.points}</span>
                    </div>
                  )}

                  {stat.medals !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-maroons-strong">Medals:</span>
                      <span className="font-maroons-strong">{stat.medals}</span>
                    </div>
                  )}

                  {stat.records !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-maroons-strong">Records Broken:</span>
                      <span className="font-maroons-strong">{stat.records}</span>
                    </div>
                  )}

                  {stat.events !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-maroons-strong">Events:</span>
                      <span className="font-maroons-strong">{stat.events}</span>
                    </div>
                  )}

                  {stat.top_performer && (
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600 font-maroons-strong">Top Performer:</span>
                      <span className="font-maroons-strong">{stat.top_performer}</span>
                    </div>
                  )}
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
