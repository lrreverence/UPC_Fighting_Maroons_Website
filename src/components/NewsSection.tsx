
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Newspaper as NewsIcon, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
}

const NewsSection = () => {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('date', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        
        setLatestNews(data as NewsItem[]);
      } catch (error) {
        console.error("Error fetching news:", error);
        toast({
          title: "Error",
          description: "Failed to load news data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section id="news" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <NewsIcon className="h-8 w-8 text-maroon" />
          <h2 className="text-3xl font-bold text-maroon">Latest News</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <Card key={news.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={news.image} 
                    alt={news.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="flex-grow pt-6">
                  <h3 className="font-bold text-lg mb-2">{news.title}</h3>
                  <p className="text-gray-600 text-sm">{news.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-0 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{news.date}</span>
                  <Link 
                    to={`/news/${news.id}`}
                    className="text-forest font-medium text-sm hover:underline"
                  >
                    Read more
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link to="/news" className="text-forest font-semibold hover:text-forest-dark underline">
            View all news →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
