import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCorrespondence } from '@/hooks/useCorrespondence';
import { useToast } from '@/components/ui/use-toast';

interface TagsManagerProps {
  correspondenceId: string;
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

export const TagsManager: React.FC<TagsManagerProps> = ({
  correspondenceId,
  tags,
  onUpdate
}) => {
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { addTag, removeTag } = useCorrespondence();
  const { toast } = useToast();

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    const result = await addTag(correspondenceId, newTag.trim());
    if (result.success) {
      onUpdate(result.tags);
      toast({
        title: "تمت إضافة الوسم",
        description: `تمت إضافة الوسم "${newTag}" بنجاح`
      });
      setNewTag('');
      setShowAddTag(false);
    } else {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الوسم",
        description: "حدث خطأ أثناء إضافة الوسم، يرجى المحاولة مرة أخرى"
      });
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const result = await removeTag(correspondenceId, tagToRemove);
    if (result.success) {
      onUpdate(result.tags);
      toast({
        title: "تمت إزالة الوسم",
        description: `تمت إزالة الوسم "${tagToRemove}" بنجاح`
      });
    } else {
      toast({
        variant: "destructive",
        title: "خطأ في إزالة الوسم",
        description: "حدث خطأ أثناء إزالة الوسم، يرجى المحاولة مرة أخرى"
      });
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">الوسوم</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {tags.map((tag, index) => (
          <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Tag className="h-3 w-3" />
            <span>{tag}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground hover:bg-transparent"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">إزالة الوسم</span>
            </Button>
          </Badge>
        ))}
        
        {showAddTag ? (
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="أدخل اسم الوسم"
              className="h-8 w-32 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
                if (e.key === 'Escape') {
                  setShowAddTag(false);
                  setNewTag('');
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs"
              onClick={handleAddTag}
            >
              إضافة
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setShowAddTag(false);
                setNewTag('');
              }}
            >
              إلغاء
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-8"
            onClick={() => setShowAddTag(true)}
          >
            <Plus className="h-3 w-3" />
            <span>إضافة وسم</span>
          </Button>
        )}
      </div>
    </div>
  );
};

