
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  workspaceId?: string | null;
  isSubmitting?: boolean;
}

interface MentionUser {
  id: string;
  email: string | null;
  display_name: string | null;
}

export const MentionInput = ({
  value,
  onChange,
  placeholder = "اكتب تعليقك هنا...",
  workspaceId,
  isSubmitting = false
}: MentionInputProps) => {
  const [mentionMode, setMentionMode] = useState(false);
  const [mentionText, setMentionText] = useState("");
  const [mentionOptions, setMentionOptions] = useState<MentionUser[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  useEffect(() => {
    if (mentionMode && mentionText.length > 0) {
      fetchUsers();
    } else {
      setMentionOptions([]);
    }
  }, [mentionMode, mentionText, workspaceId]);

  const fetchUsers = async () => {
    try {
      if (workspaceId) {
        const { data, error } = await supabase
          .from('workspace_members')
          .select(`
            user_id,
            profiles (id, email, display_name)
          `)
          .eq('workspace_id', workspaceId)
          .ilike('profiles.display_name', `%${mentionText}%`);
          
        if (!error && data) {
          // Process each item individually and ensure proper typing
          const formattedData: MentionUser[] = data
            .map(item => ({
              id: item.profiles?.id || '',
              email: item.profiles?.email || null,
              display_name: item.profiles?.display_name || null
            }))
            .filter(item => item.id !== ''); // Remove items with empty IDs
          
          setMentionOptions(formattedData);
        }
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .ilike('display_name', `%${mentionText}%`)
          .limit(5);
          
        if (!error && data) {
          setMentionOptions(data as MentionUser[]);
        }
      }
    } catch (error) {
      console.error("Error fetching users for mentions:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textArea = e.currentTarget;
    setCursorPosition(textArea.selectionStart);
    
    // إذا كتب المستخدم @ نبدأ وضع الإشارة
    if (e.key === '@' && !mentionMode) {
      setMentionMode(true);
      setMentionText("");
    }
    // إذا كان في وضع الإشارة ويضغط مفتاح Escape أو Space
    else if (mentionMode && (e.key === 'Escape' || e.key === ' ')) {
      setMentionMode(false);
    }
    // إذا كان في وضع الإشارة ويضغط Enter بينما هناك خيارات
    else if (mentionMode && e.key === 'Enter' && mentionOptions.length > 0) {
      e.preventDefault();
      insertMention(mentionOptions[0]); // إدراج الخيار الأول
    }
    // إذا كان في وضع الإشارة وكتب أي حرف
    else if (mentionMode) {
      // لا نفعل شيئًا هنا، سيتم معالجة تغيير النص في onChange
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (mentionMode && cursorPosition !== null) {
      // استخراج النص بعد @ وقبل موضع المؤشر الحالي
      const currentPos = e.target.selectionStart;
      const lastAtPos = newValue.lastIndexOf('@', currentPos - 1);
      
      if (lastAtPos !== -1) {
        const mentionString = newValue.substring(lastAtPos + 1, currentPos);
        
        // تحديث نص الإشارة
        setMentionText(mentionString);
        
        // إذا وجدنا مسافة أو حرف سطر جديد، نخرج من وضع الإشارة
        if (/[\s\n]/.test(mentionString)) {
          setMentionMode(false);
        }
      } else {
        // إذا لم نعثر على @ قبل الموضع الحالي
        setMentionMode(false);
      }
    }
  };

  const insertMention = (user: MentionUser) => {
    if (!cursorPosition) return;
    
    // نستخرج النص قبل وبعد اسم المستخدم
    const beforeText = value.substring(0, cursorPosition - mentionText.length - 1); // -1 للـ @
    const afterText = value.substring(cursorPosition);
    
    // استخدام اسم العرض إذا كان موجودًا، وإلا نستخدم البريد الإلكتروني
    const displayText = user.display_name || user.email || 'مستخدم';
    
    // ندرج الإشارة الجديدة
    const newText = `${beforeText}@${displayText} ${afterText}`;
    onChange(newText);
    
    // إعادة تعيين حالة الإشارة
    setMentionMode(false);
    setMentionText("");
  };

  return (
    <div className="relative w-full">
      <Textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="resize-none min-h-[100px] pr-8 text-right"
        dir="rtl"
        disabled={isSubmitting}
      />
      
      {/* عرض خيارات الإشارة */}
      {mentionMode && mentionOptions.length > 0 && (
        <div className="absolute bottom-full mb-1 right-0 bg-background border rounded-md shadow-md min-w-[200px] max-w-full z-10">
          <ul className="py-1">
            {mentionOptions.map((user) => (
              <li 
                key={user.id} 
                className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                onClick={() => insertMention(user)}
              >
                <div className="flex-shrink-0 h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">
                  {(user.display_name || user.email || 'م').charAt(0).toUpperCase()}
                </div>
                <span className="truncate">
                  {user.display_name || user.email || 'مستخدم'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
