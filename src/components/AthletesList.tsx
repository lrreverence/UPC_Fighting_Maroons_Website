
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Athlete = {
  id: string;
  name: string;
  sport: string;
  course: string;
  year: string;
  position: string;
  hometown: string;
  achievements: string | null;
  image_url: string | null;
};

const AthletesList = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAthletes = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAthletes(data || []);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast({
        title: "Error",
        description: "Failed to load athletes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const handleDeleteAthlete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this athlete?")) return;

    try {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAthletes(athletes.filter(athlete => athlete.id !== id));
      
      toast({
        title: "Success",
        description: "Athlete deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting athlete:", error);
      toast({
        title: "Error",
        description: "Failed to delete athlete.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading athletes...</p>
        </div>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">No athletes found. Add your first athlete!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {athletes.map((athlete) => (
        <Card key={athlete.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
          <div className="h-64 overflow-hidden">
            <img 
              src={athlete.image_url || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600"} 
              alt={athlete.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleDeleteAthlete(athlete.id)}
            className="absolute top-2 right-2 h-8 w-8 text-white hover:text-red-500 hover:bg-white/70 bg-black/30"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
          <CardContent className="pt-4">
            <h3 className="text-xl font-bold">{athlete.name}</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="bg-maroon text-white text-sm px-3 py-1 rounded-full">
                {athlete.sport}
              </span>
              <span className="text-sm text-gray-600">{athlete.course}</span>
            </div>
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Year:</span> {athlete.year}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Position:</span> {athlete.position}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Hometown:</span> {athlete.hometown}
            </p>
            {athlete.achievements && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Achievements:</span> {athlete.achievements}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AthletesList;
