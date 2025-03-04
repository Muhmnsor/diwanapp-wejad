
import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface MentionUser {
  id: string;
  email: string;
  display_name: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  workspaceId?: string | null;
  isSubmitting?: boolean;
}

export const MentionInput = ({
  value,
  onChange,
  placeholder = "أضف تعليقًا...",
  workspaceId,
  isSubmitting
}: MentionInputProps) => {
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [mentionActive, setMentionActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  
  // Fetch workspace members when component mounts
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceMembers();
    } else {
      fetchAllUsers();
    }
  }, [workspaceId]);
  
  const fetchWorkspaceMembers = async () => {
    if (!workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          user_email,
          user_display_name,
          profiles:user_id (
            id,
            email,
            display_name
          )
        `)
        .eq('workspace_id', workspaceId);
        
      if (error) throw error;
      
      const formattedUsers: MentionUser[] = data.map(member => ({
        id: member.user_id,
        email: member.user_email || (member.profiles?.email as string) || "",
        display_name: member.user_display_name || (member.profiles?.display_name as string) || ""
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
    }
  };
  
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name');
        
      if (error) throw error;
      
      const formattedUsers: MentionUser[] = data.map(profile => ({
        id: profile.id,
        email: profile.email || "",
        display_name: profile.display_name || ""
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  
  // Check if we should activate mention feature
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Find the current word being typed
    const textUpToCursor = newValue.substring(0, cursorPos);
    const words = textUpToCursor.split(/\s+/);
    const currentWord = words[words.length - 1];
    
    // Check if the current word starts with @ and has at least one character after it
    if (currentWord.startsWith('@') && currentWord.length > 1) {
      setMentionActive(true);
      // Extract the search term (remove the @)
      setSearchQuery(currentWord.substring(1));
      
      // Calculate the position for the popover
      if (textareaRef.current) {
        const textareaRect = textareaRef.current.getBoundingClientRect();
        // Try to position near cursor (this is approximate)
        // For RTL support, you may need additional logic here
        setPopoverPosition({
          top: textareaRect.top + 30, // Approximate position below the line
          left: textareaRect.left + 20 // Approximate position from left
        });
      }
    } else {
      setMentionActive(false);
    }
    
    onChange(newValue);
  };
  
  const insertMention = (user: MentionUser) => {
    // Get the text before the cursor
    const textBeforeCursor = value.substring(0, cursorPosition);
    // Find the last @ before the cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex >= 0) {
      // Create the new text by replacing the @query with @username
      const textBeforeMention = value.substring(0, lastAtIndex);
      const textAfterMention = value.substring(cursorPosition);
      
      const displayName = user.display_name || user.email;
      const newText = `${textBeforeMention}@${displayName} ${textAfterMention}`;
      
      onChange(newText);
      
      // Reset mention state
      setMentionActive(false);
      
      // Set focus back to textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Calculate new cursor position
        const newPosition = lastAtIndex + displayName.length + 2; // +2 for @ and space
        setTimeout(() => {
          textareaRef.current?.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    }
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const displayName = user.display_name || user.email;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="min-h-[80px] w-full resize-none rounded-xl text-right px-4 py-3"
        disabled={isSubmitting}
        dir="rtl"
      />
      
      {mentionActive && (
        <Popover open={mentionActive} onOpenChange={setMentionActive}>
          <PopoverTrigger asChild>
            <div></div>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 w-[200px] border" 
            side="top"
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            <Command>
              <CommandGroup>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <CommandItem
                      key={user.id}
                      value={user.display_name || user.email}
                      onSelect={() => insertMention(user)}
                      className="flex items-center gap-2 py-2 cursor-pointer"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.display_name ? user.display_name[0].toUpperCase() : <User className="h-3 w-3" />}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.display_name || user.email}</span>
                    </CommandItem>
                  ))
                ) : (
                  <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                    لا يوجد مستخدمين مطابقين
                  </div>
                )}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
