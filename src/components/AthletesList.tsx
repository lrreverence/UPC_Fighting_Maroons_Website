
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Search, User, Trash2, Edit } from "lucide-react";
import ImageUpload from "./ImageUpload";

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

const AthletesList = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [editFormData, setEditFormData] = useState({
    student_id: "",
    fname: "",
    mname: "",
    lname: "",
    birthdate: "",
    hometown: "",
    email: "",
    phone_number: "",
    department: "",
    course: "",
    year_level: "",
    block: "",
    team_name: "",
  });

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('athlete')
        .select('*')
        .order('lname');
      
      if (error) throw error;
      
      setAthletes(data || []);
      setFilteredAthletes(data || []);
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
  const deleteAthlete = async (studentId: number) => {
    try {
      setDeletingId(studentId);
      
      const { error } = await supabase
        .from('athlete')
        .delete()
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      // Update local state
      const updatedAthletes = athletes.filter(athlete => athlete.student_id !== studentId);
      setAthletes(updatedAthletes);
      setFilteredAthletes(updatedAthletes.filter(athlete => {
        const fullName = `${athlete.fname} ${athlete.mname || ''} ${athlete.lname}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return (
          fullName.includes(searchLower) ||
          athlete.team_name?.toLowerCase().includes(searchLower) ||
          athlete.course?.toLowerCase().includes(searchLower) ||
          athlete.department?.toLowerCase().includes(searchLower) ||
          athlete.student_id.toString().includes(searchTerm)
        );
      }));
      
      toast({
        title: "Success",
        description: "Athlete deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting athlete:", error);
      toast({
        title: "Error",
        description: "Failed to delete athlete.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('team_name');
      
      if (error) throw error;
      
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };  const handleEditAthlete = (athlete: Athlete) => {
    // Set the editing athlete first
    setEditingAthlete(athlete);
    
    // Set the image URL
    setSelectedImageUrl(athlete.image_url || "");
      // Set form data
    setEditFormData({
      student_id: athlete.student_id?.toString() || "",
      fname: athlete.fname || "",
      mname: athlete.mname || "",
      lname: athlete.lname || "",
      birthdate: athlete.birthdate || "",
      hometown: athlete.hometown || "",
      email: athlete.email || "",
      phone_number: athlete.phone_number || "",
      department: athlete.department || "",
      course: athlete.course || "",
      year_level: athlete.year_level?.toString() || "",
      block: athlete.block || "",
      team_name: athlete.team_name || "",
    });    
    // Open the dialog
    setIsEditDialogOpen(true);
  };

  const handleUpdateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;

    try {
      setIsSubmitting(true);
      
      const updateData = {
        fname: editFormData.fname,
        mname: editFormData.mname || null,
        lname: editFormData.lname,
        birthdate: editFormData.birthdate || null,
        hometown: editFormData.hometown || null,
        email: editFormData.email || null,
        phone_number: editFormData.phone_number || null,
        department: editFormData.department || null,
        course: editFormData.course || null,
        year_level: editFormData.year_level ? parseInt(editFormData.year_level) : null,
        block: editFormData.block || null,
        team_name: editFormData.team_name || null,
        image_url: selectedImageUrl || null,
      };

      const { error } = await supabase
        .from('athlete')
        .update(updateData)
        .eq('student_id', editingAthlete.student_id);

      if (error) throw error;

      // Update local state
      const updatedAthletes = athletes.map(athlete =>
        athlete.student_id === editingAthlete.student_id
          ? { ...athlete, ...updateData }
          : athlete
      );
      setAthletes(updatedAthletes);
      
      // Apply search filter to updated athletes
      const filtered = updatedAthletes.filter(athlete => {
        const fullName = `${athlete.fname} ${athlete.mname || ''} ${athlete.lname}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return (
          fullName.includes(searchLower) ||
          athlete.team_name?.toLowerCase().includes(searchLower) ||
          athlete.course?.toLowerCase().includes(searchLower) ||
          athlete.department?.toLowerCase().includes(searchLower) ||
          athlete.student_id.toString().includes(searchTerm)
        );
      });
      setFilteredAthletes(filtered);

      setIsEditDialogOpen(false);
      setEditingAthlete(null);
      setSelectedImageUrl("");
      
      toast({
        title: "Success",
        description: "Athlete updated successfully.",
      });
    } catch (error) {
      console.error("Error updating athlete:", error);
      toast({
        title: "Error",
        description: "Failed to update athlete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelected = (url: string) => {
    setSelectedImageUrl(url);
  };
  useEffect(() => {
    fetchAthletes();
    fetchTeams();
  }, []);

  useEffect(() => {
    const filtered = athletes.filter(athlete => {
      const fullName = `${athlete.fname} ${athlete.mname || ''} ${athlete.lname}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        athlete.team_name?.toLowerCase().includes(searchLower) ||
        athlete.course?.toLowerCase().includes(searchLower) ||
        athlete.department?.toLowerCase().includes(searchLower) ||
        athlete.student_id.toString().includes(searchTerm)
      );
    });
    
    setFilteredAthletes(filtered);
  }, [searchTerm, athletes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading athletes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search athletes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAthletes.length} of {athletes.length} athletes
      </div>

      {/* Athletes grid */}
      {filteredAthletes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {searchTerm ? "No athletes found matching your search." : "No athletes found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => (
            <Card key={athlete.student_id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
              <CardContent className="p-6">                {/* Edit and Delete buttons */}
                <div className="absolute top-4 right-4 flex gap-2">                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"                    onClick={() => {
                      handleEditAthlete(athlete);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === athlete.student_id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Athlete</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {athlete.fname} {athlete.lname}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAthlete(athlete.student_id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Larger athlete photo at the top */}
                <div className="flex justify-center mb-6">
                  <Avatar className="h-32 w-32 ring-4 ring-maroon/20">
                    <AvatarImage 
                      src={athlete.image_url || ""} 
                      alt={`${athlete.fname} ${athlete.lname}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-maroon text-white text-2xl">
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Athlete name and team */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {athlete.fname} {athlete.mname ? `${athlete.mname} ` : ''}{athlete.lname}
                  </h3>
                  {athlete.team_name && (
                    <p className="text-sm text-maroon font-medium">{athlete.team_name}</p>
                  )}
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
          ))}        </div>
      )}      {/* Edit Dialog */}<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Athlete</DialogTitle>
            <DialogDescription>
              Update the athlete's information below.
            </DialogDescription>
          </DialogHeader>
          {editingAthlete && (
            <form onSubmit={handleUpdateAthlete} className="space-y-4">              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Athlete Photo</Label>
                {editingAthlete && (
                  <ImageUpload 
                    onImageSelected={handleImageSelected}
                    initialImage={selectedImageUrl || ""}
                    bucketName="athlete-images"
                  />
                )}
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-student_id">Student ID *</Label>
                <Input
                  id="edit-student_id"
                  type="number"
                  placeholder="e.g., 2021001"
                  value={editFormData.student_id}
                  onChange={(e) => handleInputChange("student_id", e.target.value)}
                  disabled
                />
              </div>              <div className="space-y-2">
                <Label htmlFor="edit-team_name">Team</Label>                <Select 
                  value={editFormData.team_name || "no-team"} 
                  onValueChange={(value) => handleInputChange("team_name", value === "no-team" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-team">No Team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.team_name} value={team.team_name}>
                        {team.team_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fname">First Name *</Label>
                <Input
                  id="edit-fname"
                  placeholder="Juan"
                  value={editFormData.fname}
                  onChange={(e) => handleInputChange("fname", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mname">Middle Name</Label>
                <Input
                  id="edit-mname"
                  placeholder="Miguel"
                  value={editFormData.mname}
                  onChange={(e) => handleInputChange("mname", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lname">Last Name *</Label>
                <Input
                  id="edit-lname"
                  placeholder="Cruz"
                  value={editFormData.lname}
                  onChange={(e) => handleInputChange("lname", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-birthdate">Birthdate</Label>
                <Input
                  id="edit-birthdate"
                  type="date"
                  value={editFormData.birthdate}
                  onChange={(e) => handleInputChange("birthdate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hometown">Hometown</Label>
                <Input
                  id="edit-hometown"
                  placeholder="Cebu City"
                  value={editFormData.hometown}
                  onChange={(e) => handleInputChange("hometown", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="juan.cruz@up.edu.ph"
                  value={editFormData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone_number">Phone Number</Label>
                <Input
                  id="edit-phone_number"
                  placeholder="09171234567"
                  value={editFormData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  placeholder="CAS"
                  value={editFormData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course">Course</Label>
                <Input
                  id="edit-course"
                  placeholder="BS Math"
                  value={editFormData.course}
                  onChange={(e) => handleInputChange("course", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year_level">Year Level</Label>
                <Input
                  id="edit-year_level"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="3"
                  value={editFormData.year_level}
                  onChange={(e) => handleInputChange("year_level", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-block">Block</Label>
                <Input
                  id="edit-block"
                  placeholder="A"
                  maxLength={1}
                  value={editFormData.block}
                  onChange={(e) => handleInputChange("block", e.target.value)}
                />
              </div>
            </div>            <DialogFooter>              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingAthlete(null);
                  setSelectedImageUrl("");
                }} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-maroon hover:bg-maroon/90" disabled={isSubmitting || !editFormData.fname || !editFormData.lname}>
                {isSubmitting ? "Updating..." : "Update Athlete"}
              </Button>
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthletesList;
