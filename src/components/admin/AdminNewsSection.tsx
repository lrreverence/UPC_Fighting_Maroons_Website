import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function AdminNewsSection() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddNews = () => {
    if (newNews.title && newNews.content) {
      const newsItem: NewsItem = {
        id: Date.now().toString(),
        ...newNews as NewsItem
      };
      setNewsItems([...newsItems, newsItem]);
      setNewNews({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleDeleteNews = (id: string) => {
    setNewsItems(newsItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">News Management</h2>
      </div>

      <div className="grid gap-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Add News Article</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newNews.title}
              onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={newNews.content}
              onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={newNews.date}
              onChange={(e) => setNewNews({ ...newNews, date: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleAddNews}>Add Article</Button>
      </div>

      <div className="grid gap-4">
        {newsItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{item.title}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteNews(item.id)}
                >
                  Delete
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{item.content}</p>
                <p className="text-sm text-gray-500">
                  Published on {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 