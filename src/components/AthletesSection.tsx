
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

  // Fallback data if no athletes in database yet
  const fallbackAthletes = [
    {
      id: "1",
      name: "Marco Cruz",
      sport: "Basketball",
      course: "BS Computer Science",
      image_url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=600",
      achievements: "MVP 2023, All-Star 2022"
    },
    {
      id: "2",
      name: "Sofia Reyes",
      sport: "Volleyball",
      course: "BS Biology",
      image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600",
      achievements: "Best Setter 2023"
    },
    {
      id: "3",
      name: "Daniel Santos",
      sport: "Swimming",
      course: "BS Business Administration",
      image_url: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&q=80&w=600",
      achievements: "Gold Medalist 100m Freestyle"
    },
    {
      id: "4",
      name: "Maya Lim",
      sport: "Track and Field",
      course: "BS Architecture",
      image_url: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80&w=600",
      achievements: "Silver Medalist 400m"
    }
  ];

  // Use fallback data if no athletes found
  const displayAthletes = athletes.length > 0 ? athletes : fallbackAthletes;

  return (
    <section id="athletes" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <ActivityIcon className="h-8 w-8 text-maroon" />
          <h2 className="text-3xl font-bold text-maroon">Featured Athletes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayAthletes.map((athlete) => (
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
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-medium">Achievements:</span> {athlete.achievements}
                </p>
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
