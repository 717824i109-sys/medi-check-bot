import { useRef, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadAreaProps {
  onImageUpload: (imageUrl: string) => void;
}

const UploadArea = ({ onImageUpload }: UploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-smooth ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-primary/10">
          {isDragging ? (
            <Upload className="h-12 w-12 text-primary" />
          ) : (
            <ImageIcon className="h-12 w-12 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isDragging ? "Drop image here" : "Upload Medicine Image"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to select an image of the medicine packaging
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="glow-primary"
        >
          <Upload className="mr-2 h-4 w-4" />
          Choose File
        </Button>
      </div>
    </div>
  );
};

export default UploadArea;
