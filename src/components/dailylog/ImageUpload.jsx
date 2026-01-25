import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ImageUpload({ images = [], onChange, maxImages = 3 }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} photos.`);
      return;
    }

    setIsUploading(true);
    try {
      const newUrls = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) {
          newUrls.push(res.file_url);
        }
      }
      onChange([...images, ...newUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square group rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <img 
              src={url} 
              alt={`Site photo ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div className="relative aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-slate-500 cursor-pointer">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Upload Photo</span>
                <span className="text-xs text-slate-400 mt-1">Max {maxImages}</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}