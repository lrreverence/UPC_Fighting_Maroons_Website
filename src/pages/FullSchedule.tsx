
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Game {
  id: string;
  sport: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
}

interface GameFormValues {
  sport: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
}

const FullSchedule = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<GameFormValues>({
    defaultValues: {
      sport: "",
      opponent: "",
      date: "",
      time: "",
      venue: "",
    },
  });

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("date");

      if (error) {
        throw error;
      }

      setGames(data as Game[]);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        variant: "destructive",
        title: "Error loading games",
        description: "There was a problem loading the game schedule.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleAddGame = async (values: GameFormValues) => {
    try {
      const { error } = await supabase.from("games").insert([values]);

      if (error) {
        throw error;
      }

      toast({
        title: "Game added",
        description: "The game has been added to the schedule.",
      });

      form.reset();
      setIsDialogOpen(false);
      fetchGames();
    } catch (error) {
      console.error("Error adding game:", error);
      toast({
        variant: "destructive",
        title: "Error adding game",
        description: "There was a problem adding the game to the schedule.",
      });
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      const { error } = await supabase.from("games").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Game deleted",
        description: "The game has been removed from the schedule.",
      });

      fetchGames();
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        variant: "destructive",
        title: "Error deleting game",
        description: "There was a problem deleting the game.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-forest" />
              <h1 className="text-3xl font-bold text-forest">Complete Game Schedule</h1>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-maroon hover:bg-maroon/90">
                  <Plus className="mr-1" /> Add Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddGame)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="sport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sport</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Basketball" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="opponent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opponent</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. University of San Carlos" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. June 15, 2025" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 4:00 PM" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. UP Cebu Gymnasium" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" className="bg-maroon hover:bg-maroon/90">Add Game</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-maroon" />
            </div>
          ) : (
            <Card className="overflow-hidden">
              {games.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-maroon">
                      <TableHead className="text-white">Sport</TableHead>
                      <TableHead className="text-white">Opponent</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Time</TableHead>
                      <TableHead className="text-white">Venue</TableHead>
                      <TableHead className="text-white w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium text-maroon">{game.sport}</TableCell>
                        <TableCell>vs. {game.opponent}</TableCell>
                        <TableCell>{game.date}</TableCell>
                        <TableCell>{game.time}</TableCell>
                        <TableCell>{game.venue}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGame(game.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No games scheduled. Add a game to get started.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default FullSchedule;
