import { Card, CardContent } from "@/components/ui/card";
import { Activity as ActivityIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Athlete = {
  id: string;
  name: string;
  sport: string;
  course: string;
  achievements: string | null;
  image_url: string | null;
};

const AthletesSection = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const { data, error } = await supabase
          .from('athletes')
          .select('id, name, sport, course, achievements, image_url')
          .limit(4)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setAthletes(data || []);
      } catch (error) {
        console.error("Error fetching athletes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, []);

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
      <section id="athletes" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-10">
            <ActivityIcon className="h-8 w-8 text-maroon" />
            <h2 className="text-3xl font-bold text-maroon">Featured Athletes</h2>
          </div>
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No athletes found. Add your first athlete!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="athletes" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ActivityIcon className="h-8 w-8 text-maroon" />
          <h2 className="text-3xl font-bold text-maroon">Featured Athletes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {athletes.map((athlete) => (
            <Card key={athlete.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-64 overflow-hidden">
                <img 
                  src={athlete.image_url || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600"} 
                  alt={athlete.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="text-xl font-bold">{athlete.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="bg-maroon text-white text-sm px-3 py-1 rounded-full">
                    {athlete.sport}
                  </span>
                  <span className="text-sm text-gray-600">{athlete.course}</span>
                </div>
                {athlete.achievements && (
                  <p className="mt-3 text-sm text-gray-700">
                    <span className="font-medium">Achievements:</span> {athlete.achievements}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/athletes" className="text-forest font-semibold hover:text-forest-dark underline">
            View all athletes →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AthletesSection;
