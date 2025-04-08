// src/components/correspondence/AddCorrespondenceDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, X, Upload, FileUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddCorrespondence, useAttachments } from '@/hooks/useCorrespondence';
import { useToast } from '@/components/ui/use-toast';

interface AddCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

export const AddCorrespondenceDialog: React.FC<AddCorrespondenceDialogProps> = ({ 
  isOpen, 
  onClose, 
  type 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    subject: '',
    sender: '',
    recipient: '',
    status: type === 'incoming' ? 'قيد المعالجة' : 'مسودة',
    type: type,
    date: new Date().toISOString().split('T')[0],
    content: '',
    priority: 'normal',
    is_confidential: false
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadAttachment } = useAttachments();
  const { addCorrespondence, adding } = useAddCorrespondence();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    // Validation
    if (!formData.subject || !formData.sender || !formData.recipient) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    // Submit data
    const result = await addCorrespondence(formData, selectedFiles);
    
    if (result.success) {
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة المعاملة بنجاح"
      });
      onClose();
    } else {
      toast({
        title: "حدث خطأ",
        description: result.error,
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {type === 'incoming' ? 'إضافة معاملة واردة جديدة' : 
             type === 'outgoing' ? 'إضافة معاملة صادرة جديدة' : 
             'إضافة خطاب جديد'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details">بيانات المعاملة</TabsTrigger>
            <TabsTrigger value="attachments">المرفقات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع *</Label>
                <Input 
                  id="subject" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="أدخل موضوع المعاملة" 
                />
              </div>
              
              {type === 'incoming' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sender">الجهة المرسلة *</Label>
                    <Input 
                      id="sender" 
                      name="sender"
                      value={formData.sender}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم الجهة المرسلة" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient">الجهة المستلمة *</Label>
                    <Input 
                      id="recipient" 
                      name="recipient"
                      value={formData.recipient}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم الجهة المستلمة" 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sender">الجهة المرسلة *</Label>
                    <Input 
                      id="sender" 
                      name="sender"
                      value={formData.sender}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم الجهة المرسلة" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient">الجهة المستلمة *</Label>
                    <Input 
                      id="recipient" 
                      name="recipient"
                      value={formData.recipient}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم الجهة المستلمة" 
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ *</Label>
                <Input 
                  id="date" 
                  name="date"
                  type="date" 
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'incoming' ? (
                      <>
                        <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                        <SelectItem value="مكتمل">مكتمل</SelectItem>
                        <SelectItem value="معلق">معلق</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="مسودة">مسودة</SelectItem>
                        <SelectItem value="قيد الإعداد">قيد الإعداد</SelectItem>
                        <SelectItem value="معتمد">معتمد</SelectItem>
                        <SelectItem value="مرسل">مرسل</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="normal">عادية</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch 
                  id="is_confidential" 
                  checked={formData.is_confidential}
                  onCheckedChange={(checked) => handleSwitchChange('is_confidential', checked)}
                />
                <Label htmlFor="is_confidential">معاملة سرية</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">المحتوى</Label>
              <Textarea 
                id="content" 
                name="content"
                placeholder="أدخل نص المعاملة أو ملاحظات عليها"
                rows={6}
                value={formData.content}
                onChange={handleInputChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="attachments" className="py-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-md p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                  multiple
                />
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium mb-1">انقر أو اسحب لإضافة ملفات</h3>
                  <p className="text-sm text-muted-foreground">
                    يمكنك إضافة مستندات PDF، صور، أو ملفات مكتبية أخرى
                  </p>
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-2 font-medium text-sm">
                    المرفقات ({selectedFiles.length})
                  </div>
                  <ul className="divide-y">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileUp className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type} • {file.size < 1024 * 1024
                                ? `${(file.size / 1024).toFixed(1)} KB`
                                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedFiles.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  لم تقم بإضافة أي مرفقات بعد
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          
          <Button 
            onClick={handleSubmit}
            disabled={adding}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            {adding ? 'جاري الحفظ...' : 'حفظ المعاملة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
