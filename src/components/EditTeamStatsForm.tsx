import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Team = {
  team_id: string;
  team_name: string;
  sport: string;
  coach_name: string;
};

type TeamStats = {
  team_id: string;
  team_name?: string;
  wins?: number;
  losses?: number;
  points?: number;
  medals?: number;
  records?: number;
  events?: number;
  top_performer?: string;
};

type EditTeamStatsFormProps = {
  teamStats?: TeamStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatsUpdated?: () => void;
};

const EditTeamStatsForm = ({ teamStats, open, onOpenChange, onStatsUpdated }: EditTeamStatsFormProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    team_id: teamStats?.team_id || "",
    wins: teamStats?.wins?.toString() || "",
    losses: teamStats?.losses?.toString() || "",
    points: teamStats?.points?.toString() || "",
    medals: teamStats?.medals?.toString() || "",
    records: teamStats?.records?.toString() || "",
    events: teamStats?.events?.toString() || "",
    top_performer: teamStats?.top_performer || "",
  });

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('team_name');
      
      if (error) throw error;
      
      setTeams(data as Team[]);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  // Update form data when teamStats prop changes
  useEffect(() => {
    if (teamStats) {
      setFormData({
        team_id: teamStats.team_id,
        wins: teamStats.wins?.toString() || "",
        losses: teamStats.losses?.toString() || "",
        points: teamStats.points?.toString() || "",
        medals: teamStats.medals?.toString() || "",
        records: teamStats.records?.toString() || "",
        events: teamStats.events?.toString() || "",
        top_performer: teamStats.top_performer || "",
      });
    } else {
      // Reset form for new stats
      setFormData({
        team_id: "",
        wins: "",
        losses: "",
        points: "",
        medals: "",
        records: "",
        events: "",
        top_performer: "",
      });
    }
  }, [teamStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.team_id) {
      toast({
        title: "Error",
        description: "Team selection is required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const statsData = {
        team_id: formData.team_id,
        wins: formData.wins ? parseInt(formData.wins) : null,
        losses: formData.losses ? parseInt(formData.losses) : null,
        points: formData.points ? parseInt(formData.points) : null,
        medals: formData.medals ? parseInt(formData.medals) : null,
        records: formData.records ? parseInt(formData.records) : null,
        events: formData.events ? parseInt(formData.events) : null,
        top_performer: formData.top_performer || null,
      };

      if (teamStats) {
        // Update existing stats
        const { error } = await supabase
          .from('stats')
          .update(statsData)
          .eq('team_id', teamStats.team_id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team statistics updated successfully.",
        });
      } else {
        // Check if stats already exist for this team
        const { data: existingStats, error: checkError } = await supabase
          .from('stats')
          .select('*')
          .eq('team_id', formData.team_id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingStats) {
          // Update existing stats
          const { error } = await supabase
            .from('stats')
            .update(statsData)
            .eq('team_id', formData.team_id);
          
          if (error) throw error;
          
          toast({
            title: "Success",
            description: "Team statistics updated successfully.",
          });
        } else {
          // Create new stats
          const { error } = await supabase
            .from('stats')
            .insert([statsData]);
          
          if (error) throw error;
          
          toast({
            title: "Success",
            description: "Team statistics created successfully.",
          });
        }
      }

      onOpenChange(false);
      onStatsUpdated?.();
      
      // Dispatch custom event to refresh stats lists
      window.dispatchEvent(new CustomEvent('teamStatsUpdated'));
      
    } catch (error) {
      console.error("Error updating team statistics:", error);
      toast({
        title: "Error",
        description: "Failed to update team statistics.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-maroon" />
            {teamStats ? "Edit Team Statistics" : "Add Team Statistics"}
          </DialogTitle>
          <DialogDescription>
            {teamStats ? "Update the team's statistical information below." : "Add statistical information for a team."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team_id">Team *</Label>
            <Select
              value={formData.team_id}
              onValueChange={(value) => handleInputChange("team_id", value)}
              disabled={!!teamStats} // Disable team selection when editing existing stats
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.team_id} value={team.team_id}>
                    {team.team_name} ({team.sport})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wins">Wins</Label>
              <Input
                id="wins"
                type="number"
                min="0"
                placeholder="0"
                value={formData.wins}
                onChange={(e) => handleInputChange("wins", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="losses">Losses</Label>
              <Input
                id="losses"
                type="number"
                min="0"
                placeholder="0"
                value={formData.losses}
                onChange={(e) => handleInputChange("losses", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Total Points</Label>
              <Input
                id="points"
                type="number"
                min="0"
                placeholder="0"
                value={formData.points}
                onChange={(e) => handleInputChange("points", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medals">Medals</Label>
              <Input
                id="medals"
                type="number"
                min="0"
                placeholder="0"
                value={formData.medals}
                onChange={(e) => handleInputChange("medals", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="records">Records Broken</Label>
              <Input
                id="records"
                type="number"
                min="0"
                placeholder="0"
                value={formData.records}
                onChange={(e) => handleInputChange("records", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="events">Events Participated</Label>
              <Input
                id="events"
                type="number"
                min="0"
                placeholder="0"
                value={formData.events}
                onChange={(e) => handleInputChange("events", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="top_performer">Top Performer</Label>
            <Input
              id="top_performer"
              placeholder="e.g., John Doe"
              value={formData.top_performer}
              onChange={(e) => handleInputChange("top_performer", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-maroon hover:bg-maroon/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                (teamStats ? "Updating..." : "Adding...") : 
                (teamStats ? "Update Statistics" : "Add Statistics")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamStatsForm;
