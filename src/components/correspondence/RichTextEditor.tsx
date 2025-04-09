import React, { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Link,
  FileText,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "أدخل النص هنا...",
  minHeight = "200px"
}) => {
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [showImageDialog, setShowImageDialog] = useState<boolean>(false);
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkText, setLinkText] = useState<string>("");
  
  const editorRef = React.useRef<HTMLDivElement>(null);
  
  const execCommand = (command: string, showUI: boolean = false, value?: string) => {
    document.execCommand(command, showUI, value);
    
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };
  
  const handleImageInsert = () => {
    if (!imageUrl) return;
    
    execCommand('insertHTML', false, `<img src="${imageUrl}" alt="صورة" style="max-width: 100%;" />`);
    setImageUrl("");
    setShowImageDialog(false);
  };
  
  const handleLinkInsert = () => {
    if (!linkUrl) return;
    
    const text = linkText || linkUrl;
    execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank">${text}</a>`);
    setLinkUrl("");
    setLinkText("");
    setShowLinkDialog(false);
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Get clipboard text
    const text = e.clipboardData.getData('text/plain');
    
    // Insert as plain text
    execCommand('insertText', false, text);
  };
  
  return (
    <div className="border rounded-md">
      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <TabsList className="w-full justify-start rounded-none">
            <TabsTrigger value="edit" className="flex-1">تحرير</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">معاينة</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="edit" className="p-0">
          <div className="border-b bg-muted/50 p-1 flex flex-wrap gap-1">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('bold')}
              title="غامق"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('italic')}
              title="مائل"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('underline')}
              title="تحته خط"
            >
              <Underline className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-[1px] bg-border mx-1"></div>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('insertUnorderedList')}
              title="قائمة نقطية"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('insertOrderedList')}
              title="قائمة مرقمة"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-[1px] bg-border mx-1"></div>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('justifyLeft')}
              title="محاذاة لليسار"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('justifyCenter')}
              title="محاذاة للوسط"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => execCommand('justifyRight')}
              title="محاذاة لليمين"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-[1px] bg-border mx-1"></div>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowImageDialog(!showImageDialog)}
              title="إدراج صورة"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLinkDialog(!showLinkDialog)}
              title="إدراج رابط"
            >
              <Link className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-[1px] bg-border mx-1"></div>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.innerHTML = "";
                  onChange("");
                }
              }}
              title="مسح المحتوى"
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          
          {showImageDialog && (
            <div className="p-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="أدخل رابط الصورة" 
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleImageInsert}
                  disabled={!imageUrl}
                >
                  إدراج
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowImageDialog(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
          
          {showLinkDialog && (
            <div className="p-3 border-b bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="أدخل نص الرابط" 
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="أدخل عنوان الرابط" 
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleLinkInsert}
                  disabled={!linkUrl}
                >
                  إدراج
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLinkDialog(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
          
          <div
            ref={editorRef}
            contentEditable
            className="p-4 focus:outline-none"
            style={{ minHeight }}
            onInput={e => onChange(e.currentTarget.innerHTML)}
            onPaste={handlePaste}
            dangerouslySetInnerHTML={{ __html: value }}
            placeholder={placeholder}
          ></div>
        </TabsContent>
        
        <TabsContent value="preview" className="p-4">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }}></div>
          ) : (
            <div className="text-muted-foreground flex items-center justify-center h-40">
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p>لا يوجد محتوى للعرض</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

