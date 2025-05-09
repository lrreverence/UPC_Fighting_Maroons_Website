import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-maroon text-white py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/lovable-uploads/29b19ee1-3d5a-4c33-847d-777900e20bfc.png" 
                alt="Fighting Maroons Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold md:text-2xl group-hover:text-gold-light transition-colors">FIGHTING MAROONS</h1>
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
