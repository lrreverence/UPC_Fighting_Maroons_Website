import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Activity, ArrowLeft, User, Hash, Calendar, MapPin, Mail, Phone, GraduationCap, Building, Trophy, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditAthleteForm from "./EditAthleteForm";

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
  team_id?: string;
  team_name?: string;
  image_url?: string;
};

type MatchHistory = {
  game_id: string;
  game_date: string;
  start_time: string;
  location?: string;
  game_status?: string;
  opponent_team?: string;
  team_id?: string;
  team_name?: string;
  stat_description?: string;
};

const AthletesSection = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Athlete Profile States
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [showProfile, setShowProfile] = useState(false);
    // Match History States
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showEditAthlete, setShowEditAthlete] = useState(false);
  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('athlete')
        .select(`
          *,
          team:team_id (
            team_name
          )
        `)
        .limit(6);
      
      if (error) throw error;
      
      // Transform data to include team_name
      const transformedData = data?.map((athlete: any) => ({
        ...athlete,
        team_name: athlete.team?.team_name
      })) || [];
      
      setAthletes(transformedData);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast({
        title: "Error",
        description: "Failed to load athletes data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchHistory = async (studentId: number) => {
    try {
      setLoadingHistory(true);
      // Join game_participation with game table to get match details
      const { data, error } = await supabase
        .from('game_participation')
        .select(`
          game_id,
          stat_description,
          game:game_id (
            game_date,
            start_time,
            location,
            game_status,
            opponent_team,
            team_id,
            team:team_id (
              team_name
            )
          )
        `)
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      // Transform the data to match our MatchHistory type
      const transformedData: MatchHistory[] = data?.map((item: any) => ({
        game_id: item.game_id,
        game_date: item.game?.game_date || '',
        start_time: item.game?.start_time || '',
        location: item.game?.location,
        game_status: item.game?.game_status,
        opponent_team: item.game?.opponent_team,
        team_id: item.game?.team_id,
        team_name: item.game?.team?.team_name,
        stat_description: item.stat_description
      })) || [];
      
      setMatchHistory(transformedData);
    } catch (error) {
      console.error("Error fetching match history:", error);
      toast({
        title: "Error",
        description: "Failed to load match history.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAthleteClick = async (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setShowProfile(true);
    await fetchMatchHistory(athlete.student_id);
  };

  const formatName = (athlete: Athlete) => {
    const middleInitial = athlete.mname ? ` ${athlete.mname.charAt(0)}.` : '';
    return `${athlete.lname}, ${athlete.fname}${middleInitial}`;
  };

  const calculateAge = (birthdate?: string) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatMatchTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };  useEffect(() => {
    fetchAthletes();
  }, []);

  // Add event listener for athlete updates
  useEffect(() => {
    const handleAthleteUpdated = () => {
      fetchAthletes();
    };

    window.addEventListener('athleteUpdated', handleAthleteUpdated);

    return () => {
      window.removeEventListener('athleteUpdated', handleAthleteUpdated);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading athletes...</span>
          </div>
        </div>
      </section>
    );
  }

  // Show athlete profile page
  if (showProfile && selectedAthlete) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="space-y-6">
            {/* Back button */}
            <Button
              variant="outline"
              onClick={() => {
                setShowProfile(false);
                setSelectedAthlete(null);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Featured Athletes
            </Button>

            {/* Athlete Profile */}
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden">                <CardHeader className="bg-gradient-to-r from-maroon to-maroon/80 text-white">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <Avatar className="h-32 w-32 ring-4 ring-white/20">
                        <AvatarImage 
                          src={selectedAthlete.image_url || ""} 
                          alt={formatName(selectedAthlete)}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-white/20 text-white text-2xl">
                          <User className="h-16 w-16" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold font-maroons-strong">{formatName(selectedAthlete)}</h1>
                        {selectedAthlete.team_name && (
                          <p className="text-xl text-white/90 mt-2">{selectedAthlete.team_name}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditAthlete(true)}
                      className="text-white hover:bg-white/20 border-white/30"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 font-maroons-strong">
                        <User className="h-5 w-5" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Student ID:</span>
                          <span>{selectedAthlete.student_id}</span>
                        </div>
                        {selectedAthlete.birthdate && (
                          <>
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Birthdate:</span>
                              <span>{new Date(selectedAthlete.birthdate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Age:</span>
                              <span>{calculateAge(selectedAthlete.birthdate)} years old</span>
                            </div>
                          </>
                        )}
                        {selectedAthlete.hometown && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Hometown:</span>
                            <span>{selectedAthlete.hometown}</span>
                          </div>
                        )}
                        {selectedAthlete.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Email:</span>
                            <span>{selectedAthlete.email}</span>
                          </div>
                        )}
                        {selectedAthlete.phone_number && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Phone:</span>
                            <span>{selectedAthlete.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 font-maroons-strong">
                        <GraduationCap className="h-5 w-5" />
                        Academic Information
                      </h3>
                      <div className="space-y-3">
                        {selectedAthlete.department && (
                          <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Department:</span>
                            <span>{selectedAthlete.department}</span>
                          </div>
                        )}
                        {selectedAthlete.course && (
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Course:</span>
                            <span>{selectedAthlete.course}</span>
                          </div>
                        )}
                        {selectedAthlete.year_level && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Year Level:</span>
                            <span>{selectedAthlete.year_level}</span>
                          </div>
                        )}
                        {selectedAthlete.block && (
                          <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Block:</span>
                            <span>{selectedAthlete.block}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Match History Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold flex items-center gap-2 font-maroons-strong">
                        <Trophy className="h-5 w-5" />
                        Match History
                      </h3>
                    </div>

                    {loadingHistory ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Loading match history...</span>
                      </div>
                    ) : matchHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No match history found for this athlete.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matchHistory.map((match) => (
                          <Card key={match.game_id} className="border-l-4 border-l-maroon">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-lg font-maroons-strong">Game #{match.game_id}</h4>
                                    {match.game_status && (
                                      <Badge variant={
                                        match.game_status.toLowerCase().includes('win') || match.game_status.toLowerCase().includes('won')
                                          ? 'default'
                                          : match.game_status.toLowerCase().includes('loss') || match.game_status.toLowerCase().includes('lost')
                                          ? 'destructive'
                                          : 'secondary'
                                      }>
                                        {match.game_status}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Date:</strong> {new Date(match.game_date).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {formatMatchTime(match.start_time)}</p>
                                    {match.location && <p><strong>Location:</strong> {match.location}</p>}
                                    {match.opponent_team && <p><strong>Opponent:</strong> {match.opponent_team}</p>}
                                    {match.team_name && <p><strong>Team:</strong> {match.team_name}</p>}
                                  </div>
                                </div>
                                <div className="flex-1 max-w-md">
                                  {match.stat_description && (
                                    <div>
                                      <strong className="text-sm">Performance Notes:</strong>
                                      <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded border">
                                        {match.stat_description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <Activity className="h-8 w-8 text-maroon" />
            <h2 className="text-3xl font-bold text-maroon font-maroons-strong">Featured Athletes</h2>
          </div>
          <Button asChild variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-white">
            <Link to="/athletes">View All Athletes</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map((athlete) => (
            <Card 
              key={athlete.student_id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleAthleteClick(athlete)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={athlete.image_url || ""} 
                      alt={`${athlete.fname} ${athlete.lname}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-maroon text-white">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold mb-1 font-maroons-strong">
                      {athlete.fname} {athlete.mname ? `${athlete.mname} ` : ''}{athlete.lname}
                    </h3>
                    {athlete.team_name && (
                      <Badge variant="secondary" className="text-xs">
                        {athlete.team_name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Student ID:</strong> {athlete.student_id}</p>
                  {athlete.course && <p><strong>Course:</strong> {athlete.course}</p>}
                  {athlete.year_level && <p><strong>Year:</strong> {athlete.year_level}</p>}
                  {athlete.hometown && <p><strong>Hometown:</strong> {athlete.hometown}</p>}
                </div>
              </CardContent>
            </Card>
          ))}        </div>
      </div>
        {/* Edit Athlete Form */}
      {showEditAthlete && selectedAthlete && (
        <EditAthleteForm
          athlete={selectedAthlete}
          open={showEditAthlete}
          onOpenChange={setShowEditAthlete}
          onAthleteUpdated={() => {
            fetchAthletes();
            // Refresh selected athlete data
            if (selectedAthlete) {
              fetchAthletes().then(() => {
                const updatedAthlete = athletes.find(a => a.student_id === selectedAthlete.student_id);
                if (updatedAthlete) {
                  setSelectedAthlete(updatedAthlete);
                }
              });
            }
          }}
        />
      )}
    </section>
  );
};

export default AthletesSection;
