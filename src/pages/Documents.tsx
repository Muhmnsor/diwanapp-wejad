
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { FileText, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Documents = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="documents" dir="rtl" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>المستندات</span>
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span>الأرشيف</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <FileText className="w-16 h-16 text-primary" />
              <h1 className="text-2xl font-bold text-primary text-center">قيد التطوير - المستندات</h1>
            </div>
          </TabsContent>

          <TabsContent value="archive" className="mt-6">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Archive className="w-16 h-16 text-primary" />
              <h1 className="text-2xl font-bold text-primary text-center">قيد التطوير - الأرشيف</h1>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Documents;
