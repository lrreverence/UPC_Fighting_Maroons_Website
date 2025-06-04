
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Athlete = {
  student_id: number;
  fname: string;
  mname?: string;
  lname: string;
  hometown?: string;
  team_name?: string;
  course?: string;
  year_level?: number;
  department?: string;
};

const AthletesSection = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('athlete')
        .select('*')
        .limit(6);
      
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

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading athletes...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-maroon" />
            <h2 className="text-3xl font-bold text-maroon">Featured Athletes</h2>
          </div>
          <Button asChild variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-white">
            <Link to="/athletes">View All Athletes</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map((athlete) => (
            <Card key={athlete.student_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {athlete.fname} {athlete.mname ? `${athlete.mname} ` : ''}{athlete.lname}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Student ID:</strong> {athlete.student_id}</p>
                  {athlete.team_name && <p><strong>Team:</strong> {athlete.team_name}</p>}
                  {athlete.course && <p><strong>Course:</strong> {athlete.course}</p>}
                  {athlete.year_level && <p><strong>Year:</strong> {athlete.year_level}</p>}
                  {athlete.hometown && <p><strong>Hometown:</strong> {athlete.hometown}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AthletesSection;
