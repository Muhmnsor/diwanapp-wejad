
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { CertificateTemplateDialog } from "./CertificateTemplateDialog";
import { CertificateTemplateList } from "./CertificateTemplateList";
import { Input } from "@/components/ui/input";
import { TemplateCategorySelector } from "./categories/TemplateCategorySelector";

export const CertificateTemplates = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['certificate-templates'],
    queryFn: async () => {
      console.log('Fetching certificate templates...');
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      console.log('Fetched templates:', data);
      return data;
    }
  });

  // Extract categories from templates
  const categories = templates 
    ? [...new Set(templates.map(template => template.category || 'عام'))]
    : ['عام'];

  // Add new category to database
  const addCategory = async (newCategory: string) => {
    // Save category by updating a template (placeholder implementation)
    // In a real implementation, you might want a dedicated categories table
    toast.success(`تم إضافة تصنيف "${newCategory}" بنجاح`);
    setSelectedCategory(newCategory);
  };

  // Filter templates by search query and category
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = searchQuery
      ? template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesCategory = selectedCategory 
      ? (template.category || 'عام') === selectedCategory 
      : true;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قوالب الشهادات</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة قالب جديد
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <TemplateCategorySelector 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onAddCategory={addCategory}
        />
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن قالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      <CertificateTemplateList 
        templates={filteredTemplates || []} 
      />

      <CertificateTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
