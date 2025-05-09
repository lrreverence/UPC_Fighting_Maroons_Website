import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-[80vh] bg-[url('https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center">
      <div className="absolute inset-0 hero-gradient"></div>
      <div className="relative container mx-auto h-full flex flex-col justify-center items-start px-6">
        <div className="max-w-2xl text-white animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            FIGHTING MAROONS
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Excellence in academics and athletics at the University of the Philippines - Cebu
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-forest hover:bg-forest-dark text-white">
              <Link to="/athletes">Meet Our Athletes</Link>
            </Button>
            <Button asChild className="bg-white text-maroon hover:bg-gray-200 hover:text-maroon">
              <Link to="/schedule">View Schedule</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
