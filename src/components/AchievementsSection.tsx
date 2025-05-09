
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award as AwardIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type Achievement = {
  id: string;
  title: string;
  year: string;
  description: string;
};

const AchievementsSection = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        
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

    fetchAchievements();
  }, []);

  return (
    <section id="achievements" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <AwardIcon className="h-8 w-8 text-maroon" />
          <h2 className="text-3xl font-bold text-maroon">Recent Achievements</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="border-t-4 border-gold hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
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
        
        <div className="text-center mt-10">
          <Link to="/achievements" className="text-forest font-semibold hover:text-forest-dark underline">
            View all achievements →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
