import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award as AwardIcon, Trash2, Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Achievement = {
  team_id: string;
  team_name?: string; // For display purposes
  title: string;
  year: number;
  achievement_description?: string;
};

type Team = {
  team_id: string;
  team_name: string;
  sport: string;
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    team_id: "",
    title: "",
    year: new Date().getFullYear(),
    achievement_description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalAchievement, setOriginalAchievement] = useState<Achievement | null>(null);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('team_id, team_name, sport')
        .order('team_name');
      
      if (error) throw error;
      setTeams(data as Team[]);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('achievement')
        .select(`
          *,
          team:team_id (
            team_name
          )
        `)
        .order('year', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include team_name
      const transformedAchievements = data?.map((achievement: any) => ({
        ...achievement,
        team_name: achievement.team?.team_name
      })) || [];
      
      setAchievements(transformedAchievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast({
        title: "Error",
        description: "Failed to load achievements data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchAchievements();
  }, []);
  const handleDeleteAchievement = async (teamId: string, title: string, year: number) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const { error } = await supabase
        .from('achievement')
        .delete()
        .eq('team_id', teamId)
        .eq('title', title)
        .eq('year', year);
      
      if (error) throw error;
      
      setAchievements(achievements.filter(achievement => 
        !(achievement.team_id === teamId && achievement.title === title && achievement.year === year)
      ));
      
      toast({
        title: "Success",
        description: "Achievement deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast({
        title: "Error",
        description: "Failed to delete achievement.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (achievement: Achievement) => {
    setIsEditing(true);
    setOriginalAchievement(achievement);
    setNewAchievement({
      team_id: achievement.team_id,
      title: achievement.title,
      year: achievement.year,
      achievement_description: achievement.achievement_description || ""
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setIsEditing(false);
      setOriginalAchievement(null);
      setNewAchievement({
        team_id: "",
        title: "",
        year: new Date().getFullYear(),
        achievement_description: ""
      });
    }, 100);
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.team_id || !newAchievement.title) {
      toast({
        title: "Error",
        description: "Team and Title are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && originalAchievement) {
        // Update existing achievement
        const { error } = await supabase
          .from('achievement')
          .update({
            team_id: newAchievement.team_id,
            title: newAchievement.title,
            year: newAchievement.year,
            achievement_description: newAchievement.achievement_description || null
          })
          .eq('team_id', originalAchievement.team_id)
          .eq('title', originalAchievement.title)
          .eq('year', originalAchievement.year);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Achievement updated successfully.",
        });
      } else {
        // Insert new achievement
        const { error } = await supabase
          .from('achievement')
          .insert([{
            team_id: newAchievement.team_id,
            title: newAchievement.title,
            year: newAchievement.year,
            achievement_description: newAchievement.achievement_description || null
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Achievement added successfully.",
        });
      }
      
      handleClose();
      fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} achievement.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <AwardIcon className="h-8 w-8 text-maroon" />
            <h1 className="text-4xl font-bold text-maroon font-maroons-strong">All Achievements</h1>
          </div>
          
          <Button 
            className="bg-maroon hover:bg-maroon/90"
            onClick={() => {
              setIsEditing(false);
              setNewAchievement({
                team_id: "",
                title: "",
                year: new Date().getFullYear(),
                achievement_description: ""
              });
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Achievement
          </Button>

          <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-maroons-strong">
                  {isEditing ? "Edit Achievement" : "Add New Achievement"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAchievement} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="team_id">Team</Label>
                  <Select 
                    value={newAchievement.team_id} 
                    onValueChange={(value) => setNewAchievement({...newAchievement, team_id: value})}
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
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                    placeholder="Achievement title" 
                    required
                    disabled={isEditing}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input 
                    id="year" 
                    type="number"
                    value={newAchievement.year}
                    onChange={(e) => setNewAchievement({...newAchievement, year: parseInt(e.target.value)})}
                    placeholder="2024" 
                    required
                    disabled={isEditing}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="achievement_description">Description</Label>
                  <Textarea 
                    id="achievement_description" 
                    value={newAchievement.achievement_description}
                    onChange={(e) => setNewAchievement({...newAchievement, achievement_description: e.target.value})}
                    placeholder="Achievement description" 
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-maroon hover:bg-maroon/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Achievement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading achievements...</span>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No achievements found. Add your first achievement!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={`${achievement.team_id}-${achievement.title}-${achievement.year}-${index}`} className="border-t-4 border-gold hover:shadow-md transition-shadow relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold font-maroons-strong">{achievement.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(achievement)}
                        className="text-maroon hover:text-maroon/90"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAchievement(achievement.team_id, achievement.title, achievement.year)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <span className="bg-maroon font-maroons-strong text-white text-sm px-3 py-1 rounded-full">
                    {achievement.year}
                  </span>
                  <p className="text-gray-600 mb-2 font-maroons-strong mt-2">{achievement.team_name}</p>
                  {achievement.achievement_description && (
                    <p className="text-gray-600 font-maroons-strong">{achievement.achievement_description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
