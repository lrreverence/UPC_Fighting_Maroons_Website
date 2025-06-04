import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "lucide-react";

type Athlete = {
  student_id: number;
  fname: string;
  mname?: string;
  lname: string;
  birthdate?: string;
  hometown?: string;
  email?: string;
  phone_number?: string;
  department?: string;
  course?: string;
  year_level?: number;
  block?: string;
  team_name?: string;
  image_url?: string;
};

type Team = {
  team_name: string;
  sport: string;
  coach_name: string;
};

const SportAthletes = () => {
  const { sport } = useParams<{ sport: string }>();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert URL slug to display name
  const getSportDisplayName = (sportSlug: string) => {
    const sportMap: { [key: string]: string } = {
      'basketball': 'Basketball',
      'volleyball': 'Volleyball',
      'swimming': 'Swimming',
      'track-and-field': 'Track and Field',
      'football': 'Football',
      'tennis': 'Tennis',
    };
    return sportMap[sportSlug] || sportSlug;
  };

  const fetchSportData = async () => {
    if (!sport) return;
    
    try {
      setLoading(true);
      
      const sportName = getSportDisplayName(sport);
      
      // First, get teams for this sport
      const { data: teamsData, error: teamsError } = await (supabase as any)
        .from('team')
        .select('*')
        .eq('sport', sportName);
      
      if (teamsError) throw teamsError;
      
      setTeams(teamsData || []);
      
      if (teamsData && teamsData.length > 0) {
        // Get team names for this sport
        const teamNames = teamsData.map((team: Team) => team.team_name);
        
        // Then, get athletes for these teams
        const { data: athletesData, error: athletesError } = await (supabase as any)
          .from('athlete')
          .select('*')
          .in('team_name', teamNames)
          .order('lname');
        
        if (athletesError) throw athletesError;
        
        setAthletes(athletesData || []);
      } else {
        setAthletes([]);
      }
    } catch (error) {
      console.error("Error fetching sport data:", error);
      toast({
        title: "Error",
        description: "Failed to load sport data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSportData();
  }, [sport]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading athletes...</span>
      </div>
    );
  }

  const sportDisplayName = sport ? getSportDisplayName(sport) : '';

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-maroon mb-4">{sportDisplayName} Athletes</h1>
        
        {teams.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.team_name} className="border-l-4 border-l-maroon">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{team.team_name}</h3>
                    <p className="text-gray-600">
                      <strong>Coach:</strong> {team.coach_name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {athletes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No athletes found for {sportDisplayName}.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Athletes ({athletes.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <Card key={athlete.student_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={athlete.image_url || ""} 
                        alt={`${athlete.fname} ${athlete.lname}`}
                      />
                      <AvatarFallback className="bg-maroon text-white">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">
                        {athlete.fname} {athlete.mname ? `${athlete.mname} ` : ''}{athlete.lname}
                      </h3>
                      {athlete.team_name && (
                        <p className="text-sm text-maroon font-medium">{athlete.team_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Student ID:</strong> {athlete.student_id}</p>
                    {athlete.course && <p><strong>Course:</strong> {athlete.course}</p>}
                    {athlete.year_level && <p><strong>Year:</strong> {athlete.year_level}</p>}
                    {athlete.department && <p><strong>Department:</strong> {athlete.department}</p>}
                    {athlete.block && <p><strong>Block:</strong> {athlete.block}</p>}
                    {athlete.hometown && <p><strong>Hometown:</strong> {athlete.hometown}</p>}
                    {athlete.email && <p><strong>Email:</strong> {athlete.email}</p>}
                    {athlete.phone_number && <p><strong>Phone:</strong> {athlete.phone_number}</p>}
                    {athlete.birthdate && <p><strong>Birthdate:</strong> {new Date(athlete.birthdate).toLocaleDateString()}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SportAthletes;
