import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Achievement = {
  team_id: string;
  team_name: string;
  title: string;
  year: number;
  achievement_description?: string;
};

const AchievementsSection = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order('year', { ascending: false })
        .limit(4);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      // Transform data to include team_name from the joined team table
      const transformedAchievements = data?.map((achievement: any) => ({
        ...achievement,
        team_name: achievement.team?.team_name || 'Unknown Team'
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
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading achievements...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-gold" />
            <h2 className="text-3xl font-bold text-maroon">Recent Achievements</h2>
          </div>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">
            <Link to="/achievements">View All Achievements</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <Card key={`${achievement.team_id}-${achievement.title}-${achievement.year}`} className="border-t-4 border-gold hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{achievement.title}</h3>
                  <span className="bg-maroon text-white text-sm px-3 py-1 rounded-full">
                    {achievement.year}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.team_name}</p>
                {achievement.achievement_description && (
                  <p className="text-sm text-gray-600">{achievement.achievement_description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
