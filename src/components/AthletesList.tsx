import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Search, Filter, Calendar, Edit, Trophy, X, User, ArrowLeft, SortAsc, SortDesc, ChevronDown, Mail, Phone, MapPin, GraduationCap, Hash, Building } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

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
  team_name?: string; // Keep for display purposes
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
  team_name?: string; // Keep for display purposes
  stat_description?: string;
};

type SortOption = "newest" | "oldest";
type FilterOption = "all" | "win" | "loss";

type Filters = {
  course: string;
  department: string;
  year_level: string;
  block: string;
  team_id: string;
  hometown: string;
};

type AthletesListProps = {
  onProfileViewChange?: (isProfileView: boolean) => void;
};

const AthletesList = ({ onProfileViewChange }: AthletesListProps) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Filter states
  const [filters, setFilters] = useState<Filters>({
    course: "all",
    department: "all",
    year_level: "all",
    block: "all",
    team_id: "all",
    hometown: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Athlete Profile States
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  
  // Match History States
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [editingStatDescription, setEditingStatDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [athleteToEdit, setAthleteToEdit] = useState<Athlete | null>(null);
  const [formData, setFormData] = useState<Athlete>({
    student_id: 0,
    fname: "",
    mname: "",
    lname: "",
    birthdate: "",
    hometown: "",
    email: "",
    phone_number: "",
    department: "",
    course: "",
    year_level: 0,
    block: "",
    team_id: "",
    team_name: "",
    image_url: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);

  // Get unique filter options
  const getUniqueOptions = (field: keyof Athlete) => {
    const options = athletes
      .map(athlete => athlete[field])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return options as string[];
  };

  // Get unique team options with both id and name
  const getUniqueTeamOptions = () => {
    const teams = athletes
      .filter(athlete => athlete.team_id && athlete.team_name)
      .map(athlete => ({ team_id: athlete.team_id!, team_name: athlete.team_name! }))
      .filter((team, index, self) => 
        self.findIndex(t => t.team_id === team.team_id) === index
      )
      .sort((a, b) => a.team_name.localeCompare(b.team_name));
    return teams;
  };
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
        .order('lname');
      
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
        description: "Failed to load athletes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = athletes.filter(athlete => {
      // Search term filter
      const fullName = `${athlete.lname}, ${athlete.fname} ${athlete.mname ? athlete.mname.charAt(0) + '.' : ''}`.toLowerCase();
      const searchMatch = searchTerm === "" || 
        fullName.includes(searchTerm.toLowerCase()) ||
        athlete.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.student_id.toString().includes(searchTerm);      // Individual filters
      const courseMatch = filters.course === "all" || athlete.course === filters.course;
      const departmentMatch = filters.department === "all" || athlete.department === filters.department;
      const yearLevelMatch = filters.year_level === "all" || athlete.year_level?.toString() === filters.year_level;
      const blockMatch = filters.block === "all" || athlete.block === filters.block;
      const teamMatch = filters.team_id === "all" || athlete.team_id === filters.team_id;
      const hometownMatch = filters.hometown === "all" || athlete.hometown === filters.hometown;

      return searchMatch && courseMatch && departmentMatch && yearLevelMatch && blockMatch && teamMatch && hometownMatch;
    });

    setFilteredAthletes(filtered);
  };  const clearFilters = () => {
    setFilters({
      course: "all",
      department: "all",
      year_level: "all",
      block: "all",
      team_id: "all",
      hometown: "all"
    });
    setSearchTerm("");
  };
  const handleAthleteClick = async (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setShowProfile(true);
    onProfileViewChange?.(true);
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

  const handleUpdateStatDescription = async (gameId: string, newDescription: string) => {
    if (!selectedAthlete) return;
    
    try {
      const { error } = await supabase
        .from('game_participation')
        .update({ stat_description: newDescription || null })
        .eq('game_id', gameId)
        .eq('student_id', selectedAthlete.student_id);
      
      if (error) throw error;
      
      // Update local state
      setMatchHistory(prev => prev.map(match => 
        match.game_id === gameId 
          ? { ...match, stat_description: newDescription || undefined }
          : match
      ));
      
      setEditingStatId(null);
      setEditingStatDescription("");
      
      toast({
        title: "Success",
        description: "Performance notes updated successfully.",
      });
    } catch (error) {
      console.error("Error updating stat description:", error);
      toast({
        title: "Error",
        description: "Failed to update performance notes.",
        variant: "destructive",
      });
    }
  };

  const getSortedAndFilteredMatches = () => {
    let filteredMatches = [...matchHistory];
    
    // Apply filter
    if (filterOption === "win") {
      filteredMatches = filteredMatches.filter(match => 
        match.game_status?.toLowerCase().includes('win') || 
        match.game_status?.toLowerCase().includes('won')
      );
    } else if (filterOption === "loss") {
      filteredMatches = filteredMatches.filter(match => 
        match.game_status?.toLowerCase().includes('loss') || 
        match.game_status?.toLowerCase().includes('lost')
      );
    }
    
    // Apply sort
    filteredMatches.sort((a, b) => {
      const dateA = new Date(`${a.game_date} ${a.start_time}`);
      const dateB = new Date(`${b.game_date} ${b.start_time}`);
      
      if (sortOption === "newest") {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });
    
    return filteredMatches;
  };

  const formatMatchDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMatchTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, athlete: Athlete) => {
    e.stopPropagation(); // Prevent triggering the card click
    setAthleteToDelete(athlete);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!athleteToDelete) return;

    try {
      const { error } = await supabase
        .from('athlete')
        .delete()
        .eq('student_id', athleteToDelete.student_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Athlete deleted successfully.",
      });

      // Refresh the athletes list
      fetchAthletes();
    } catch (error) {
      console.error("Error deleting athlete:", error);
      toast({
        title: "Error",
        description: "Failed to delete athlete.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAthleteToDelete(null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, athlete: Athlete) => {
    e.stopPropagation(); // Prevent triggering the card click
    setAthleteToEdit(athlete);
    setFormData({
      student_id: athlete.student_id,
      fname: athlete.fname,
      mname: athlete.mname || "",
      lname: athlete.lname,
      birthdate: athlete.birthdate || "",
      hometown: athlete.hometown || "",
      email: athlete.email || "",
      phone_number: athlete.phone_number || "",
      department: athlete.department || "",
      course: athlete.course || "",
      year_level: athlete.year_level || 0,
      block: athlete.block || "",
      team_id: athlete.team_id || "",
      team_name: athlete.team_name || "",
      image_url: athlete.image_url || ""
    });
    setEditDialogOpen(true);
    fetchTeams(); // Fetch teams when opening edit dialog
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setAthleteToEdit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.fname || !formData.lname) {
      toast({
        title: "Error",
        description: "Student ID, First Name, and Last Name are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const athleteData = {
        student_id: parseInt(formData.student_id.toString()),
        fname: formData.fname,
        mname: formData.mname || null,
        lname: formData.lname,
        birthdate: formData.birthdate || null,
        hometown: formData.hometown || null,
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        department: formData.department || null,
        course: formData.course || null,
        year_level: formData.year_level ? parseInt(formData.year_level.toString()) : null,
        block: formData.block || null,
        team_id: formData.team_id || null,
        image_url: formData.image_url || null
      };

      const { error } = await supabase
        .from('athlete')
        .update(athleteData)
        .eq('student_id', athleteToEdit?.student_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Athlete information updated successfully.",
      });

      // Refresh the athletes list
      fetchAthletes();
      handleEditClose();
    } catch (error) {
      console.error("Error updating athlete:", error);
      toast({
        title: "Error",
        description: "Failed to update athlete information.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelected = (url: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: url
    }));
  };

  const handleInputChange = (field: keyof Athlete, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('team_id, team_name');
      
      if (error) throw error;
      
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams.",
        variant: "destructive",
      });
    }
  };

  // Add event listener for athlete addition
  useEffect(() => {
    const handleAthleteAdded = () => {
      fetchAthletes();
    };

    window.addEventListener('athleteAdded', handleAthleteAdded);

    return () => {
      window.removeEventListener('athleteAdded', handleAthleteAdded);
    };
  }, []);

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, athletes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading athletes...</span>
      </div>
    );
  }

  // Show athlete profile page
  if (showProfile && selectedAthlete) {
    return (
      <div className="space-y-6">
        {/* Back button */}        <Button
          variant="outline"
          onClick={() => {
            setShowProfile(false);
            setSelectedAthlete(null);
            onProfileViewChange?.(false);
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Athletes List
        </Button>

        {/* Athlete Profile */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-maroon to-maroon/80 text-white">
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
                  <h1 className="text-3xl font-bold">{formatName(selectedAthlete)}</h1>
                  {selectedAthlete.team_name && (
                    <p className="text-xl text-white/90 mt-2">{selectedAthlete.team_name}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Match History
                  </h3>
                  
                  <div className="flex gap-4 items-center">
                    <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Most Recent</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterOption} onValueChange={(value: FilterOption) => setFilterOption(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Matches</SelectItem>
                        <SelectItem value="win">Wins Only</SelectItem>
                        <SelectItem value="loss">Losses Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loadingHistory ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading match history...</span>
                  </div>
                ) : getSortedAndFilteredMatches().length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      {filterOption === "all" 
                        ? "No match history found for this athlete." 
                        : `No ${filterOption === "win" ? "wins" : "losses"} found for this athlete.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getSortedAndFilteredMatches().map((match) => (
                      <Card key={match.game_id} className="border-l-4 border-l-maroon">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-lg">Game #{match.game_id}</h4>
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
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <p><strong>Date:</strong> {formatMatchDate(match.game_date)}</p>
                                <p><strong>Time:</strong> {formatMatchTime(match.start_time)}</p>
                                {match.opponent_team && <p><strong>Opponent:</strong> {match.opponent_team}</p>}
                                {match.location && <p><strong>Location:</strong> {match.location}</p>}
                                {match.team_name && <p><strong>Team:</strong> {match.team_name}</p>}
                              </div>
                            </div>
                            
                            <div className="flex-1 max-w-md">
                              <Label className="text-sm font-medium">Performance Notes:</Label>
                              {editingStatId === match.game_id ? (
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    value={editingStatDescription}
                                    onChange={(e) => setEditingStatDescription(e.target.value)}
                                    placeholder="Add performance notes..."
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatDescription(match.game_id, editingStatDescription)}
                                    className="bg-maroon hover:bg-maroon/90"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingStatId(null);
                                      setEditingStatDescription("");
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-gray-600 flex-1 min-h-[32px] px-3 py-1 bg-gray-50 rounded border">
                                    {match.stat_description || "No performance notes yet"}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingStatId(match.game_id);
                                      setEditingStatDescription(match.stat_description || "");
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search athletes by name, team, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="course-filter">Course</Label>
                <Select value={filters.course} onValueChange={(value) => setFilters({...filters, course: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All courses</SelectItem>
                    {getUniqueOptions('course').map((course) => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department-filter">Department</Label>
                <Select value={filters.department} onValueChange={(value) => setFilters({...filters, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {getUniqueOptions('department').map((department) => (
                      <SelectItem key={department} value={department}>{department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year-filter">Year Level</Label>
                <Select value={filters.year_level} onValueChange={(value) => setFilters({...filters, year_level: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {getUniqueOptions('year_level').map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="block-filter">Block</Label>
                <Select value={filters.block} onValueChange={(value) => setFilters({...filters, block: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All blocks" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All blocks</SelectItem>
                    {getUniqueOptions('block').map((block) => (
                      <SelectItem key={block} value={block}>{block}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>              <div>
                <Label htmlFor="team-filter">Team</Label>
                <Select value={filters.team_id} onValueChange={(value) => setFilters({...filters, team_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All teams</SelectItem>
                    {getUniqueTeamOptions().map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id}>{team.team_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hometown-filter">Hometown</Label>
                <Select value={filters.hometown} onValueChange={(value) => setFilters({...filters, hometown: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All hometowns" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All hometowns</SelectItem>
                    {getUniqueOptions('hometown').map((hometown) => (
                      <SelectItem key={hometown} value={hometown}>{hometown}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAthletes.length} of {athletes.length} athletes
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Athlete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {athleteToDelete ? formatName(athleteToDelete) : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleEditClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Athlete</DialogTitle>
            <DialogDescription>
              Update the athlete's information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Athlete Photo</Label>
              <ImageUpload 
                onImageSelected={handleImageSelected}
                bucketName="athlete-images"
                initialImage={athleteToEdit?.image_url}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  type="number"
                  placeholder="e.g., 2021001"
                  value={formData.student_id}
                  onChange={(e) => handleInputChange("student_id", e.target.value)}
                  required
                  disabled={!!athleteToEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_id">Team</Label>
                <Select value={formData.team_id} onValueChange={(value) => handleInputChange("team_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fname">First Name *</Label>
                <Input
                  id="fname"
                  placeholder="Juan"
                  value={formData.fname}
                  onChange={(e) => handleInputChange("fname", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mname">Middle Name</Label>
                <Input
                  id="mname"
                  placeholder="Miguel"
                  value={formData.mname}
                  onChange={(e) => handleInputChange("mname", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last Name *</Label>
                <Input
                  id="lname"
                  placeholder="Cruz"
                  value={formData.lname}
                  onChange={(e) => handleInputChange("lname", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => handleInputChange("birthdate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hometown">Hometown</Label>
                <Input
                  id="hometown"
                  placeholder="Cebu City"
                  value={formData.hometown}
                  onChange={(e) => handleInputChange("hometown", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.cruz@up.edu.ph"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="09171234567"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="CAS"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  placeholder="BS Math"
                  value={formData.course}
                  onChange={(e) => handleInputChange("course", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_level">Year Level</Label>
                <Input
                  id="year_level"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="3"
                  value={formData.year_level}
                  onChange={(e) => handleInputChange("year_level", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block">Block</Label>
                <Input
                  id="block"
                  placeholder="A"
                  maxLength={1}
                  value={formData.block}
                  onChange={(e) => handleInputChange("block", e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleEditClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-maroon hover:bg-maroon/90" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Athletes List */}
      {filteredAthletes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {searchTerm || Object.values(filters).some(f => f !== "all") ? "No athletes found matching your criteria." : "No athletes found."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAthletes.map((athlete) => (
            <Card 
              key={athlete.student_id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAthleteClick(athlete)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={athlete.image_url || ""} 
                        alt={formatName(athlete)}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-maroon text-white">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg font-maroons-strong">{formatName(athlete)}</h3>
                      <p className="text-sm text-gray-600">ID: {athlete.student_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {athlete.team_name && (
                        <Badge variant="secondary" className="mb-1">
                          {athlete.team_name}
                        </Badge>
                      )}
                      <p className="text-sm text-gray-600">
                        {athlete.course && athlete.year_level ? `${athlete.course} - Year ${athlete.year_level}` : athlete.course || ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-maroon hover:text-maroon/90 hover:bg-maroon/10"
                        onClick={(e) => handleEditClick(e, athlete)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDeleteClick(e, athlete)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AthletesList;
