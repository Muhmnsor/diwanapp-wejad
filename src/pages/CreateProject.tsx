import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateProject = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">إنشاء مشروع جديد</h1>
      {/* Project form will be implemented here */}
      <div className="text-center text-gray-500">
        جاري العمل على هذه الصفحة...
      </div>
    </div>
  );
};

export default CreateProject;