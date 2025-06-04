
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
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
    <nav className="bg-[#7b1113] text-white py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/uploads/icon.png" 
                alt="Fighting Maroons Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold md:text-2xl font-maroons-strong group-hover:text-gold-light transition-colors">FIGHTING MAROONS</h1>
              <p className="text-xs md:text-sm group-hover:text-gold-light transition-colors">University of the Philippines - Cebu</p>
            </div>
          </Link>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMenu}
            className="md:hidden text-white"
          >
            <Menu />
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/athletes" className="hover:text-gold-light">Athletes</Link>
            
            {/* Sports Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white hover:text-gold-light hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-gold-light">
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
            
            <Link to="/schedule" className="hover:text-gold-light">Games</Link>
            <Link to="/news" className="hover:text-gold-light">News</Link>
            <Link to="/stats" className="hover:text-gold-light">Stats</Link>
            <Link to="/achievements" className="hover:text-gold-light">Achievements</Link>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <Link to="/athletes" className="hover:text-gold-light">Athletes</Link>
              
              {/* Mobile Sports Menu */}
              <div className="space-y-2">
                <span className="text-gold-light font-semibold">Sports</span>
                <div className="ml-4 space-y-2">
                  {sports.map((sport) => (
                    <Link
                      key={sport.name}
                      to={sport.path}
                      className="block hover:text-gold-light text-sm"
                    >
                      {sport.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <Link to="/schedule" className="hover:text-gold-light">Games</Link>
              <Link to="/news" className="hover:text-gold-light">News</Link>
              <Link to="/stats" className="hover:text-gold-light">Stats</Link>
              <Link to="/achievements" className="hover:text-gold-light">Achievements</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
