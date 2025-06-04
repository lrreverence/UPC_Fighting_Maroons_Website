import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";

const sampleTeams = [
  {
    team_id: 'BBL001',
    team_name: 'UPC Fighting Maroons Basketball',
    sport: 'Basketball',
    coach_name: 'Coach Rodriguez'
  },
  {
    team_id: 'VBL001',
    team_name: 'UPC Fighting Maroons Volleyball',
    sport: 'Volleyball',
    coach_name: 'Coach Santos'
  },
  {
    team_id: 'TBL001',
    team_name: 'UPC Fighting Maroons Table Tennis',
    sport: 'Table Tennis',
    coach_name: 'Coach Dela Cruz'
  },
  {
    team_id: 'CHE001',
    team_name: 'UPC Fighting Maroons Chess',
    sport: 'Chess',
    coach_name: 'Coach Garcia'
  },
  {
    team_id: 'BAD001',
    team_name: 'UPC Fighting Maroons Badminton',
    sport: 'Badminton',
    coach_name: 'Coach Reyes'
  },
  {
    team_id: 'SWM001',
    team_name: 'UPC Fighting Maroons Swimming',
    sport: 'Swimming',
    coach_name: 'Coach Torres'
  },
  {
    team_id: 'TRK001',
    team_name: 'UPC Fighting Maroons Track and Field',
    sport: 'Track and Field',
    coach_name: 'Coach Mendoza'
  }
];

const InitializeTeamsButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInitializeTeams = async () => {
    setIsLoading(true);
    
    try {
      // First check if teams already exist
      const { data: existingTeams, error: selectError } = await supabase
        .from('team')
        .select('team_id');
      
      if (selectError) {
        console.error('Error checking teams:', selectError);
        toast({
          title: "Error",
          description: "Failed to check existing teams.",
          variant: "destructive",
        });
        return;
      }
      
      if (existingTeams && existingTeams.length > 0) {
        toast({
          title: "Teams Already Exist",
          description: `Found ${existingTeams.length} teams in the database.`,
        });
        return;
      }
      
      // Insert sample teams
      const { data, error } = await supabase
        .from('team')
        .insert(sampleTeams)
        .select();
      
      if (error) {
        console.error('Error inserting teams:', error);
        
        if (error.code === '42501') {
          toast({
            title: "Permission Error",
            description: "Unable to insert teams due to database permissions. Please contact your database administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to insert sample teams.",
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Success",
        description: `Successfully inserted ${data.length} sample teams.`,
      });
      
      // Refresh the page to reload teams data
      window.location.reload();
      
    } catch (err) {
      console.error('Initialize teams error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleInitializeTeams}
      disabled={isLoading}
      variant="outline"
      className="border-maroon text-maroon hover:bg-maroon hover:text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Initialize Sample Teams
        </>
      )}
    </Button>
  );
};

export default InitializeTeamsButton;
