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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

type Team = {
  team_name: string;
  sport: string;
  coach_name: string;
};

const AddAthleteForm = () => {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [formData, setFormData] = useState({
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
        student_id: parseInt(formData.student_id),
        fname: formData.fname,
        mname: formData.mname || null,
        lname: formData.lname,
        birthdate: formData.birthdate || null,
        hometown: formData.hometown || null,
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        department: formData.department || null,
        course: formData.course || null,
        year_level: formData.year_level ? parseInt(formData.year_level) : null,
        block: formData.block || null,
        team_name: formData.team_name || null,
        image_url: selectedImageUrl || null,
      };

      const { error } = await supabase
        .from('athlete')
        .insert([athleteData]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Athlete added successfully.",
      });
      
      // Reset form
      setFormData({
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
      setSelectedImageUrl("");
      setOpen(false);
      
      // Refresh the page to show new athlete
      window.location.reload();
    } catch (error) {
      console.error("Error adding athlete:", error);
      toast({
        title: "Error",
        description: "Failed to add athlete.",
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-maroon hover:bg-maroon/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Athlete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Athlete</DialogTitle>
          <DialogDescription>
            Fill in the athlete's information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Athlete Photo</Label>
            <ImageUpload 
              onImageSelected={handleImageSelected}
              bucketName="athlete-images"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_name">Team</Label>
              <Select value={formData.team_name} onValueChange={(value) => handleInputChange("team_name", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon/90" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Athlete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAthleteForm;
