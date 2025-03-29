
import { useState, useEffect } from "react";
import { TemplateStats } from "./TemplateStats";
import { TemplateControls } from "./TemplateControls";
import { TemplatesTable } from "./TemplatesTable";
import { AddTemplateDialog } from "./AddTemplateDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Template, TemplateFilterOptions } from "./types/template";
import { useAuthStore } from "@/store/authStore";

export const TemplatesTab = () => {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<TemplateFilterOptions>({
    departments: [],
    categories: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    department: "",
    template_number: "",
    description: "",
    category: ""
  });

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      setFilteredTemplates(data || []);
      
      // Extract unique departments and categories for filters
      const departments = [...new Set(data?.map(t => t.department) || [])];
      const categories = [...new Set(data?.map(t => t.category).filter(Boolean) || [])];
      
      setFilterOptions({
        departments,
        categories: categories as string[]
      });
      
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('حدث خطأ أثناء تحميل النماذج');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedDepartments, selectedCategories);
  };

  const handleFilterDepartmentChange = (departments: string[]) => {
    setSelectedDepartments(departments);
    applyFilters(searchQuery, departments, selectedCategories);
  };

  const handleFilterCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    applyFilters(searchQuery, selectedDepartments, categories);
  };

  const applyFilters = (query: string, departments: string[], categories: string[]) => {
    let filtered = templates;

    if (query) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.department.toLowerCase().includes(query.toLowerCase()) ||
        template.template_number.toLowerCase().includes(query.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (departments.length > 0) {
      filtered = filtered.filter(template => departments.includes(template.department));
    }

    if (categories.length > 0) {
      filtered = filtered.filter(template => 
        template.category && categories.includes(template.category)
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('حجم الملف يجب أن لا يتجاوز 10 ميجابايت');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleTemplateUpload = async (file: File, userId: string, templateData: any) => {
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `templates/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      // Create template record in database
      const { error: insertError } = await supabase
        .from('templates')
        .insert({
          name: templateData.name,
          department: templateData.department,
          template_number: templateData.template_number,
          description: templateData.description || '',
          category: templateData.category || '',
          file_path: filePath,
          file_url: publicUrlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          created_by: userId,
          status: 'active',
          downloads: 0,
          version: '1.0'
        });
        
      if (insertError) throw insertError;
      
      toast.success('تم رفع النموذج بنجاح');
      return true;
    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error('حدث خطأ أثناء رفع النموذج');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('الرجاء اختيار ملف');
      return;
    }

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setIsLoading(true);
      const success = await handleTemplateUpload(selectedFile, user.id, newTemplate);
      if (success) {
        fetchTemplates();
        setNewTemplate({ 
          name: "", 
          department: "", 
          template_number: "", 
          description: "", 
          category: "" 
        });
        setSelectedFile(null);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error submitting template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (templateId: string, fileUrl: string, fileName: string) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName || 'template');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update download count
      await supabase
        .from('templates')
        .update({ downloads: supabase.rpc('increment', { x: 1 }) })
        .eq('id', templateId);
        
      toast.success('جاري تنزيل النموذج');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('حدث خطأ أثناء تنزيل النموذج');
    }
  };

  const handleDelete = async (id: string, filePath?: string) => {
    try {
      // Delete from database first
      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      // If there's a file path, delete from storage
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Warning: File not deleted from storage:', storageError);
        }
      }
      
      toast.success('تم حذف النموذج بنجاح');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('حدث خطأ أثناء حذف النموذج');
    }
  };

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  return (
    <>
      <AddTemplateDialog
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        newTemplate={newTemplate}
        setNewTemplate={setNewTemplate}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={filterOptions.departments}
        categories={filterOptions.categories}
      />

      <TemplateStats templates={templates} />
      
      <TemplateControls 
        onSearch={handleSearch}
        onFilterDepartmentChange={handleFilterDepartmentChange}
        onFilterCategoryChange={handleFilterCategoryChange}
        onAddTemplate={() => setDialogOpen(true)}
        filterOptions={filterOptions}
      />

      <TemplatesTable
        templates={filteredTemplates}
        isLoading={isLoading}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onUpdate={fetchTemplates}
      />
    </>
  );
};
