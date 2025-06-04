
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const HomeNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const sports = [
    { name: "Basketball", path: "/sports/basketball" },
    { name: "Volleyball", path: "/sports/volleyball" },
    { name: "Swimming", path: "/sports/swimming" },
    { name: "Track and Field", path: "/sports/track-and-field" },
    { name: "Football", path: "/sports/football" },
    { name: "Tennis", path: "/sports/tennis" },
  ];

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
            
            {/* Sports Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-[#7b1113] hover:text-[#9b3133] hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-[#9b3133] font-maroons-strong">
                    Sports
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      {sports.map((sport) => (
                        <Link
                          key={sport.name}
                          to={sport.path}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                        >
                          {sport.name}
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
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
              
              {/* Mobile Sports Menu */}
              <div className="space-y-2">
                <span className="text-[#9b3133] font-maroons-strong">Sports</span>
                <div className="ml-4 space-y-2">
                  {sports.map((sport) => (
                    <Link
                      key={sport.name}
                      to={sport.path}
                      className="block hover:text-[#9b3133] text-sm font-maroons-strong"
                    >
                      {sport.name}
                    </Link>
                  ))}
                </div>
              </div>
              
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
