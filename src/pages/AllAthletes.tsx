import { useState } from "react";
import { Activity as ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AddAthleteForm from "@/components/AddAthleteForm";
import AthletesList from "@/components/AthletesList";

const AllAthletes = () => {
  const [isProfileView, setIsProfileView] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {!isProfileView && (
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <ActivityIcon className="h-8 w-8 text-maroon" />
                <h1 className="text-3xl font-bold text-maroon">All Athletes</h1>
              </div>              <div className="flex gap-4">
                <AddAthleteForm />
                <Button asChild variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-white">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          )}
          
          <AthletesList onProfileViewChange={setIsProfileView} />
        </div>
      </main>
    </div>
  );
};

export default AllAthletes;
