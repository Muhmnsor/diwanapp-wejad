
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { MeetingFolderContent } from "@/components/meetings/folders/MeetingFolderContent";
import { MeetingsNavHeader } from "@/components/meetings/MeetingsNavHeader";

const MeetingFolderPage = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <MeetingsNavHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingFolderContent />
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default MeetingFolderPage;
