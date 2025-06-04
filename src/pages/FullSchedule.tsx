import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, X, Search, Edit, Check, ArrowLeft, User, Users, MapPin, Clock, Trophy } from "lucide-react";
import {  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Game {
  game_id: string;
  game_date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  game_status?: string;
  team_id?: string;
  team_name?: string; // Keep for display purposes
  opponent_team?: string;
}

interface GameFormValues {
  game_id: string;
  game_date: string;
  start_time: string;
  end_time: string;
  location: string;
  game_status: string;
  team_id: string;
  opponent_team: string;
}

interface Team {
  team_id: string;
  team_name: string;
  sport: string;
}

interface Athlete {
  student_id: number;
  fname: string;
  mname?: string;
  lname: string;
  team_id: string;
  image_url?: string;
  birthdate?: string;
  email?: string;
  phone_number?: string;
  department?: string;
  course?: string;
  year_level?: number;
  block?: string;
}

interface GameParticipation {
  student_id: number;
  athlete: Athlete;
  stat_description?: string;
}

const FullSchedule = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [playerSearchOpen, setPlayerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Game Details View States
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [gameParticipants, setGameParticipants] = useState<GameParticipation[]>([]);
  const [loadingGameDetails, setLoadingGameDetails] = useState(false);
    // Athlete Profile States
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [showAthleteProfile, setShowAthleteProfile] = useState(false);
  const [athleteMatchHistory, setAthleteMatchHistory] = useState<any[]>([]);
  const [loadingAthleteHistory, setLoadingAthleteHistory] = useState(false);
  
  const form = useForm<GameFormValues>({
    defaultValues: {
      game_id: "",
      game_date: "",
      start_time: "",
      end_time: "",
      location: "",
      game_status: "Scheduled",
      team_id: "",
      opponent_team: "",
    },
  });
  const editForm = useForm<GameFormValues>({
    defaultValues: {
      game_id: "",
      game_date: "",
      start_time: "",
      end_time: "",
      location: "",
      game_status: "Scheduled",
      team_id: "",
      opponent_team: "",
    },
  });
  // Watch team_id to fetch athletes when team changes
  const watchedTeamId = form.watch("team_id");
  const watchedEditTeamId = editForm.watch("team_id");
  
  useEffect(() => {
    if (watchedTeamId && watchedTeamId !== selectedTeamId) {
      setSelectedTeamId(watchedTeamId);
      setSelectedPlayers([]);
      setSearchQuery("");
      fetchAthletesForTeam(watchedTeamId);
    }
  }, [watchedTeamId, selectedTeamId]);

  useEffect(() => {
    if (watchedEditTeamId && watchedEditTeamId !== selectedTeamId && isEditDialogOpen) {
      setSelectedTeamId(watchedEditTeamId);
      setSearchQuery("");
      fetchAthletesForTeam(watchedEditTeamId);
    }
  }, [watchedEditTeamId, selectedTeamId, isEditDialogOpen]);

  // Auto-focus search input when popover opens
  useEffect(() => {
    if (playerSearchOpen && searchInputRef.current) {
      // Small delay to ensure the popover is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [playerSearchOpen]);const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("team")
        .select("team_id, team_name, sport")
        .order("team_name");

      if (error) throw error;
      setTeams(data as Team[]);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };  const fetchAthletesForTeam = async (teamId: string) => {
    if (!teamId) return;
      console.log('=== FETCHING ATHLETES DEBUG ===');
    console.log('Team ID:', teamId);
    console.log('Browser:', navigator.userAgent);
    
    try {
      setIsLoading(true);
      console.log('Starting supabase query...');
      
      const { data, error } = await supabase
        .from("athlete")
        .select("student_id, fname, mname, lname, team_id")
        .eq("team_id", teamId)
        .order("lname");

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Athletes fetched successfully:', data.length);
      setAthletes(data as Athlete[]);
      
      // Show feedback about how many athletes were found
      if (data.length === 0) {
        toast({
          title: "No athletes found",
          description: "This team has no registered athletes yet.",
          variant: "destructive",
        });
      } else {
        console.log('Athletes loaded:', data);
      }
    } catch (error) {
      console.error("Error fetching athletes:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      setAthletes([]);
      toast({
        title: "Error loading athletes",
        description: `Failed to load athletes: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Function to update team statistics based on game results
  const updateTeamStatistics = async (teamId: string) => {
    try {
      // Count wins and losses for the team from the game table
      const { data: games, error: gamesError } = await supabase
        .from('game')
        .select('game_status')
        .eq('team_id', teamId);

      if (gamesError) throw gamesError;

      const wins = games?.filter(game => game.game_status === 'Win').length || 0;
      const losses = games?.filter(game => game.game_status === 'Loss').length || 0;

      // Check if a stats record exists for this team
      const { data: existingStats, error: statsCheckError } = await supabase
        .from('stats')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (statsCheckError && statsCheckError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        throw statsCheckError;
      }

      if (existingStats) {
        // Update existing stats record
        const { error: updateError } = await supabase
          .from('stats')
          .update({
            wins,
            losses
          })
          .eq('team_id', teamId);

        if (updateError) throw updateError;
      } else {
        // Create new stats record
        const { error: insertError } = await supabase
          .from('stats')
          .insert({
            team_id: teamId,
            wins,
            losses
          });

        if (insertError) throw insertError;
      }

      console.log(`Updated statistics for team ${teamId}: ${wins} wins, ${losses} losses`);
    } catch (error) {
      console.error('Error updating team statistics:', error);
      // Don't throw the error to avoid disrupting the game update flow
    }
  };

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("game")
        .select(`
          *,
          team:team_id (
            team_name
          )
        `)
        .order("game_date");

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
        variant: "destructive",
        title: "Error loading games",
        description: "There was a problem loading the game schedule.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchGames();
  }, []);  const handleAddGame = async (values: GameFormValues) => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!values.game_id) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Game ID is required.",
        });
        return;
      }

      if (!values.team_id) {
        toast({
          variant: "destructive",
          title: "Validation Error", 
          description: "Team selection is required.",
        });
        return;
      }      // Apply time-based validation for game status
      const timeStatus = getGameTimeStatus(values.game_date, values.start_time, values.end_time);
      
      // Determine final game status based on time
      let finalGameStatus = values.game_status || 'Scheduled';
      if (timeStatus === 'PRE_GAME') {
        finalGameStatus = 'Scheduled';
      } else if (timeStatus === 'DURING_GAME') {
        finalGameStatus = 'Ongoing';
      }
      // For POST_GAME, use the selected status      // First, create the game
      const { error: gameError } = await supabase.from("game").insert([{
        game_id: values.game_id,
        game_date: values.game_date,
        start_time: values.start_time,
        end_time: values.end_time || null,
        location: values.location || null,
        game_status: finalGameStatus,
        team_id: values.team_id,
        opponent_team: values.opponent_team || null,
      }]);

      if (gameError) throw gameError;

      // Then, create game_participation records for selected players
      if (selectedPlayers.length > 0) {        const participationRecords = selectedPlayers.map(studentId => ({
          game_id: values.game_id,
          student_id: studentId
        }));

        const { error: participationError } = await supabase
          .from("game_participation")
          .insert(participationRecords);

        if (participationError) throw participationError;
      }

      toast({
        title: "Game added successfully",
        description: `Game ${values.game_id} has been added to the schedule${selectedPlayers.length > 0 ? ` with ${selectedPlayers.length} players selected` : ''}.`,
      });      form.reset();
      setSelectedPlayers([]);
      setSelectedTeamId("");
      setAthletes([]);
      setSearchQuery("");
      setIsDialogOpen(false);
      fetchGames();
    } catch (error) {
      console.error("Error adding game:", error);
      toast({
        variant: "destructive",
        title: "Error adding game",
        description: "There was a problem adding the game to the schedule. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };  const handlePlayerToggle = (studentId: number) => {
    console.log('=== PLAYER TOGGLE DEBUG ===');
    console.log('Toggling player:', studentId);
    console.log('Current selected players:', selectedPlayers);
    console.log('Browser:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    
    try {
      setSelectedPlayers(prev => {
        const newSelection = prev.includes(studentId) 
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId];
        console.log('New selected players:', newSelection);
        return newSelection;
      });
      console.log('Toggle completed successfully');
    } catch (error) {
      console.error('Error in handlePlayerToggle:', error);
    }
  };
  const removePlayer = (studentId: number) => {
    setSelectedPlayers(prev => prev.filter(id => id !== studentId));
  };

  const getSelectedPlayersInfo = () => {
    return athletes.filter(athlete => selectedPlayers.includes(athlete.student_id));
  };// Filter athletes based on search query - optimized with useMemo
  const filteredAthletes = useMemo(() => {
    if (!athletes.length) return [];
      if (!searchQuery.trim()) return athletes;
    
    const query = searchQuery.toLowerCase().trim();
    return athletes.filter(athlete => {
      const fullName = `${athlete.lname}, ${athlete.fname}${athlete.mname ? ` ${athlete.mname.charAt(0)}.` : ''}`.toLowerCase();
      const studentId = athlete.student_id.toString();
      return fullName.includes(query) || studentId.includes(query);
    });
  }, [athletes, searchQuery]);

  // Time-based logic helper functions
  const getGameTimeStatus = (gameDate: string, startTime: string, endTime?: string) => {
    const now = new Date();
    const gameStart = new Date(`${gameDate}T${startTime}`);
    const gameEnd = endTime ? new Date(`${gameDate}T${endTime}`) : null;

    if (now < gameStart) {
      return 'PRE_GAME'; // Before game starts
    } else if (gameEnd && now > gameEnd) {
      return 'POST_GAME'; // After game ends
    } else {
      return 'DURING_GAME'; // Game is ongoing or no end time specified
    }
  };  const getAvailableStatuses = (timeStatus: string) => {
    switch (timeStatus) {
      case 'PRE_GAME':
        return ['Scheduled'];
      case 'DURING_GAME':
        return ['Ongoing'];
      case 'POST_GAME':
        return ['Win', 'Loss', 'Disqualified'];
      default:
        return ['Scheduled', 'Ongoing', 'Win', 'Loss', 'Disqualified'];
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      const { error } = await supabase.from("game").delete().eq("game_id", gameId);

      if (error) throw error;

      toast({
        title: "Game deleted",
        description: "The game has been removed from the schedule.",
      });

      fetchGames();
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        variant: "destructive",
        title: "Error deleting game",
        description: "There was a problem deleting the game.",
      });
    }  };

  const handleEditGame = async (game: Game) => {
    setEditingGame(game);
      // Populate the edit form with existing game data
    editForm.reset({
      game_id: game.game_id,
      team_id: game.team_id,
      opponent_team: game.opponent_team,
      game_date: game.game_date,
      start_time: game.start_time,
      end_time: game.end_time,
      location: game.location || "",
      game_status: game.game_status || "Scheduled",
    });
    
    // Load existing players for this game
    try {
      const { data: participationData, error } = await supabase
        .from("game_participation")
        .select("student_id")
        .eq("game_id", game.game_id);
      
      if (error) throw error;
      
      const existingPlayerIds = participationData?.map(p => p.student_id) || [];
      setSelectedPlayers(existingPlayerIds);
      
      // Load athletes for the selected team
      if (game.team_id) {
        setSelectedTeamId(game.team_id);
      }
    } catch (error) {
      console.error("Error loading game players:", error);
      toast({
        variant: "destructive",
        title: "Error loading game data",
        description: "There was a problem loading the game details.",
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateGame = async (values: GameFormValues) => {
    if (!editingGame) return;
    
    try {
      setIsLoading(true);
        const gameDateTime = new Date(`${values.game_date}T${values.start_time}`);
      const gameEndDateTime = new Date(`${values.game_date}T${values.end_time}`);
      const currentTime = new Date();
      
      const timeStatus = getGameTimeStatus(values.game_date, values.start_time, values.end_time);
      
      // Apply time-based validation
      let finalGameStatus = values.game_status;
      let updateData: any = {
        team_id: values.team_id,
        opponent_team: values.opponent_team,
        game_date: values.game_date,
        start_time: values.start_time,
        end_time: values.end_time,
        location: values.location
      };
      
      if (timeStatus === 'PRE_GAME') {
        // Before game starts - can edit all details but force status to Scheduled
        finalGameStatus = 'Scheduled';
        updateData.game_status = finalGameStatus;
      } else if (timeStatus === 'DURING_GAME') {
        // During game - force status to Ongoing, don't allow other changes
        finalGameStatus = 'Ongoing';
        updateData = {
          game_status: finalGameStatus
        };      } else {
        // After game ends - only allow status changes
        const availableStatuses = getAvailableStatuses(timeStatus);
        if (!availableStatuses.includes(values.game_status)) {
          toast({
            variant: "destructive",
            title: "Invalid status",
            description: "Please select a valid status for a completed game.",
          });
          return;
        }
        updateData = {
          game_status: values.game_status
        };
      }      // Update the game
      const { error: gameError } = await supabase
        .from("game")
        .update(updateData)
        .eq("game_id", editingGame.game_id);

      if (gameError) throw gameError;

      // Update team statistics if game status changed to Win or Loss
      const previousStatus = editingGame.game_status;
      const newStatus = updateData.game_status || previousStatus;
      
      if ((newStatus === 'Win' || newStatus === 'Loss') && 
          (previousStatus !== 'Win' && previousStatus !== 'Loss')) {
        // Status changed from non-result to result - update statistics
        await updateTeamStatistics(values.team_id);
      } else if ((previousStatus === 'Win' || previousStatus === 'Loss') && 
                 (newStatus === 'Win' || newStatus === 'Loss') && 
                 previousStatus !== newStatus) {
        // Status changed from one result to another - update statistics
        await updateTeamStatistics(values.team_id);
      } else if ((previousStatus === 'Win' || previousStatus === 'Loss') && 
                 (newStatus !== 'Win' && newStatus !== 'Loss')) {
        // Status changed from result to non-result - update statistics
        await updateTeamStatistics(values.team_id);
      }

      // Update player participation only if game hasn't started
      if (timeStatus === 'PRE_GAME') {
        // Delete existing participations for this game
        const { error: deleteError } = await supabase
          .from("game_participation")
          .delete()
          .eq("game_id", editingGame.game_id);

        if (deleteError) throw deleteError;

        // Insert new participations if players are selected
        if (selectedPlayers.length > 0) {          const participationRecords = selectedPlayers.map(studentId => ({
            game_id: editingGame.game_id,
            student_id: studentId
          }));

          const { error: participationError } = await supabase
            .from("game_participation")
            .insert(participationRecords);

          if (participationError) throw participationError;
        }
      }

      toast({
        title: "Game updated successfully",
        description: `Game ${editingGame.game_id} has been updated.`,
      });

      // Reset form and close dialog
      editForm.reset();
      setSelectedPlayers([]);
      setSelectedTeamId("");
      setAthletes([]);
      setSearchQuery("");
      setIsEditDialogOpen(false);
      setEditingGame(null);
      fetchGames();
    } catch (error) {
      console.error("Error updating game:", error);
      toast({
        variant: "destructive",
        title: "Error updating game",
        description: "There was a problem updating the game. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Game Details Functions
  const handleGameClick = async (game: Game) => {
    setSelectedGame(game);
    setShowGameDetails(true);
    await fetchGameParticipants(game.game_id);
  };

  const fetchGameParticipants = async (gameId: string) => {
    try {
      setLoadingGameDetails(true);
      const { data, error } = await supabase
        .from('game_participation')
        .select(`
          student_id,
          stat_description,
          athlete:student_id (
            student_id,
            fname,
            mname,
            lname,
            image_url,
            birthdate,
            email,
            phone_number,
            department,
            course,
            year_level,
            block,
            team_id
          )
        `)
        .eq('game_id', gameId);

      if (error) throw error;

      // Transform the data to match our GameParticipation type
      const transformedData: GameParticipation[] = data?.map((item: any) => ({
        student_id: item.student_id,
        stat_description: item.stat_description,
        athlete: item.athlete
      })) || [];

      setGameParticipants(transformedData);
    } catch (error) {
      console.error("Error fetching game participants:", error);
      toast({
        title: "Error",
        description: "Failed to load game participants.",
        variant: "destructive",
      });
    } finally {
      setLoadingGameDetails(false);
    }
  };  const handlePlayerClick = async (athlete: Athlete) => {
    // Open athlete profile modal like in AthletesSection
    setSelectedAthlete(athlete);
    setShowAthleteProfile(true);
    await fetchAthleteMatchHistory(athlete.student_id);
  };
  const handleTeamClick = (teamId: string, sport?: string) => {
    // If sport is not provided, look it up from teams data
    let actualSport = sport;
    if (!actualSport && teamId) {
      const team = teams.find(t => t.team_id === teamId);
      actualSport = team?.sport;
    }
    
    if (actualSport) {
      // Convert sport name to URL-friendly format and navigate to sport page
      const sportSlug = actualSport.toLowerCase().replace(/\s+/g, '-');
      navigate(`/sports/${sportSlug}`);
      toast({
        title: "Navigating to Team Page",
        description: `Opening ${actualSport} team page...`,
      });
    } else {
      toast({
        title: "Navigation Error",
        description: "Unable to determine sport for this team.",
        variant: "destructive",
      });
    }
  };
  // Helper function to fetch athlete match history (similar to AthletesSection)
  const fetchAthleteMatchHistory = async (studentId: number) => {
    try {
      setLoadingAthleteHistory(true);
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
            team:team_id (
              team_name
            )
          )
        `)
        .eq('student_id', studentId);

      if (error) throw error;      // Transform the data
      const transformedHistory = data?.map((item: any) => ({
        game_id: item.game_id,
        game_date: item.game?.game_date,
        start_time: item.game?.start_time,
        location: item.game?.location,
        game_status: item.game?.game_status,
        opponent_team: item.game?.opponent_team,
        team_name: item.game?.team?.team_name,
        stat_description: item.stat_description,
      })) || [];

      // Sort by game date in descending order (most recent first)
      transformedHistory.sort((a, b) => {
        if (!a.game_date || !b.game_date) return 0;
        return new Date(b.game_date).getTime() - new Date(a.game_date).getTime();
      });

      setAthleteMatchHistory(transformedHistory);
    } catch (error) {
      console.error("Error fetching athlete match history:", error);
      toast({
        title: "Error",
        description: "Failed to load athlete match history.",
        variant: "destructive",
      });
    } finally {
      setLoadingAthleteHistory(false);
    }
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

  const formatPlayerName = (athlete: Athlete) => {
    const middleInitial = athlete.mname ? ` ${athlete.mname.charAt(0)}.` : '';
    return `${athlete.fname}${middleInitial} ${athlete.lname}`;
  };
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {showGameDetails && selectedGame ? (
            // Game Details View
            <div className="space-y-6">
              {/* Header with Back Button */}
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowGameDetails(false);
                    setSelectedGame(null);
                    setGameParticipants([]);
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Schedule
                </Button>
                <h1 className="text-3xl font-bold text-forest">Game Details</h1>
              </div>

              {/* Game Information Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-maroon" />
                      <h2 className="text-2xl font-bold">Game #{selectedGame.game_id}</h2>
                    </div>
                    <Badge variant={
                      selectedGame.game_status === 'Win' || selectedGame.game_status === 'Completed'
                        ? 'default'
                        : selectedGame.game_status === 'Loss' || selectedGame.game_status === 'Cancelled'
                        ? 'destructive'
                        : 'secondary'
                    }>
                      {selectedGame.game_status || 'Scheduled'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Game Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Team</p>                        <p className="font-semibold cursor-pointer hover:text-maroon" 
                           onClick={() => handleTeamClick(selectedGame.team_id || '')}>
                          {selectedGame.team_name || 'Fighting Maroons'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Opponent</p>
                        <p className="font-semibold">{selectedGame.opponent_team || 'TBD'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Date & Time</p>
                        <p className="font-semibold">{formatDate(selectedGame.game_date)}</p>
                        <p className="text-sm text-gray-600">{formatTime(selectedGame.start_time)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Venue</p>
                        <p className="font-semibold">{selectedGame.location || 'TBD'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Team Players Section */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Participating Players
                    </h3>
                    
                    {loadingGameDetails ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Loading players...</span>
                      </div>
                    ) : gameParticipants.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No players assigned to this game yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gameParticipants.map((participant) => (
                          <Card 
                            key={participant.student_id} 
                            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-maroon"
                            onClick={() => handlePlayerClick(participant.athlete)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage 
                                    src={participant.athlete.image_url} 
                                    alt={formatPlayerName(participant.athlete)} 
                                  />
                                  <AvatarFallback>
                                    <User className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold hover:text-maroon">
                                    {formatPlayerName(participant.athlete)}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    ID: {participant.athlete.student_id}
                                  </p>
                                  {participant.athlete.course && (
                                    <p className="text-xs text-gray-500">
                                      {participant.athlete.course} - {participant.athlete.year_level}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {participant.stat_description && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-sm font-medium text-gray-700">Performance Notes:</p>
                                  <p className="text-sm text-gray-600 mt-1">{participant.stat_description}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Main Schedule View
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8 text-forest" />
                  <h1 className="text-3xl font-bold text-forest">Complete Game Schedule</h1>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-maroon hover:bg-maroon/90">
                  <Plus className="mr-1" /> Add Game
                </Button>
              </DialogTrigger>              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                  <DialogDescription>
                    Create a new game entry for the schedule. Select a team and optionally choose specific players to participate.
                  </DialogDescription>
                </DialogHeader>                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddGame)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="game_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. GAME004" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />                    <FormField
                      control={form.control}
                      name="team_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a team" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.team_id} value={team.team_id}>
                                  {team.team_name}
                                </SelectItem>
                              ))}                            </SelectContent>
                          </Select>                          <FormMessage />
                        </FormItem>
                      )}
                    />                    {/* Player Selection Section - Redesigned */}
                    {selectedTeamId && (
                      <div className="space-y-3">
                        <FormLabel>Select Players for this Game (Optional)</FormLabel>
                        
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search players by name or student ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            disabled={isLoading || athletes.length === 0}
                          />
                        </div>

                        {/* Athletes Grid */}
                        <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                          {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-sm text-gray-600">Loading athletes...</span>
                            </div>
                          ) : athletes.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500">No athletes found for this team.</p>
                            </div>
                          ) : filteredAthletes.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500">No athletes found matching your search.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {filteredAthletes.map((athlete) => {
                                const isSelected = selectedPlayers.includes(athlete.student_id);
                                return (
                                  <div
                                    key={athlete.student_id}
                                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                                      isSelected
                                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => handlePlayerToggle(athlete.student_id)}
                                  >
                                    <div className="flex items-center justify-between">                                      <div className="flex-1">
                                        <div className="font-medium text-sm">
                                          {athlete.lname}, {athlete.fname}{athlete.mname ? ` ${athlete.mname.charAt(0)}.` : ''}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Student ID: {athlete.student_id}
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        {isSelected ? (
                                          <Badge variant="default" className="text-xs">
                                            ✓ Selected
                                          </Badge>
                                        ) : (
                                          <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Selected Players Summary */}
                        {selectedPlayers.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                            <div className="text-sm font-medium text-blue-800 mb-2">
                              Selected Players ({selectedPlayers.length}):
                            </div>
                            <div className="flex flex-wrap gap-1">                              {getSelectedPlayersInfo().map((athlete) => (
                                <Badge 
                                  key={athlete.student_id} 
                                  variant="secondary" 
                                  className="text-xs bg-white"
                                >
                                  {athlete.lname}, {athlete.fname}{athlete.mname ? ` ${athlete.mname.charAt(0)}.` : ''}
                                  <button
                                    type="button"
                                    onClick={() => removePlayer(athlete.student_id)}
                                    className="ml-1 hover:text-red-600 text-gray-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="opponent_team"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opponent</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. University of San Carlos" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="game_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Venue</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. UP Cebu Gymnasium" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />                    </div>
                    
                    {/* Time-based Status Field */}
                    {(() => {
                      const gameDate = form.watch('game_date');
                      const startTime = form.watch('start_time');
                      const endTime = form.watch('end_time');
                      
                      if (!gameDate || !startTime || !endTime) {
                        // Default status selection when date/time not set
                        return (
                          <FormField
                            control={form.control}
                            name="game_status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      }                      const gameDateTime = new Date(`${gameDate}T${startTime}`);
                      const gameEndDateTime = new Date(`${gameDate}T${endTime}`);
                      const currentTime = new Date();
                      const timeStatus = getGameTimeStatus(gameDate, startTime, endTime);
                      const availableStatuses = getAvailableStatuses(timeStatus);

                      return (
                        <>
                          <FormField
                            control={form.control}
                            name="game_status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableStatuses.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />                          {/* Information Messages */}
                          {timeStatus === 'PRE_GAME' && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                              <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Game is scheduled for the future. Status will be set to "Scheduled".
                              </p>
                            </div>
                          )}

                          {timeStatus === 'DURING_GAME' && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                              <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Game is currently in progress. Status will be set to "Ongoing".
                              </p>
                            </div>
                          )}

                          {timeStatus === 'POST_GAME' && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                              <p className="text-sm text-green-800">
                                <strong>Note:</strong> Game time has passed. You can set the final status and add game statistics.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" className="bg-maroon hover:bg-maroon/90">Add Game</Button>
                    </div>                  </form>
                </Form>              </DialogContent>
            </Dialog>

            {/* Edit Game Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Game</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(handleUpdateGame)} className="space-y-4">
                    {editingGame && (() => {                      const gameDateTime = new Date(`${editingGame.game_date}T${editingGame.start_time}`);
                      const gameEndDateTime = new Date(`${editingGame.game_date}T${editingGame.end_time}`);
                      const currentTime = new Date();
                      const timeStatus = getGameTimeStatus(editingGame.game_date, editingGame.start_time, editingGame.end_time);
                      const canEditDetails = timeStatus === 'PRE_GAME';
                      const showStatusOnly = timeStatus === 'POST_GAME';

                      return (
                        <>
                          {canEditDetails && (
                            <>
                              {/* Game ID Field - Read Only */}
                              <FormField
                                control={editForm.control}
                                name="game_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Game ID</FormLabel>
                                    <FormControl>
                                      <Input {...field} disabled className="bg-gray-50" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Team Selection */}
                              <FormField
                                control={editForm.control}
                                name="team_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Team</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a team" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {teams.map((team) => (
                                          <SelectItem key={team.team_id} value={team.team_id}>
                                            {team.team_name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Opponent Team */}
                              <FormField
                                control={editForm.control}
                                name="opponent_team"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Opponent Team</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter opponent team name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Date and Times */}
                              <div className="grid grid-cols-3 gap-4">
                                <FormField
                                  control={editForm.control}
                                  name="game_date"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Game Date</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={editForm.control}
                                  name="start_time"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Start Time</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={editForm.control}
                                  name="end_time"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>End Time</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Location */}
                              <FormField
                                control={editForm.control}
                                name="location"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter game location" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Player Selection for PRE_GAME only */}
                              {watchedEditTeamId && (
                                <div className="space-y-4">
                                  <FormLabel>Select Players</FormLabel>
                                  <div className="border rounded-lg p-4 space-y-4">
                                    {/* Search Input */}
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                      <Input
                                        placeholder="Search players by name or student ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                      />
                                    </div>

                                    {/* Athletes Grid */}
                                    <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                                      {isLoading ? (
                                        <div className="flex justify-center py-8">
                                          <Loader2 className="h-6 w-6 animate-spin text-maroon" />
                                        </div>
                                      ) : filteredAthletes.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                          {filteredAthletes.map((athlete) => (
                                            <div
                                              key={athlete.student_id}
                                              className={`p-3 rounded border cursor-pointer transition-colors ${
                                                selectedPlayers.includes(athlete.student_id)
                                                  ? 'bg-maroon/10 border-maroon'
                                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                                              }`}
                                              onClick={() => handlePlayerToggle(athlete.student_id)}
                                            >
                                              <div className="flex items-center justify-between">                                                <div>
                                                  <div className="font-medium text-sm">
                                                    {athlete.fname} {athlete.lname}
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                    ID: {athlete.student_id}
                                                  </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                  selectedPlayers.includes(athlete.student_id)
                                                    ? 'bg-maroon border-maroon'
                                                    : 'border-gray-300'
                                                }`}>
                                                  {selectedPlayers.includes(athlete.student_id) && (
                                                    <Check className="h-3 w-3 text-white" />
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8 text-gray-500">
                                          {searchQuery ? 'No players found matching your search.' : 'No players available for this team.'}
                                        </div>
                                      )}
                                    </div>

                                    {/* Selected Players Summary */}
                                    {selectedPlayers.length > 0 && (
                                      <div className="bg-blue-50 p-3 rounded-md">
                                        <div className="text-sm font-medium text-blue-900 mb-2">
                                          Selected Players ({selectedPlayers.length}):
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedPlayers.map((studentId) => {
                                            const athlete = athletes.find(a => a.student_id === studentId);
                                            return athlete ? (                                              <span
                                                key={studentId}
                                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                              >
                                                {athlete.fname} {athlete.lname}
                                                <button
                                                  type="button"
                                                  onClick={() => handlePlayerToggle(studentId)}
                                                  className="ml-1 hover:text-blue-600"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </span>
                                            ) : null;
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Status Field - Always show but with different options based on time */}
                          <FormField
                            control={editForm.control}
                            name="game_status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Game Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select game status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {getAvailableStatuses(timeStatus).map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}                          />

                          {/* Information Messages */}
                          {timeStatus === 'DURING_GAME' && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                              <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> This game is currently in progress. Only status can be updated.
                              </p>
                            </div>
                          )}

                          {timeStatus === 'POST_GAME' && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                              <p className="text-sm text-blue-800">
                                <strong>Note:</strong> This game has ended. Only status and statistics can be updated.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" className="bg-maroon hover:bg-maroon/90">Update Game</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-maroon" />
            </div>
          ) : (
            <Card className="overflow-hidden">
              {games.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-maroon">
                      <TableHead className="text-white">Game ID</TableHead>
                      <TableHead className="text-white">Team</TableHead>
                      <TableHead className="text-white">Opponent</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Time</TableHead>
                      <TableHead className="text-white">Venue</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>                  <TableBody>
                    {games.map((game) => (
                      <TableRow 
                        key={game.game_id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleGameClick(game)}
                      >
                        <TableCell className="font-medium text-maroon">{game.game_id}</TableCell>
                        <TableCell>{game.team_name || 'Fighting Maroons'}</TableCell>
                        <TableCell>vs. {game.opponent_team}</TableCell>
                        <TableCell>{formatDate(game.game_date)}</TableCell>
                        <TableCell>{formatTime(game.start_time)}</TableCell>
                        <TableCell>{game.location || 'TBD'}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            game.game_status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : game.game_status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {game.game_status || 'Scheduled'}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditGame(game)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGame(game.game_id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (                <div className="text-center py-8">
                  <p className="text-gray-500">No games scheduled. Add a game to get started.</p>
                </div>
              )}
            </Card>
          )}            </>
          )}
        </div>
      </main>
      
      {/* Athlete Profile Modal */}
      {showAthleteProfile && selectedAthlete && (        <Dialog open={showAthleteProfile} onOpenChange={setShowAthleteProfile}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Athlete Profile</DialogTitle>
              <DialogDescription>
                View detailed information about this athlete including personal details, academic information, and match history.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Athlete Header */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-maroon to-maroon/80 text-white rounded-lg">
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
                  <h1 className="text-3xl font-bold">{formatName(selectedAthlete)}</h1>
                  <p className="text-xl text-white/90 mt-2">Fighting Maroons Athlete</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Student ID:</span>
                      <span>{selectedAthlete.student_id}</span>
                    </div>
                    {selectedAthlete.birthdate && (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">Birthdate:</span>
                          <span>{new Date(selectedAthlete.birthdate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">Age:</span>
                          <span>{calculateAge(selectedAthlete.birthdate)} years old</span>
                        </div>
                      </>
                    )}
                    {selectedAthlete.email && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Email:</span>
                        <span>{selectedAthlete.email}</span>
                      </div>
                    )}
                    {selectedAthlete.phone_number && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Phone:</span>
                        <span>{selectedAthlete.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="font-medium">Academic Information</span>
                  </h3>
                  <div className="space-y-3">
                    {selectedAthlete.department && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Department:</span>
                        <span>{selectedAthlete.department}</span>
                      </div>
                    )}
                    {selectedAthlete.course && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Course:</span>
                        <span>{selectedAthlete.course}</span>
                      </div>
                    )}
                    {selectedAthlete.year_level && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Year Level:</span>
                        <span>{selectedAthlete.year_level}</span>
                      </div>
                    )}
                    {selectedAthlete.block && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Block:</span>
                        <span>{selectedAthlete.block}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Match History Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Match History
                </h3>
                
                {loadingAthleteHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-maroon" />
                    <span className="ml-2">Loading match history...</span>
                  </div>
                ) : athleteMatchHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No match history available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {athleteMatchHistory.map((match, index) => (
                      <Card key={`${match.game_id}-${index}`} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">vs {match.opponent_team}</p>
                            <p className="text-sm text-gray-600">
                              {match.game_date && formatDate(match.game_date)} • {match.start_time && formatTime(match.start_time)}
                            </p>
                            <p className="text-sm text-gray-600">{match.location || 'TBD'}</p>
                            {match.stat_description && (
                              <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                                <strong>Performance:</strong> {match.stat_description}
                              </p>
                            )}
                          </div>
                          <Badge variant={
                            match.game_status === 'Win' ? 'default' :
                            match.game_status === 'Loss' ? 'destructive' : 'secondary'
                          }>
                            {match.game_status || 'Scheduled'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FullSchedule;
