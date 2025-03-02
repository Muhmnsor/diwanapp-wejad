
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Download } from "lucide-react";
import { ExtendButton } from "../components/ExtendButton";
import { IdeaExportDialog } from "../components/export/IdeaExportDialog";
import { useIdeaStatus } from "../hooks/useIdeaStatus";
import { ExtendDiscussionDialog } from "../dialogs/ExtendDiscussionDialog";

interface SecondaryHeaderProps {
  onIdeaUpdate?: () => void;
}

export const SecondaryHeader = ({ onIdeaUpdate }: SecondaryHeaderProps) => {
  const { id } = useParams<{ id: string }>();
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const { isAdmin } = useIdeaStatus(id);
  
  const handleExtendSuccess = () => {
    console.log("تم تمديد فترة المناقشة بنجاح");
    // استدعاء دالة التحديث إذا كانت متوفرة
    if (onIdeaUpdate) {
      onIdeaUpdate();
    }
  };
  
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm py-2">
      <div className="container mx-auto flex justify-between items-center px-4" dir="rtl">
        <h2 className="text-xl font-semibold">تفاصيل الفكرة</h2>
        
        <div className="flex items-center gap-3">
          {id && isAdmin && (
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
              onClick={() => setShowExtendDialog(true)}
            >
              <Clock className="h-4 w-4" /> تعديل فترة المناقشة
            </Button>
          )}
          
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="h-4 w-4" /> تصدير الفكرة
          </Button>
        </div>
      </div>
      
      {id && (
        <>
          <ExtendDiscussionDialog 
            ideaId={id} 
            open={showExtendDialog} 
            onOpenChange={setShowExtendDialog}
            onSuccess={handleExtendSuccess}
          />
          <IdeaExportDialog
            ideaId={id}
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
          />
        </>
      )}
    </div>
  );
};
