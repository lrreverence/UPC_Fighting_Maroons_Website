
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Stat = {
  team_id: string;
  team_name?: string; // Keep for display purposes
  top_performer?: string;
  wins?: number;
  losses?: number;
  points?: number;
  medals?: number;
  records?: number;
  events?: number;
};

const StatsSection = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stats')
        .select(`
          *,
          team:team_id (
            team_name
          )
        `)
        .order('team_id')
        .limit(4);
      
      if (error) throw error;
      
      // Transform data to include team_name
      const transformedStats = data?.map((stat: any) => ({
        ...stat,
        team_name: stat.team?.team_name
      })) || [];
      
      setStats(transformedStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to load stats data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading stats...</span>
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
            <BarChart3 className="h-8 w-8 text-forest" />
            <h2 className="text-3xl font-bold text-forest">Team Statistics</h2>
          </div>
          <Button asChild variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
            <Link to="/stats">View All Stats</Link>
          </Button>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.team_id} className="stats-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-forest mb-4">{stat.team_name}</h3>
                <div className="space-y-3">
                  {stat.wins !== null && stat.losses !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Win-Loss:</span>
                      <span className="font-semibold">{stat.wins}-{stat.losses}</span>
                    </div>
                  )}

                  {stat.points !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Points:</span>
                      <span className="font-semibold">{stat.points}</span>
                    </div>
                  )}

                  {stat.medals !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medals:</span>
                      <span className="font-semibold">{stat.medals}</span>
                    </div>
                  )}

                  {stat.top_performer && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600 text-sm">Top Performer:</span>
                      <p className="font-semibold text-sm">{stat.top_performer}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
