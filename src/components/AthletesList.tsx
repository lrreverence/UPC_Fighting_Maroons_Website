
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Athlete = {
  student_id: number;
  fname: string;
  mname?: string;
  lname: string;
  birthdate?: string;
  hometown?: string;
  email?: string;
  phone_number?: string;
  department?: string;
  course?: string;
  year_level?: number;
  block?: string;
  team_name?: string;
};

const AthletesList = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('athlete')
        .select('*')
        .order('lname');
      
      if (error) throw error;
      
      setAthletes(data as Athlete[]);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast({
        title: "Error",
        description: "Failed to load athletes data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const handleDeleteAthlete = async (studentId: number) => {
    if (!confirm("Are you sure you want to delete this athlete?")) return;

    try {
      const { error } = await supabase
        .from('athlete')
        .delete()
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      setAthletes(athletes.filter(athlete => athlete.student_id !== studentId));
      
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
        <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading athletes...</span>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No athletes found. Add your first athlete!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {athletes.map((athlete) => (
        <Card key={athlete.student_id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
          <CardContent className="p-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDeleteAthlete(athlete.student_id)}
              className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
            
            <h3 className="text-xl font-bold mb-4 pr-8">
              {athlete.fname} {athlete.mname ? `${athlete.mname} ` : ''}{athlete.lname}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Student ID:</strong> {athlete.student_id}</p>
              {athlete.team_name && <p><strong>Team:</strong> {athlete.team_name}</p>}
              {athlete.course && <p><strong>Course:</strong> {athlete.course}</p>}
              {athlete.year_level && <p><strong>Year:</strong> {athlete.year_level}</p>}
              {athlete.department && <p><strong>Department:</strong> {athlete.department}</p>}
              {athlete.block && <p><strong>Block:</strong> {athlete.block}</p>}
              {athlete.hometown && <p><strong>Hometown:</strong> {athlete.hometown}</p>}
              {athlete.email && <p><strong>Email:</strong> {athlete.email}</p>}
              {athlete.phone_number && <p><strong>Phone:</strong> {athlete.phone_number}</p>}
              {athlete.birthdate && <p><strong>Birthdate:</strong> {new Date(athlete.birthdate).toLocaleDateString()}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AthletesList;
