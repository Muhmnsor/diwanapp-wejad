
import React, { useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onChange: (file: File) => void;
  value?: string;
  className?: string;
}

export function ImageUpload({ onChange, value, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {value ? (
        <div className="relative aspect-video">
          <img
            src={value}
            alt="Preview"
            className="rounded-lg object-cover w-full h-full"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="absolute bottom-2 right-2 bg-white/90"
          >
            تغيير الصورة
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="w-full h-[160px]"
        >
          اختر صورة
        </Button>
      )}
    </div>
  );
}
