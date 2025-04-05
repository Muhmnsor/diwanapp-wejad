
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface MailHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching: boolean;
  onRefresh: () => void;
}

export const MailHeader: React.FC<MailHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  isSearching,
  onRefresh
}) => {
  return (
    <div className="border-b p-2 flex items-center justify-between">
      <div className="flex items-center flex-1 relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="البحث في الرسائل..."
          className="pl-8 max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isSearching && (
          <div className="mr-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>تحديث</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
