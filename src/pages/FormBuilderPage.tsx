
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FormBuilderPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إنشاء نموذج ديناميكي</h1>
          
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-4 w-4" />
            عودة
          </Button>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <FormBuilder />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FormBuilderPage;
