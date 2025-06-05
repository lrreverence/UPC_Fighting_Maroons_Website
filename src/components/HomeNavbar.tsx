
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

const HomeNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="text-[#7b1113] py-2 px-6 fixed top-0 w-full z-[100] backdrop-blur-sm bg-white/30">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                
              </div>
              <div className="w-10 h-10 flex items-center justify-center">
                 <img 
                   src="/upcebu.png" 
                   alt="UP Cebu Logo" 
                   className="w-full h-full object-contain"
                 />
              </div>
            </div>
            <div>
              <p className="text-m md:text-m font-maroons-strong group-hover:text-[#9b3133] transition-colors">University of the Philippines - Cebu</p>
            </div>
          </Link>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMenu}
            className="md:hidden text-[#7b1113]"
          >
            <Menu />
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/athletes" className="font-maroons-strong hover:text-[#9b3133]">Athletes</Link>
            <Link to="/sports" className="font-maroons-strong hover:text-[#9b3133]">Sports</Link>
            <Link to="/schedule" className="font-maroons-strong hover:text-[#9b3133]">Games</Link>
            <Link to="/news" className="font-maroons-strong hover:text-[#9b3133]">News</Link>
            <Link to="/stats" className="font-maroons-strong hover:text-[#9b3133]">Stats</Link>
            <Link to="/achievements" className="font-maroons-strong hover:text-[#9b3133]">Achievements</Link>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <Link to="/athletes" className="font-maroons-strong hover:text-[#9b3133]">Athletes</Link>
              <Link to="/sports" className="font-maroons-strong hover:text-[#9b3133]">Sports</Link>
              <Link to="/schedule" className="font-maroons-strong hover:text-[#9b3133]">Games</Link>
              <Link to="/news" className="font-maroons-strong hover:text-[#9b3133]">News</Link>
              <Link to="/stats" className="font-maroons-strong hover:text-[#9b3133]">Stats</Link>
              <Link to="/achievements" className="font-maroons-strong hover:text-[#9b3133]">Achievements</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNavbar;
