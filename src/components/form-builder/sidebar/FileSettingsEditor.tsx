
import { DynamicField } from "@/types/form-builder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface FileSettingsEditorProps {
  field: DynamicField;
  onChange: (field: DynamicField) => void;
}

const DEFAULT_ALLOWED_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const FileSettingsEditor = ({ field, onChange }: FileSettingsEditorProps) => {
  const [newFileType, setNewFileType] = useState("");

  const config = field.config || {
    maxFileSize: 5,
    allowedFileTypes: ["image/*", "application/pdf"],
  };

  const handleMaxFileSizeChange = (value: string) => {
    onChange({
      ...field,
      config: {
        ...config,
        maxFileSize: parseFloat(value) || 5,
      },
    });
  };

  const removeFileType = (index: number) => {
    const newAllowedTypes = [...(config.allowedFileTypes || [])];
    newAllowedTypes.splice(index, 1);
    
    onChange({
      ...field,
      config: {
        ...config,
        allowedFileTypes: newAllowedTypes,
      },
    });
  };

  const addFileType = () => {
    if (!newFileType.trim()) return;
    
    const newAllowedTypes = [...(config.allowedFileTypes || []), newFileType];
    
    onChange({
      ...field,
      config: {
        ...config,
        allowedFileTypes: newAllowedTypes,
      },
    });
    
    setNewFileType("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFileType();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="max-file-size">أقصى حجم للملف (ميجابايت)</Label>
        <Input
          id="max-file-size"
          type="number"
          value={config.maxFileSize || 5}
          onChange={(e) => handleMaxFileSizeChange(e.target.value)}
          min={1}
          step={1}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="allowed-file-types">أنواع الملفات المسموح بها</Label>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {(config.allowedFileTypes || []).map((type, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {type}
              <button
                type="button"
                onClick={() => removeFileType(index)}
                className="rounded-full hover:bg-muted/50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex mt-2">
          <Input
            id="add-file-type"
            value={newFileType}
            onChange={(e) => setNewFileType(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="مثال: image/*, application/pdf"
            className="flex-1"
          />
          <Button type="button" onClick={addFileType} className="mr-2">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          <p>أمثلة على أنواع الملفات:</p>
          <ul className="list-disc list-inside">
            {DEFAULT_ALLOWED_TYPES.map((type, index) => (
              <li key={index} className="cursor-pointer hover:underline" onClick={() => setNewFileType(type)}>
                {type}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
