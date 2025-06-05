import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Team = Tables<"team">;

const SportsPage = () => {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .order("sport, team_name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-center mb-12 text-[#7b1113] font-maroons-strong">
            Sports
          </h1>
          <div className="text-center">Loading sports...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-center mb-12 text-[#7b1113] font-maroons-strong">
            Sports
          </h1>
          <div className="text-center text-red-600">Error loading sports data</div>
        </div>
      </div>
    );
  }

  // Group teams by sport
  const sportGroups = teams?.reduce((acc, team) => {
    if (!acc[team.sport]) {
      acc[team.sport] = [];
    }
    acc[team.sport].push(team);
    return acc;
  }, {} as Record<string, Team[]>) || {};

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-12 text-[#7b1113] font-maroons-strong">
          Sports
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(sportGroups).map(([sport, sportTeams]) => (
            <Card key={sport} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to={`/sports/${sport.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="bg-gradient-to-r from-[#7b1113] to-[#9b3133] text-white">
                  <CardTitle className="text-xl font-maroons-strong text-center group-hover:text-gold-light transition-colors">
                    {sport}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm font-medium">Teams:</p>
                    {sportTeams.map((team) => (
                      <div key={team.team_id} className="bg-gray-100 rounded-lg p-3">
                        <h3 className="font-semibold text-[#7b1113]">
                          {team.team_name}
                        </h3>
                        {team.coach_name && (
                          <p className="text-sm text-gray-600">Coach: {team.coach_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-[#7b1113] font-medium group-hover:text-[#9b3133] transition-colors">
                      View Details →
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
