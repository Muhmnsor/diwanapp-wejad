
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { MeetingFoldersGrid } from "@/components/meetings/folders/MeetingFoldersGrid";
import { MeetingsNavHeader } from "@/components/meetings/MeetingsNavHeader";

const MeetingFoldersPage = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <MeetingsNavHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingFoldersGrid />
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default MeetingFoldersPage;
