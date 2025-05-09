import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Mock news data type
interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  image: string;
  author: string;
}

// Mock news data
const newsData: NewsItem[] = [
  {
    id: "1",
    title: "Women's Basketball Team Advances to Regional Finals",
    date: "May 5, 2024",
    content: `
      <p>Our women's basketball team has secured a spot in the Central Visayas Regional Finals after defeating University of San Carlos with a score of 78-65 in yesterday's semifinal match.</p>
      
      <p>Team captain Sarah Martinez led the scoring with 22 points, while freshman sensation Ana Reyes contributed 18 points and 7 rebounds. "We executed our game plan perfectly," said Coach Fernandez. "The team showed incredible focus and determination."</p>
      
      <p>The championship game is scheduled for Saturday, May 10th, against University of Cebu. The team is aiming for their third consecutive regional title.</p>
      
      <p>Students can get discounted tickets by presenting their ID at the gymnasium ticket booth starting tomorrow.</p>
    `,
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=1200",
    author: "Sports Information Office"
  },
  {
    id: "2",
    title: "Swimming Team Breaks National Record",
    date: "April 28, 2024",
    content: `
      <p>Daniel Santos of the University Swimming Team has broken the national record in the 100m freestyle event at the National University Games.</p>
      
      <p>Santos finished the race in 49.72 seconds, shattering the previous record of 50.15 seconds set in 2018. "I've been working towards this for years," said Santos. "It's an honor to represent the university and achieve this milestone."</p>
      
      <p>The university is planning a celebratory event next week to honor Santos's achievement. Details will be announced soon.</p>
    `,
    image: "https://images.unsplash.com/photo-1560273747-50ed41967ca1?auto=format&fit=crop&q=80&w=1200",
    author: "Athletics Department"
  },
  {
    id: "3",
    title: "Varsity Volleyball Team Clinches Championship Title",
    date: "April 15, 2024",
    content: `
      <p>The University Varsity Volleyball Team has won the Cebu Schools Athletic Foundation Inc. (CESAFI) championship, defeating Southwestern University in a thrilling five-set match.</p>
      
      <p>The team displayed exceptional teamwork and resilience throughout the season, culminating in their victory last night. "This win is a testament to the hard work and dedication of our players and coaching staff," said team coach Emily Reyes.</p>
      
      <p>A victory parade will be held on campus this Friday to celebrate the team's achievement. All students and faculty are invited to attend.</p>
    `,
    image: "https://images.unsplash.com/photo-1607978720255-838592994ca5?auto=format&fit=crop&q=80&w=1200",
    author: "Student Affairs Office"
  }
];

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    // Find the news item that matches the ID from the URL
    const foundItem = newsData.find(item => item.id === id);
    
    if (foundItem) {
      setNewsItem(foundItem);
    } else {
      // Handle not found
      navigate("/news");
    }
  }, [id, navigate]);

  if (!newsItem) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-maroon border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6 text-maroon flex items-center gap-2" 
        onClick={() => navigate("/news")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to News
      </Button>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{newsItem.title}</h1>
      
      <div className="flex items-center gap-2 text-gray-600 mb-6">
        <Calendar className="h-4 w-4" />
        <span>{newsItem.date}</span>
        <span className="mx-2">•</span>
        <span>{newsItem.author}</span>
      </div>
      
      <div className="mb-8">
        <img 
          src={newsItem.image} 
          alt={newsItem.title} 
          className="w-full h-[400px] object-cover rounded-lg"
        />
      </div>
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: newsItem.content }}
      />
    </div>
  );
}
