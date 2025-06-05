import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Activity as ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AddAthleteForm from "@/components/AddAthleteForm";
import AthletesList from "@/components/AthletesList";
import { useAuth } from "@/lib/auth";

const AthletesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const requestedAdminMode = searchParams.get('adminmode') === 'true';
  const [isProfileView, setIsProfileView] = useState(false);

  // Redirect to login if trying to access admin mode without being logged in
  useEffect(() => {
    if (requestedAdminMode && !user) {
      navigate('/login?redirect=/athletes?adminmode=true');
    }
  }, [requestedAdminMode, user, navigate]);

  // Only allow admin mode if user is authenticated and is an admin
  const isAdminMode = requestedAdminMode && user && isAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {!isProfileView && (
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <ActivityIcon className="h-8 w-8 text-maroon" />
                <h1 className="text-3xl font-bold text-maroon">All Athletes</h1>
              </div>
              <div className="flex gap-4">
                {isAdminMode && <AddAthleteForm />}
                <Button asChild variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-white">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          )}
          
          <AthletesList 
            onProfileViewChange={setIsProfileView} 
            isAdminMode={isAdminMode}
          />
        </div>
      </main>
    </div>
  );
};

export default AthletesPage; 