import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

type Team = {
  team_id: string;
  team_name: string;
  sport: string;
  coach_name: string;
};

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
  image_url?: string;
};

type EditAthleteFormProps = {
  athlete: Athlete;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAthleteUpdated?: () => void;
};

const EditAthleteForm = ({ athlete, open, onOpenChange, onAthleteUpdated }: EditAthleteFormProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(athlete.image_url || "");
  const [formData, setFormData] = useState({
    student_id: athlete.student_id.toString(),
    fname: athlete.fname,
    mname: athlete.mname || "",
    lname: athlete.lname,
    birthdate: athlete.birthdate || "",
    hometown: athlete.hometown || "",
    email: athlete.email || "",
    phone_number: athlete.phone_number || "",
    department: athlete.department || "",
    course: athlete.course || "",
    year_level: athlete.year_level?.toString() || "",
    block: athlete.block || "",
    team_id: athlete.team_id || "",
  });

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('team_name');
      
      if (error) throw error;
      
      setTeams(data as Team[]);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);
  // Update form data when athlete prop changes
  useEffect(() => {
    setFormData({
      student_id: athlete.student_id.toString(),
      fname: athlete.fname,
      mname: athlete.mname || "",
      lname: athlete.lname,
      birthdate: athlete.birthdate || "",
      hometown: athlete.hometown || "",
      email: athlete.email || "",
      phone_number: athlete.phone_number || "",
      department: athlete.department || "",
      course: athlete.course || "",
      year_level: athlete.year_level?.toString() || "0",
      block: athlete.block || "",
      team_id: athlete.team_id || "none",
    });
    setSelectedImageUrl(athlete.image_url || "");
  }, [athlete]);

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
    
    try {      const athleteData = {
        fname: formData.fname,
        mname: formData.mname || null,
        lname: formData.lname,
        birthdate: formData.birthdate || null,
        hometown: formData.hometown || null,
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        department: formData.department || null,
        course: formData.course || null,
        year_level: formData.year_level && formData.year_level !== "0" ? parseInt(formData.year_level) : null,
        block: formData.block || null,
        team_id: formData.team_id && formData.team_id !== "none" ? formData.team_id : null,
        image_url: selectedImageUrl || null,
      };

      const { error } = await supabase
        .from('athlete')
        .update(athleteData)
        .eq('student_id', athlete.student_id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Athlete updated successfully.",
      });

      onOpenChange(false);
      onAthleteUpdated?.();
      
      // Dispatch custom event to refresh athlete lists
      window.dispatchEvent(new CustomEvent('athleteUpdated'));
      
    } catch (error) {
      console.error("Error updating athlete:", error);
      toast({
        title: "Error",
        description: "Failed to update athlete.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelected = (url: string) => {
    setSelectedImageUrl(url);
  };  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        style={{ zIndex: 60 }}
      >
        <DialogHeader>
          <DialogTitle>Edit Athlete Information</DialogTitle>
          <DialogDescription>
            Update the athlete's information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Athlete Photo</Label>            <ImageUpload 
              onImageSelected={handleImageSelected}
              bucketName="athlete-images"
              initialImage={selectedImageUrl}
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
                disabled // Student ID should not be editable
                className="bg-gray-100"
              />
            </div>            <div className="space-y-2">
              <Label htmlFor="team_id">Team</Label>
              <Select
                name="team_id"
                value={formData.team_id}
                onValueChange={(value) => handleInputChange("team_id", value)}
              >                <SelectTrigger id="team_id">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 70 }}>
                  <SelectItem value="none">No Team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.team_id} value={team.team_id}>
                      {team.team_name} ({team.sport})
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
                placeholder="De la Cruz"
                value={formData.mname}
                onChange={(e) => handleInputChange("mname", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lname">Last Name *</Label>
              <Input
                id="lname"
                placeholder="Santos"
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
                placeholder="Manila, Philippines"
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
                placeholder="juan.santos@upc.edu.ph"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="+63 912 345 6789"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="College of Engineering"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                placeholder="Computer Science"
                value={formData.course}
                onChange={(e) => handleInputChange("course", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">            <div className="space-y-2">
              <Label htmlFor="year_level">Year Level</Label>
              <Select
                name="year_level"
                value={formData.year_level}
                onValueChange={(value) => handleInputChange("year_level", value)}
              >                <SelectTrigger id="year_level">
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 70 }}>
                  <SelectItem value="0">Not specified</SelectItem>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                  <SelectItem value="5">5th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="block">Block</Label>
              <Input
                id="block"
                placeholder="A"
                value={formData.block}
                onChange={(e) => handleInputChange("block", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-maroon hover:bg-maroon/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Athlete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAthleteForm;
