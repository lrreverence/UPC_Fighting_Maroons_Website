import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Newspaper as NewsIcon, Trash2, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import ImageUpload from "@/components/ImageUpload";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
  reference_link?: string | null;
}

type NewsFormValues = {
  title: string;
  excerpt: string;
  category: string;
  date?: string;
  image: string;
  reference_link?: string;
}

export default function NewsPage() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const { register, handleSubmit, reset, setValue } = useForm<NewsFormValues>();

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Use type assertion to work around TypeScript limitation
      const { data, error } = await (supabase as any)
        .from('news')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setAllNews(data as NewsItem[]);
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

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // Use type assertion to work around TypeScript limitation
      const { error } = await (supabase as any)
        .from('news')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAllNews(allNews.filter(news => news.id !== id));
      toast({
        title: "Success",
        description: "News item deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting news:", error);
      toast({
        title: "Error",
        description: "Failed to delete news item.",
        variant: "destructive",
      });
    }
  };

  const handleImageSelected = (url: string) => {
    setImageUrl(url);
    setValue("image", url);
  };

  const handleAddNews = async (data: NewsFormValues) => {
    try {
      // Format date in standard format
      const formattedDate = data.date ? data.date : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      // Use type assertion to work around TypeScript limitation
      const { error } = await (supabase as any)
        .from('news')
        .insert([
          {
            title: data.title,
            excerpt: data.excerpt,
            category: data.category,
            date: formattedDate,
            image: imageUrl || '/uploads/29b19ee1-3d5a-4c33-847d-777900e20bfc.png', // Use uploaded image or default
            reference_link: data.reference_link || null
          }
        ]);
      
      if (error) throw error;
      
      setIsAddDialogOpen(false);
      reset();
      setImageUrl("");
      fetchNews(); // Refresh the list
      toast({
        title: "Success",
        description: "News item added successfully.",
      });
    } catch (error) {
      console.error("Error adding news:", error);
      toast({
        title: "Error",
        description: "Failed to add news item.",
        variant: "destructive",
      });
    }
  };

  const handleEditNews = (news: NewsItem) => {
    setEditingNews(news);
    setImageUrl(news.image);
    
    // Pre-populate the form with existing values
    setValue("title", news.title);
    setValue("excerpt", news.excerpt);
    setValue("category", news.category);
    setValue("date", news.date);
    setValue("image", news.image);
    setValue("reference_link", news.reference_link || "");
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateNews = async (data: NewsFormValues) => {
    if (!editingNews) return;
    
    try {
      // Format date in standard format
      const formattedDate = data.date ? data.date : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      // Use type assertion to work around TypeScript limitation
      const { error } = await (supabase as any)
        .from('news')
        .update({
          title: data.title,
          excerpt: data.excerpt,
          category: data.category,
          date: formattedDate,
          image: imageUrl || editingNews.image,
          reference_link: data.reference_link || null
        })
        .eq('id', editingNews.id);
      
      if (error) throw error;
      
      setIsEditDialogOpen(false);
      setEditingNews(null);
      reset();
      setImageUrl("");
      fetchNews(); // Refresh the list
      toast({
        title: "Success",
        description: "News item updated successfully.",
      });
    } catch (error) {
      console.error("Error updating news:", error);
      toast({
        title: "Error",
        description: "Failed to update news item.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <NewsIcon className="h-8 w-8 text-maroon" />
              <h1 className="text-4xl font-bold text-maroon font-maroons-strong">All News</h1>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-forest hover:bg-forest-dark">
                  <Plus className="mr-2 h-4 w-4" />
                  Add News
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                  <DialogTitle className="font-maroons-strong">Add New News Item</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new news item.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleAddNews)} className="space-y-4 pt-4">
                  
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input
                      id="title"
                      placeholder="News title"
                      {...register("title", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="excerpt" className="text-sm font-medium">Excerpt</label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of the news"
                      {...register("excerpt", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input
                      id="category"
                      placeholder="e.g., Basketball, Swimming"
                      {...register("category", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium">Date (Optional)</label>
                    <Input
                      id="date"
                      placeholder="e.g., May 15, 2025"
                      {...register("date")}
                    />
                    <p className="text-xs text-gray-500">Leave empty to use today's date</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="image" className="text-sm font-medium">News Image</label>
                    <ImageUpload 
                      onImageSelected={handleImageSelected}
                      initialImage={imageUrl}
                      bucketName="news-images"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reference_link" className="text-sm font-medium">Reference Link</label>
                    <Input
                      id="reference_link"
                      placeholder="https://example.com/news-source"
                      {...register("reference_link")}
                    />
                    <p className="text-xs text-gray-500">Link to the original news source</p>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-forest hover:bg-forest-dark">
                      Add News
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {allNews.map((news) => (
                <Card key={news.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={news.image} 
                      alt={news.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-grow pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-forest bg-forest/10 px-2 py-1 rounded">
                        {news.category}
                      </span>
                    </div>
                    <h2 className="font-bold text-lg mb-2 font-maroons-strong">{news.title}</h2>
                    <p className="text-gray-600 text-sm">{news.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-0 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{news.date}</span>
                    <div className="flex gap-2 items-center">
                      {news.reference_link ? (
                        <a 
                          href={news.reference_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest font-medium text-sm hover:underline"
                        >
                          Read more
                        </a>
                      ) : (
                        <Link 
                          to={`/news/${news.id}`}
                          className="text-forest font-medium text-sm hover:underline"
                        >
                          Read more
                        </Link>
                      )}
                      <Button
                        variant="ghost" 
                        size="sm"
                        className="text-blue-500 p-0 h-auto"
                        onClick={() => handleEditNews(news)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 p-0 h-auto"
                        onClick={() => handleDelete(news.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Edit News Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Edit News Item</DialogTitle>
            <DialogDescription>
              Update the details for the news item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdateNews)} className="space-y-4 pt-4">
            
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                placeholder="News title"
                {...register("title", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-excerpt" className="text-sm font-medium">Excerpt</label>
              <Textarea
                id="edit-excerpt"
                placeholder="Brief description of the news"
                {...register("excerpt", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
              <Input
                id="edit-category"
                placeholder="e.g., Basketball, Swimming"
                {...register("category", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-date" className="text-sm font-medium">Date (Optional)</label>
              <Input
                id="edit-date"
                placeholder="e.g., May 15, 2025"
                {...register("date")}
              />
              <p className="text-xs text-gray-500">Leave empty to use today's date</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-image" className="text-sm font-medium">News Image</label>
              <ImageUpload 
                onImageSelected={handleImageSelected}
                initialImage={imageUrl}
                bucketName="news-images"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-reference_link" className="text-sm font-medium">Reference Link</label>
              <Input
                id="edit-reference_link"
                placeholder="https://example.com/news-source"
                {...register("reference_link")}
              />
              <p className="text-xs text-gray-500">Link to the original news source</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-forest hover:bg-forest-dark">
                Update News
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
