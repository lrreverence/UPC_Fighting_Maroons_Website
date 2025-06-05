import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, User, CheckCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditAthleteForm from "@/components/EditAthleteForm";

const TestEditButtons = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  
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

  const handleEditClick = () => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `✅ Edit button clicked at ${timestamp}`]);
    setShowEditForm(true);
    console.log("Edit button clicked successfully - form should open");
  };

  const handleFormClose = () => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `✅ Edit form closed at ${timestamp}`]);
    setShowEditForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Edit Button Functionality Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Button 1: Direct button test */}
              <div className="space-y-2">
                <h3 className="font-semibold">Test 1: Direct Edit Button</h3>
                <Button
                  onClick={handleEditClick}
                  variant="outline"
                  className="bg-white border-maroon text-maroon hover:bg-maroon hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Test Edit Button
                </Button>
              </div>

              {/* Test Button 2: Styled like athlete profile */}
              <div className="space-y-2">
                <h3 className="font-semibold">Test 2: Athlete Profile Style Button</h3>
                <div className="p-4 bg-gradient-to-r from-maroon to-maroon/80 text-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" alt="Test Athlete" />
                        <AvatarFallback className="bg-white/20 text-white">
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold">Test Athlete</h2>
                        <p className="text-white/90">Test Team</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleEditClick}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results:</h3>
                <div className="bg-gray-100 p-4 rounded-lg min-h-[100px]">
                  {testResults.length === 0 ? (
                    <p className="text-gray-500">No tests run yet. Click the buttons above to test functionality.</p>
                  ) : (
                    <div className="space-y-1">
                      {testResults.map((result, index) => (
                        <div key={index} className="text-sm text-green-600">
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800">Test Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li>Click both edit buttons above to test functionality</li>
                  <li>Check that the EditAthleteForm opens when clicked</li>
                  <li>Verify the form can be closed properly</li>
                  <li>Check the browser console for any JavaScript errors</li>
                  <li>If buttons are not clickable, check for CSS z-index issues or overlapping elements</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {showEditForm ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Edit form is currently open</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Edit form is closed</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        {showEditForm && (
          <EditAthleteForm
            athlete={mockAthlete}
            open={showEditForm}
            onOpenChange={handleFormClose}
            onAthleteUpdated={() => {
              const timestamp = new Date().toLocaleTimeString();
              setTestResults(prev => [...prev, `✅ Athlete updated successfully at ${timestamp}`]);
              handleFormClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TestEditButtons;
