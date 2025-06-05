import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  DialogTrigger,
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
import { Search, Filter, Calendar, Edit, Trophy, X, User, ArrowLeft, SortAsc, SortDesc, ChevronDown, Mail, Phone, MapPin, GraduationCap, Hash, Building, Edit2, Trash2 } from "lucide-react";

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
  isAdminMode?: boolean;
};

const AthletesList = ({ onProfileViewChange, isAdminMode = false }: AthletesListProps) => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedAthlete, setEditedAthlete] = useState<Partial<Athlete>>({});

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
      
      const transformedData = data?.map((athlete: any) => ({
        ...athlete,
        team_name: athlete.team?.team_name
      })) || [];
      
      setAthletes(transformedData);
      setFilteredAthletes(transformedData);
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
  };

  const clearFilters = () => {
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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = athletes.filter(athlete => {
      const fullName = `${athlete.fname} ${athlete.mname || ''} ${athlete.lname}`.toLowerCase();
      return fullName.includes(value.toLowerCase()) ||
        athlete.student_id.toString().includes(value) ||
        athlete.team_name?.toLowerCase().includes(value.toLowerCase());
    });
    setFilteredAthletes(filtered);
  };

  const handleEdit = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setEditedAthlete(athlete);
    setIsEditing(true);
  };

  const handleDelete = async (athlete: Athlete) => {
    setAthleteToDelete(athlete);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
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

  const handleSaveEdit = async () => {
    if (!selectedAthlete || !editedAthlete) return;

    try {
      const { error } = await supabase
        .from('athlete')
        .update(editedAthlete)
        .eq('student_id', selectedAthlete.student_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Athlete updated successfully.",
      });

      fetchAthletes();
      setIsEditing(false);
      setSelectedAthlete(null);
      setEditedAthlete({});
    } catch (error) {
      console.error("Error updating athlete:", error);
      toast({
        title: "Error",
        description: "Failed to update athlete.",
        variant: "destructive",
      });
    }
  };

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
        <Button
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

        <Card>
          <CardHeader className="bg-gradient-to-r from-maroon to-maroon/80 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAthlete.image_url || ""} alt={`${selectedAthlete.fname} ${selectedAthlete.lname}`} />
                  <AvatarFallback className="bg-white/20 text-white">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedAthlete.fname} {selectedAthlete.mname ? `${selectedAthlete.mname} ` : ''}{selectedAthlete.lname}
                  </h2>
                  <p className="text-white/80">ID: {selectedAthlete.student_id}</p>
                </div>
              </div>
              {isAdminMode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20"
                    onClick={() => handleEdit(selectedAthlete)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20"
                    onClick={() => handleDelete(selectedAthlete)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Birthdate:</span> {selectedAthlete.birthdate || 'N/A'}</p>
                  <p><span className="font-medium">Hometown:</span> {selectedAthlete.hometown || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {selectedAthlete.email || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAthlete.phone_number || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Academic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Department:</span> {selectedAthlete.department || 'N/A'}</p>
                  <p><span className="font-medium">Course:</span> {selectedAthlete.course || 'N/A'}</p>
                  <p><span className="font-medium">Year Level:</span> {selectedAthlete.year_level || 'N/A'}</p>
                  <p><span className="font-medium">Block:</span> {selectedAthlete.block || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search athletes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {filteredAthletes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {searchTerm ? "No athletes found matching your search." : "No athletes found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => (
            <Card
              key={athlete.student_id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedAthlete(athlete);
                setShowProfile(true);
                onProfileViewChange?.(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={athlete.image_url || ""} alt={`${athlete.fname} ${athlete.lname}`} />
                    <AvatarFallback className="bg-maroon text-white">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {athlete.fname} {athlete.mname ? `${athlete.mname} ` : ''}{athlete.lname}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {athlete.student_id}</p>
                    {athlete.team_name && (
                      <p className="text-sm text-maroon">{athlete.team_name}</p>
                    )}
                  </div>
                  {isAdminMode && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(athlete);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(athlete);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Athlete</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  value={editedAthlete.fname || ''}
                  onChange={(e) => setEditedAthlete({ ...editedAthlete, fname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  value={editedAthlete.lname || ''}
                  onChange={(e) => setEditedAthlete({ ...editedAthlete, lname: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedAthlete.email || ''}
                onChange={(e) => setEditedAthlete({ ...editedAthlete, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editedAthlete.phone_number || ''}
                onChange={(e) => setEditedAthlete({ ...editedAthlete, phone_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={editedAthlete.department || ''}
                  onChange={(e) => setEditedAthlete({ ...editedAthlete, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={editedAthlete.course || ''}
                  onChange={(e) => setEditedAthlete({ ...editedAthlete, course: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Athlete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this athlete? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthletesList;
