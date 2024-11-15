import React, { useState } from 'react';
import { Button } from "@/components/shadcn/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideShowProps {
  images: string[];
  isHost?: boolean;
  currentIndex: number;
  onSlideChange?: (index: number) => void;
}

const SlideShow: React.FC<SlideShowProps> = ({ 
  images, 
  isHost = false, 
  currentIndex,
  onSlideChange 
}) => {
  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHost) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    if (onSlideChange) onSlideChange(newIndex);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHost) return;
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    if (onSlideChange) onSlideChange(newIndex);
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      {isHost && (
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePrevious}
            className="rounded-full bg-gray-800/50 hover:bg-gray-800/75"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            onClick={handleNext}
            className="rounded-full bg-gray-800/50 hover:bg-gray-800/75"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideShow;

