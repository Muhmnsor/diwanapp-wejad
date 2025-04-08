
import React, { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { useCorrespondence, Correspondence, Attachment } from "@/hooks/correspondence/useCorrespondence";
import { CorrespondenceTable } from "@/components/correspondence/CorrespondenceTable";
import { CorrespondenceViewDialog } from "@/components/correspondence/CorrespondenceViewDialog"; 

const IncomingOutgoingMail = () => {
  const { 
    correspondence, 
    isLoading, 
    downloadAttachment,
    viewCorrespondence 
  } = useCorrespondence();

  const [selectedCorrespondence, setSelectedCorrespondence] = useState<Correspondence | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleView = async (mail: Correspondence) => {
    try {
      const details = await viewCorrespondence(mail.id);
      setSelectedCorrespondence(details);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching correspondence details:", error);
    }
  };

  const handleDownload = (mail: Correspondence) => {
    if (mail.attachments && mail.attachments.length > 0) {
      // If there's only one attachment, download it directly
      if (mail.attachments.length === 1) {
        downloadAttachment(mail.attachments[0]);
      } 
      // If there are multiple attachments, open the dialog to let user choose
      else {
        handleView(mail);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <h1 className="text-2xl font-bold mb-6">الصادر والوارد</h1>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
          <CorrespondenceTable 
            mails={correspondence || []} 
            onView={handleView}
            onDownload={handleDownload}
            isLoading={isLoading}
          />
        </div>

        <CorrespondenceViewDialog 
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          correspondence={selectedCorrespondence}
          onDownload={downloadAttachment}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default IncomingOutgoingMail;
