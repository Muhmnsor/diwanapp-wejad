import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "اكتب هنا...",
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Initialize the editor with content
      if (value && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('bold')}
          title="تضخيم"
        >
          <strong>ض</strong>
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('italic')}
          title="مائل"
        >
          <em>م</em>
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('underline')}
          title="تسطير"
        >
          <u>_</u>
        </button>
        <div className="w-px h-6 bg-border mx-1 self-center"></div>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('insertOrderedList')}
          title="قائمة مرقمة"
        >
          1.
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('insertUnorderedList')}
          title="قائمة نقطية"
        >
          •
        </button>
        <div className="w-px h-6 bg-border mx-1 self-center"></div>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('justifyRight')}
          title="محاذاة لليمين"
        >
          ⫤
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('justifyCenter')}
          title="توسيط"
        >
          ⫶
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted transition-colors"
          onClick={() => formatText('justifyLeft')}
          title="محاذاة لليسار"
        >
          ⫥
        </button>
      </div>
      <div
        ref={editorRef}
        className="p-3 min-h-[150px] max-h-[500px] overflow-y-auto focus:outline-none"
        contentEditable
        onInput={handleInput}
        placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
        dir="rtl"
      />
    </div>
  );
};
