import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as LucideImage, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageSelected: (url: string) => void;
  initialImage?: string;
  bucketName?: string;
}

const ImageUpload = ({ onImageSelected, initialImage, bucketName = "athlete-images" }: ImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImage || "");
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image URL input change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  // Preview the entered URL
  const handlePreviewImage = () => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Create an image element to test if the URL loads properly
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(imageUrl);
      onImageSelected(imageUrl);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load image from URL. Please check the URL and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    };
    
    img.src = imageUrl;
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size exceeds 5MB limit",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Create a temporary preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Update the state and notify parent
      setImageUrl(publicUrl);
      onImageSelected(publicUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again later.",
        variant: "destructive",
      });
      // Clear the preview on error
      setPreviewUrl(initialImage || "");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        {/* File Upload Button */}
        <div>
          <Button 
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "Uploading..." : "Upload Image File"}
          </Button>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Separator text */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or enter URL</span>
          </div>
        </div>

        {/* URL Input */}
        <div className="flex items-end space-x-4">
          <div className="flex-grow">
            <Input
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="Enter image URL"
              className="w-full"
            />
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handlePreviewImage}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Preview"}
          </Button>
        </div>
      </div>
      
      {previewUrl && (
        <div className="flex justify-center">
          <div className="relative w-32 h-32 border rounded-md overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Image preview" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      {!previewUrl && (
        <div className="flex justify-center">
          <Avatar className="w-32 h-32">
            <AvatarFallback className="bg-gray-200">
              <LucideImage className="w-12 h-12 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
