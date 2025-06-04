
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Game = {
  game_id: string;
  game_date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  game_status?: string;
  team_id?: string;
  team_name?: string; // For display purposes
  opponent_team?: string;
};

const GamesScheduleSection = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game')
        .select(`
          *,
          team:team_id (
            team_name
          )
        `)
        .order('game_date')
        .limit(6);
      
      if (error) throw error;
      
      // Transform data to include team_name
      const transformedGames = data?.map((game: any) => ({
        ...game,
        team_name: game.team?.team_name
      })) || [];
      
      setGames(transformedGames);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error",
        description: "Failed to load games data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading games...</span>
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
            <Calendar className="h-8 w-8 text-forest" />
            <h2 className="text-3xl font-bold text-forest">Upcoming Games</h2>
          </div>
          <Button asChild variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
            <Link to="/schedule">View Full Schedule</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.game_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold">
                    {game.team_name || 'Fighting Maroons'}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    game.game_status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {game.game_status || 'Scheduled'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2">vs. {game.opponent_team}</p>
                
                <div className="space-y-1 text-sm text-gray-500">
                  <p><strong>Date:</strong> {formatDate(game.game_date)}</p>
                  <p><strong>Time:</strong> {formatTime(game.start_time)}</p>
                  {game.location && <p><strong>Venue:</strong> {game.location}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesScheduleSection;
