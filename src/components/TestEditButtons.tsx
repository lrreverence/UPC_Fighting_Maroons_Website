import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditAthleteForm from "@/components/EditAthleteForm";

const TestEditButtons = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Mock athlete data for testing
  const mockAthlete = {
    student_id: 123456,
    fname: "Test",
    mname: "User",
    lname: "Athlete",
    team_name: "Test Team",
    course: "Computer Science",
    year_level: 3,
    image_url: "",
    birthdate: "2000-01-01",
    hometown: "Test City",
    email: "test@test.com",
    phone_number: "+63 912 345 6789",
    department: "Test Department",
    block: "A",
    team_id: "test-team-id"
  };

  const testButtonClick = () => {
    console.log("Test button clicked successfully!");
    alert("Edit button is working! This proves the button functionality is correct.");
    setShowEditForm(true);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-maroon">Edit Button Functionality Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simple Test Button */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Simple Edit Button Test</h3>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testButtonClick}
              variant="outline"
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Click Me to Test Edit
            </Button>
          </CardContent>
        </Card>

        {/* Athlete Profile Style Test */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-maroon to-maroon/80 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 ring-4 ring-white/20">
                <AvatarImage 
                  src={mockAthlete.image_url || ""} 
                  alt="Test Athlete"
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">Test User Athlete</h1>
                <p className="text-xl text-white/90 mt-2">Test Team</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={testButtonClick}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  style={{ zIndex: 10, pointerEvents: 'auto' }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => alert("Alternative button working!")}
                  variant="outline"
                  className="bg-red-500/20 border-red-300/20 text-white hover:bg-red-500/30 hover:text-white"
                >
                  Test Alt
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600">
              This card mimics the athlete profile layout. Both edit buttons above should be clickable.
              If the regular edit button doesn't work but the "Test Alt" button does, there might be a CSS issue.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Test Instructions</h3>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click both edit buttons above to test functionality</li>
            <li>Check the browser console for any JavaScript errors</li>
            <li>Verify that the EditAthleteForm opens when clicked</li>
            <li>If buttons are not clickable, check for CSS z-index issues or overlapping elements</li>
          </ol>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {showEditForm && (
        <EditAthleteForm
          athlete={mockAthlete}
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onAthleteUpdated={() => {
            console.log("Athlete updated successfully!");
            setShowEditForm(false);
          }}
        />
      )}
    </div>
  );
};

export default TestEditButtons;
