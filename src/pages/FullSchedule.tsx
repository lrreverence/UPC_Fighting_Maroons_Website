
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Game {
  game_id: string;
  game_date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  game_status?: string;
  team_name?: string;
  opponent_team?: string;
}

interface GameFormValues {
  game_id: string;
  game_date: string;
  start_time: string;
  end_time: string;
  location: string;
  game_status: string;
  team_name: string;
  opponent_team: string;
}

interface Team {
  team_name: string;
  sport: string;
}

const FullSchedule = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<GameFormValues>({
    defaultValues: {
      game_id: "",
      game_date: "",
      start_time: "",
      end_time: "",
      location: "",
      game_status: "Scheduled",
      team_name: "",
      opponent_team: "",
    },
  });

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("team")
        .select("team_name, sport")
        .order("team_name");

      if (error) throw error;
      setTeams(data as Team[]);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("game")
        .select("*")
        .order("game_date");

      if (error) throw error;
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
    fetchTeams();
    fetchGames();
  }, []);

  const handleAddGame = async (values: GameFormValues) => {
    try {
      const { error } = await supabase.from("game").insert([{
        game_id: values.game_id,
        game_date: values.game_date,
        start_time: values.start_time,
        end_time: values.end_time || null,
        location: values.location || null,
        game_status: values.game_status || 'Scheduled',
        team_name: values.team_name || null,
        opponent_team: values.opponent_team || null,
      }]);

      if (error) throw error;

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

  const handleDeleteGame = async (gameId: string) => {
    try {
      const { error } = await supabase.from("game").delete().eq("game_id", gameId);

      if (error) throw error;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddGame)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="game_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. GAME004" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="team_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a team" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.team_name} value={team.team_name}>
                                  {team.team_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="opponent_team"
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="game_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Venue</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. UP Cebu Gymnasium" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="game_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
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
                      <TableHead className="text-white">Game ID</TableHead>
                      <TableHead className="text-white">Team</TableHead>
                      <TableHead className="text-white">Opponent</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Time</TableHead>
                      <TableHead className="text-white">Venue</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((game) => (
                      <TableRow key={game.game_id}>
                        <TableCell className="font-medium text-maroon">{game.game_id}</TableCell>
                        <TableCell>{game.team_name || 'Fighting Maroons'}</TableCell>
                        <TableCell>vs. {game.opponent_team}</TableCell>
                        <TableCell>{formatDate(game.game_date)}</TableCell>
                        <TableCell>{formatTime(game.start_time)}</TableCell>
                        <TableCell>{game.location || 'TBD'}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            game.game_status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : game.game_status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {game.game_status || 'Scheduled'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGame(game.game_id)}
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
