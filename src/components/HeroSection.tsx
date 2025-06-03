import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-screen bg-[url('/bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black opacity-40 backdrop-blur-sm"></div>
      <div className="relative container mx-auto h-full flex flex-col justify-center items-center px-6">
        <div className="max-w-2xl text-white animate-fade-in text-center">
          <h1 className="text-8xl md:text-9xl lg:text-10xl font-maroons-strong mb-4">
            FIGHTING MAROONS
          </h1>
          <p className="text-xl md:text-2xl font-maroons-sharp mb-8">
            Excellence in academics and athletics at the University of the Philippines - Cebu
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
