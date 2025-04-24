
import { useState } from "react";
import { FormBuilderProvider } from "./FormBuilderContext";
import { FormBuilderToolbar } from "./toolbar/FormBuilderToolbar";
import { FormBuilderCanvas } from "./canvas/FormBuilderCanvas";
import { FormBuilderSidebar } from "./sidebar/FormBuilderSidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicFormDisplay } from "./preview/DynamicFormDisplay";

interface FormBuilderProps {
  onSave?: (formConfig: any) => void;
  initialFormData?: any;
}

export const FormBuilder = ({ onSave, initialFormData }: FormBuilderProps) => {
  const [activeTab, setActiveTab] = useState<string>("design");

  return (
    <FormBuilderProvider>
      <div className="bg-background rounded-md shadow">
        <div className="p-4 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList dir="rtl">
                <TabsTrigger value="design">تصميم النموذج</TabsTrigger>
                <TabsTrigger value="preview">معاينة النموذج</TabsTrigger>
                <TabsTrigger value="settings">إعدادات</TabsTrigger>
              </TabsList>
              
              <div>
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={() => {
                    // TODO: Handle form saving logic
                  }}
                >
                  حفظ النموذج
                </Button>
              </div>
            </div>

            <TabsContent value="design" className="p-0 border-none">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 bg-muted/30 p-4 border-r min-h-[500px]">
                  <FormBuilderToolbar />
                </div>
                
                <div className="col-span-6 p-4 min-h-[500px]">
                  <FormBuilderCanvas />
                </div>
                
                <div className="col-span-3 bg-muted/30 p-4 border-l min-h-[500px]">
                  <FormBuilderSidebar />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="border-none">
              <div className="p-4">
                <DynamicFormDisplay />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="border-none">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">إعدادات النموذج</h3>
                <p>هنا يمكن إضافة إعدادات إضافية للنموذج.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FormBuilderProvider>
  );
};
