
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart as BarChartIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatData {
  id: string;
  title: string;
  wins?: number;
  losses?: number;
  points?: number;
  medals?: number;
  records?: number;
  events?: number;
  top_performer: string;
}

const StatsSection = () => {
  const [statsData, setStatsData] = useState<StatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('stats')
          .select('*')
          .order('title');
        
        if (error) {
          throw error;
        }

        setStatsData(data as StatData[]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          variant: "destructive",
          title: "Error loading stats",
          description: "There was a problem loading the statistics."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <section id="stats" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <BarChartIcon className="h-8 w-8 text-forest" />
          <h2 className="text-3xl font-bold text-forest">Team Stats</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-maroon" />
          </div>
        ) : statsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
              <Card key={stat.id} className="stats-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-maroon mb-4">{stat.title}</h3>
                  <div className="space-y-3">
                    {stat.wins !== null && stat.losses !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Win-Loss:</span>
                        <span className="font-semibold">{stat.wins}-{stat.losses}</span>
                      </div>
                    )}
                    
                    {stat.points !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Points:</span>
                        <span className="font-semibold">{stat.points}</span>
                      </div>
                    )}
                    
                    {stat.medals !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Medals:</span>
                        <span className="font-semibold">{stat.medals}</span>
                      </div>
                    )}
                    
                    {stat.records !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Records Broken:</span>
                        <span className="font-semibold">{stat.records}</span>
                      </div>
                    )}
                    
                    {stat.events !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Events:</span>
                        <span className="font-semibold">{stat.events}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Top Performer:</span>
                      <span className="font-semibold">{stat.top_performer}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No statistics available.</p>
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link to="/stats" className="text-maroon font-semibold hover:text-maroon-light underline">
            View detailed statistics →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
