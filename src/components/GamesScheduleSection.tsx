
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  sport: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
}

const GamesScheduleSection = () => {
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .order('date')
          .limit(4);
        
        if (error) {
          throw error;
        }

        setUpcomingGames(data as Game[]);
      } catch (error) {
        console.error('Error fetching games:', error);
        toast({
          variant: "destructive",
          title: "Error loading games",
          description: "There was a problem loading the game schedule."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [toast]);

  return (
    <section id="games" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-forest" />
            <h2 className="text-3xl font-bold text-forest">Upcoming Games</h2>
          </div>
          <Link 
            to="/schedule" 
            className="text-maroon font-semibold hover:text-maroon-light"
          >
            View full schedule →
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-maroon" />
          </div>
        ) : upcomingGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingGames.map((game) => (
              <Card key={game.id} className="border-l-4 border-maroon hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-maroon">{game.sport}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-1">vs. {game.opponent}</p>
                  <div className="text-sm text-gray-600">
                    <p>{game.date} • {game.time}</p>
                    <p className="mt-1">{game.venue}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming games scheduled.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default GamesScheduleSection;
