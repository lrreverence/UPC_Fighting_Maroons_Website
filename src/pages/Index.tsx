import HeroSection from "@/components/HeroSection";
import AthletesSection from "@/components/AthletesSection";
import GamesScheduleSection from "@/components/GamesScheduleSection";
import NewsSection from "@/components/NewsSection";
import StatsSection from "@/components/StatsSection";
import AchievementsSection from "@/components/AchievementsSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <AthletesSection />
      <GamesScheduleSection />
      <NewsSection />
      <StatsSection />
      <AchievementsSection />
    </div>
  );
};

export default Index;
