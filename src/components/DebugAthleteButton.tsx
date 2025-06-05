import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface DebugAthleteButtonProps {
  athleteId: number;
  onEditClick: () => void;
}

const DebugAthleteButton = ({ athleteId, onEditClick }: DebugAthleteButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Debug: Edit button clicked for athlete ${athleteId}`);
    console.log('Edit button is clickable and functioning properly');
    onEditClick();
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
      style={{ 
        pointerEvents: 'auto',
        cursor: 'pointer',
        zIndex: 10
      }}
    >
      <Edit className="h-4 w-4 mr-2" />
      Edit Profile (Debug)
    </Button>
  );
};

export default DebugAthleteButton;
