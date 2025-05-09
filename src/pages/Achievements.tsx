
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award as AwardIcon, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Achievement = {
  id: string;
  title: string;
  year: string;
  description: string;
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    year: new Date().getFullYear().toString(),
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAchievements(data as Achievement[]);
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
    fetchAchievements();
  }, []);

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAchievements(achievements.filter(achievement => achievement.id !== id));
      
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

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!newAchievement.title.trim() || !newAchievement.year.trim() || !newAchievement.description.trim()) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          title: newAchievement.title,
          year: newAchievement.year,
          description: newAchievement.description
        }])
        .select();
      
      if (error) throw error;
      
      setAchievements([...data as Achievement[], ...achievements]);
      
      toast({
        title: "Success",
        description: "Achievement added successfully.",
      });
      
      // Reset form and close dialog
      setNewAchievement({
        title: "",
        year: new Date().getFullYear().toString(),
        description: ""
      });
      setOpen(false);
      
      // Refresh achievements list
      fetchAchievements();
    } catch (error) {
      console.error("Error adding achievement:", error);
      toast({
        title: "Error",
        description: "Failed to add achievement.",
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
            <h1 className="text-4xl font-bold text-maroon">All Achievements</h1>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-maroon hover:bg-maroon/90">
                <Plus className="mr-2 h-4 w-4" /> Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Achievement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAchievement} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                    placeholder="Achievement title" 
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input 
                    id="year" 
                    value={newAchievement.year}
                    onChange={(e) => setNewAchievement({...newAchievement, year: e.target.value})}
                    placeholder="2024" 
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                    placeholder="Achievement description" 
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-maroon hover:bg-maroon/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Achievement"}
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
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="border-t-4 border-gold hover:shadow-md transition-shadow relative">
                <CardContent className="p-6">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                  <div className="flex justify-between items-start mb-4 pr-6">
                    <h3 className="text-lg font-bold">{achievement.title}</h3>
                    <span className="bg-maroon text-white text-sm px-3 py-1 rounded-full">
                      {achievement.year}
                    </span>
                  </div>
                  <p className="text-gray-600">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
