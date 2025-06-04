
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Search, User } from "lucide-react";

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

const AthletesList = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    fetchAthletes();
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
      )}
    </div>
  );
};

export default AthletesList;
