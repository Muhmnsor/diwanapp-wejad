
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MeetingType, AttendanceType } from "@/types/meeting";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { Loader2, Plus, Trash, Upload, UserPlus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface MeetingDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  folderId?: string;
}

export const MeetingDialogWrapper = ({ open, onOpenChange, onSuccess, folderId }: MeetingDialogWrapperProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Meeting basic details
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [location, setLocation] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("other");
  const [attendanceType, setAttendanceType] = useState<AttendanceType>("in_person");
  const [objectives, setObjectives] = useState("");
  const [agenda, setAgenda] = useState("");
  
  // Participants
  const [participants, setParticipants] = useState<Array<{
    userId?: string;
    displayName: string;
    email?: string;
    phone?: string;
    role: string;
    isExternal: boolean;
  }>>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [newParticipantPhone, setNewParticipantPhone] = useState("");
  const [newParticipantRole, setNewParticipantRole] = useState("member");
  const [newParticipantIsExternal, setNewParticipantIsExternal] = useState(false);
  
  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setStartTime("");
    setDuration(60);
    setLocation("");
    setLocationUrl("");
    setMeetingType("other");
    setAttendanceType("in_person");
    setObjectives("");
    setAgenda("");
    setParticipants([]);
    setAttachments([]);
    setActiveTab("details");
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  const addParticipant = () => {
    if (!newParticipantName.trim()) {
      toast.error("يجب إدخال اسم المشارك");
      return;
    }

    setParticipants([
      ...participants,
      {
        displayName: newParticipantName,
        email: newParticipantEmail,
        phone: newParticipantPhone,
        role: newParticipantRole,
        isExternal: newParticipantIsExternal
      }
    ]);

    // Reset input fields
    setNewParticipantName("");
    setNewParticipantEmail("");
    setNewParticipantPhone("");
    setNewParticipantRole("member");
    setNewParticipantIsExternal(false);
  };
  
  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الاجتماع");
      return false;
    }
    
    if (!date) {
      toast.error("يرجى تحديد تاريخ الاجتماع");
      return false;
    }
    
    if (!startTime) {
      toast.error("يرجى تحديد وقت بدء الاجتماع");
      return false;
    }
    
    if (!duration || duration <= 0) {
      toast.error("يرجى تحديد مدة الاجتماع");
      return false;
    }
    
    if (!location.trim() && !locationUrl.trim()) {
      toast.error("يرجى تحديد موقع الاجتماع أو رابط الاجتماع عبر الإنترنت");
      return false;
    }
    
    return true;
  };

  const uploadAttachment = async (file: File, meetingId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `meetings/${meetingId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meeting-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('meeting-attachments')
      .getPublicUrl(filePath);

    return {
      name: file.name,
      path: filePath,
      type: file.type,
      size: file.size,
      url: publicUrlData.publicUrl
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title,
          date,
          start_time: startTime,
          duration,
          location,
          location_url: locationUrl,
          meeting_type: meetingType,
          attendance_type: attendanceType,
          objectives,
          agenda,
          folder_id: folderId,
          creator_id: user?.id,
          meeting_status: 'scheduled'
        })
        .select('id')
        .single();
        
      if (meetingError) throw meetingError;
      
      const meetingId = meetingData.id;
      
      // Add participants
      if (participants.length > 0) {
        const participantsData = participants.map(p => ({
          meeting_id: meetingId,
          user_id: p.userId,
          user_email: p.email,
          user_display_name: p.displayName,
          user_phone: p.phone,
          role: p.role,
          is_external: p.isExternal,
          attendance_status: 'pending'
        }));
        
        const { error: participantsError } = await supabase
          .from('meeting_participants')
          .insert(participantsData);
          
        if (participantsError) {
          console.error('Error adding participants:', participantsError);
        }
      }
      
      // Upload attachments
      if (attachments.length > 0) {
        const attachmentPromises = attachments.map(async file => {
          const fileData = await uploadAttachment(file, meetingId);
          
          return {
            meeting_id: meetingId,
            file_name: fileData.name,
            file_path: fileData.path,
            file_type: fileData.type,
            file_size: fileData.size,
            uploaded_by: user?.id
          };
        });
        
        const attachmentData = await Promise.all(attachmentPromises);
        
        const { error: attachmentsError } = await supabase
          .from('meeting_attachments')
          .insert(attachmentData);
          
        if (attachmentsError) {
          console.error('Error adding attachments:', attachmentsError);
        }
      }

      toast.success('تم إنشاء الاجتماع بنجاح');
      
      // Refresh meetings list
      queryClient.invalidateQueries({queryKey: ['meetings']});
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('حدث خطأ أثناء إنشاء الاجتماع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTab = () => {
    if (activeTab === "details") {
      setActiveTab("participants");
    } else if (activeTab === "participants") {
      setActiveTab("attachments");
    }
  };

  const handlePreviousTab = () => {
    if (activeTab === "attachments") {
      setActiveTab("participants");
    } else if (activeTab === "participants") {
      setActiveTab("details");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء اجتماع جديد</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">تفاصيل الاجتماع</TabsTrigger>
            <TabsTrigger value="participants">المشاركون</TabsTrigger>
            <TabsTrigger value="attachments">الملفات المرفقة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الاجتماع *</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="أدخل عنوان الاجتماع" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ *</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-time">وقت البدء *</Label>
                  <Input 
                    id="start-time" 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">المدة (بالدقائق) *</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  value={duration.toString()} 
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)} 
                  min="1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-type">نوع الاجتماع</Label>
                  <Select value={meetingType} onValueChange={(value: MeetingType) => setMeetingType(value)}>
                    <SelectTrigger id="meeting-type">
                      <SelectValue placeholder="حدد نوع الاجتماع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board">مجلس إدارة</SelectItem>
                      <SelectItem value="department">اجتماع قسم</SelectItem>
                      <SelectItem value="team">اجتماع فريق</SelectItem>
                      <SelectItem value="committee">اجتماع لجنة</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="attendance-type">نوع الحضور</Label>
                  <Select value={attendanceType} onValueChange={(value: AttendanceType) => setAttendanceType(value)}>
                    <SelectTrigger id="attendance-type">
                      <SelectValue placeholder="حدد نوع الحضور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">حضوري</SelectItem>
                      <SelectItem value="remote">عن بعد</SelectItem>
                      <SelectItem value="hybrid">هجين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="أدخل موقع الاجتماع" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location-url">رابط الاجتماع (إذا كان عن بعد)</Label>
                <Input 
                  id="location-url" 
                  value={locationUrl} 
                  onChange={(e) => setLocationUrl(e.target.value)} 
                  placeholder="أدخل رابط الاجتماع الافتراضي" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objectives">أهداف الاجتماع</Label>
                <Textarea 
                  id="objectives" 
                  value={objectives} 
                  onChange={(e) => setObjectives(e.target.value)} 
                  placeholder="أدخل أهداف الاجتماع" 
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agenda">جدول الأعمال</Label>
                <Textarea 
                  id="agenda" 
                  value={agenda} 
                  onChange={(e) => setAgenda(e.target.value)} 
                  placeholder="أدخل جدول أعمال الاجتماع" 
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="participants" className="space-y-4">
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">إضافة مشارك</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participant-name">اسم المشارك *</Label>
                  <Input 
                    id="participant-name" 
                    value={newParticipantName} 
                    onChange={(e) => setNewParticipantName(e.target.value)} 
                    placeholder="أدخل اسم المشارك" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="participant-email">البريد الإلكتروني</Label>
                  <Input 
                    id="participant-email" 
                    value={newParticipantEmail} 
                    onChange={(e) => setNewParticipantEmail(e.target.value)} 
                    placeholder="أدخل البريد الإلكتروني" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participant-phone">رقم الهاتف</Label>
                  <Input 
                    id="participant-phone" 
                    value={newParticipantPhone} 
                    onChange={(e) => setNewParticipantPhone(e.target.value)} 
                    placeholder="أدخل رقم الهاتف" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="participant-role">الدور</Label>
                  <Select value={newParticipantRole} onValueChange={setNewParticipantRole}>
                    <SelectTrigger id="participant-role">
                      <SelectValue placeholder="حدد دور المشارك" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chairman">رئيس الاجتماع</SelectItem>
                      <SelectItem value="member">عضو</SelectItem>
                      <SelectItem value="secretary">مقرر</SelectItem>
                      <SelectItem value="viewer">مستمع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-external"
                  checked={newParticipantIsExternal}
                  onChange={(e) => setNewParticipantIsExternal(e.target.checked)}
                  className="ml-2"
                />
                <Label htmlFor="is-external">مشارك خارجي</Label>
              </div>
              
              <Button type="button" onClick={addParticipant} className="mt-2">
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة مشارك
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">المشاركون</h3>
              
              {participants.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  لم تتم إضافة مشاركين بعد
                </div>
              ) : (
                <div className="border rounded-md divide-y">
                  {participants.map((participant, index) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{participant.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {participant.role === 'chairman' && 'رئيس الاجتماع'}
                          {participant.role === 'member' && 'عضو'}
                          {participant.role === 'secretary' && 'مقرر'}
                          {participant.role === 'viewer' && 'مستمع'}
                          {participant.isExternal && ' (خارجي)'}
                        </div>
                        {participant.email && (
                          <div className="text-sm text-muted-foreground">{participant.email}</div>
                        )}
                        {participant.phone && (
                          <div className="text-sm text-muted-foreground">{participant.phone}</div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeParticipant(index)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="attachments" className="space-y-4">
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">إضافة ملفات مرفقة</h3>
              
              <div className="border-dashed border-2 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm">اضغط لاختيار الملفات أو قم بسحبها وإفلاتها هنا</div>
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">الملفات المرفقة</h3>
              
              {attachments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  لم تتم إضافة ملفات بعد
                </div>
              ) : (
                <div className="border rounded-md divide-y">
                  {attachments.map((file, index) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between pt-4">
          {activeTab !== "details" && (
            <Button type="button" variant="outline" onClick={handlePreviousTab}>
              السابق
            </Button>
          )}
          
          <div>
            <Button type="button" variant="outline" onClick={handleClose} className="ml-2">
              إلغاء
            </Button>
            
            {activeTab === "attachments" ? (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء الاجتماع'
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleNextTab}>
                التالي
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
