
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import ImageUpload from "./ImageUpload";

const athleteFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  sport: z.string().min(2, { message: "Sport is required" }),
  course: z.string().min(2, { message: "Course is required" }),
  year: z.string().min(1, { message: "Year is required" }),
  position: z.string().min(2, { message: "Position is required" }),
  hometown: z.string().min(2, { message: "Hometown is required" }),
  achievements: z.string().optional(),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
});

type AthleteFormValues = z.infer<typeof athleteFormSchema>;

const AddAthleteForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  
  const form = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      name: "",
      sport: "",
      course: "",
      year: "",
      position: "",
      hometown: "",
      achievements: "",
      image_url: ""
    }
  });

  const handleImageSelected = (url: string) => {
    setImageUrl(url);
    form.setValue("image_url", url);
  };

  const onSubmit = async (values: AthleteFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('athletes')
        .insert([{
          name: values.name,
          sport: values.sport,
          course: values.course,
          year: values.year,
          position: values.position,
          hometown: values.hometown,
          achievements: values.achievements || null,
          image_url: imageUrl || null
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `${values.name} was added to athletes.`,
      });
      
      form.reset();
      setImageUrl("");
      setIsOpen(false);
      
      // Force reload the page to show the new athlete
      window.location.reload();
    } catch (error) {
      console.error('Error adding athlete:', error);
      toast({
        title: "Error",
        description: "Failed to add athlete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-maroon hover:bg-maroon/90">
          <Plus className="mr-2 h-4 w-4" /> Add Athlete
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-maroon">Add New Athlete</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <FormControl>
                      <Input placeholder="Basketball" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Input placeholder="BS Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="4th Year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Point Guard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hometown"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hometown</FormLabel>
                    <FormControl>
                      <Input placeholder="Cebu City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievements</FormLabel>
                    <FormControl>
                      <Textarea placeholder="MVP 2023, All-Star 2022" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Athlete Image</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        onImageSelected={handleImageSelected} 
                        initialImage={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-maroon hover:bg-maroon/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding Athlete..." : "Add Athlete"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddAthleteForm;
