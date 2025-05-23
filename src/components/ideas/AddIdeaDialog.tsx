
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BasicInfoFields } from "./form/BasicInfoFields";
import { DepartmentsSection } from "./form/DepartmentsSection";
import { PartnersSection } from "./form/PartnersSection";
import { CostsSection } from "./form/CostsSection";
import { SimilarIdeasSection } from "./form/SimilarIdeasSection";
import { SupportingFilesSection, SupportingFile } from "./form/SupportingFilesSection";
import { AddIdeaDialogProps, Department, Partner, CostItem, SimilarIdea } from "./types";

export const AddIdeaDialog = ({ open, onOpenChange }: AddIdeaDialogProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opportunity, setOpportunity] = useState("");
  const [problem, setProblem] = useState("");
  const [departments, setDepartments] = useState<Department[]>([{ name: "", contribution: "" }]);
  const [benefits, setBenefits] = useState("");
  const [requiredResources, setRequiredResources] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [duration, setDuration] = useState("");
  const [ideaType, setIdeaType] = useState("برنامج");
  const [similarIdeas, setSimilarIdeas] = useState<SimilarIdea[]>([{ title: "", link: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [partners, setPartners] = useState<Partner[]>([{ name: "", contribution: "" }]);
  const [costs, setCosts] = useState<CostItem[]>([{ item: "", quantity: 0, total_cost: 0 }]);
  const [supportingFiles, setSupportingFiles] = useState<SupportingFile[]>([{ name: "", file: null }]);
  const [discussionPeriodDays, setDiscussionPeriodDays] = useState("7");
  const [discussionPeriodHours, setDiscussionPeriodHours] = useState("0");

  useEffect(() => {
    const newTotal = costs.reduce((sum, cost) => sum + (cost.total_cost || 0), 0);
    setTotalCost(newTotal);
  }, [costs]);

  const handleDepartmentChange = (index: number, field: keyof Department, value: string) => {
    const newDepartments = [...departments];
    newDepartments[index][field] = value;
    setDepartments(newDepartments);
  };

  const handlePartnerChange = (index: number, field: keyof Partner, value: string) => {
    const newPartners = [...partners];
    newPartners[index][field] = value;
    setPartners(newPartners);
  };

  const handleCostChange = (index: number, field: keyof CostItem, value: number | string) => {
    const newCosts = [...costs];
    if (typeof newCosts[index] === 'object') {
      (newCosts[index] as any)[field] = value;
      setCosts(newCosts);
    }
  };

  const handleSimilarIdeaChange = (index: number, field: keyof SimilarIdea, value: string) => {
    const newIdeas = [...similarIdeas];
    newIdeas[index][field] = value;
    setSimilarIdeas(newIdeas);
  };

  const handleFileChange = (index: number, field: keyof SupportingFile, value: any) => {
    const newFiles = [...supportingFiles];
    newFiles[index][field] = value;
    setSupportingFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Starting form submission...");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error('Authentication error: ' + authError.message);
      }

      if (!user) {
        console.error("No user found");
        throw new Error('User not authenticated');
      }

      console.log("Authenticated user:", user.id);
      console.log("Preparing files for upload...");

      // Upload files
      const uploadedFiles = await Promise.all(
        supportingFiles
          .filter(file => file.name && file.file)
          .map(async (file) => {
            if (!file.file) return null;

            const fileExt = file.file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            console.log("Uploading file:", fileName);
            
            const { error: uploadError } = await supabase.storage
              .from('idea-files')
              .upload(fileName, file.file);

            if (uploadError) {
              console.error("File upload error:", uploadError);
              throw uploadError;
            }

            console.log("File uploaded successfully:", fileName);
            return {
              name: file.name,
              file_path: fileName
            };
          })
      );

      console.log("Files uploaded:", uploadedFiles);

      const discussionPeriod = `${discussionPeriodDays} days ${discussionPeriodHours} hours`;
      console.log("Discussion period:", discussionPeriod);

      // Prepare idea data
      const ideaData = {
        title,
        description,
        opportunity,
        problem,
        contributing_departments: departments.filter(d => d.name && d.contribution),
        expected_partners: partners.filter(p => p.name && p.contribution),
        benefits,
        expected_costs: costs.filter(c => c.item && c.quantity > 0),
        required_resources: requiredResources,
        proposed_execution_date: proposedDate,
        duration,
        idea_type: ideaType,
        similar_ideas: similarIdeas.filter(idea => idea.title || idea.link),
        supporting_files: uploadedFiles.filter(Boolean),
        discussion_period: discussionPeriod,
        status: 'draft',
        created_by: user.id
      };

      console.log("Submitting idea data:", ideaData);

      const { error: insertError } = await supabase
        .from('ideas')
        .insert([ideaData]);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("Idea submitted successfully");
      toast.success("تم إضافة الفكرة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setOpportunity("");
      setProblem("");
      setDepartments([{ name: "", contribution: "" }]);
      setBenefits("");
      setRequiredResources("");
      setProposedDate("");
      setDuration("");
      setIdeaType("برنامج");
      setSimilarIdeas([{ title: "", link: "" }]);
      setPartners([{ name: "", contribution: "" }]);
      setCosts([{ item: "", quantity: 0, total_cost: 0 }]);
      setSupportingFiles([{ name: "", file: null }]);
      setDiscussionPeriodDays("7");
      setDiscussionPeriodHours("0");
    } catch (error) {
      console.error('Error adding idea:', error);
      toast.error("حدث خطأ أثناء إضافة الفكرة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="bg-white rounded-lg border border-border p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-right">إضافة فكرة جديدة</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <BasicInfoFields
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          opportunity={opportunity}
          setOpportunity={setOpportunity}
          problem={problem}
          setProblem={setProblem}
          ideaType={ideaType}
          setIdeaType={setIdeaType}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="proposedDate" className="text-right block text-sm font-medium">
              تاريخ التنفيذ المقترح
            </label>
            <Input
              type="date"
              id="proposedDate"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="duration" className="text-right block text-sm font-medium">
              المدة المتوقعة للتنفيذ
            </label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="text-right"
              placeholder="مثال: 3 أشهر"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="discussionPeriodDays" className="text-right block text-sm font-medium">
              مدة المناقشة (أيام)
            </label>
            <Input
              type="number"
              id="discussionPeriodDays"
              value={discussionPeriodDays}
              onChange={(e) => setDiscussionPeriodDays(e.target.value)}
              className="text-right"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="discussionPeriodHours" className="text-right block text-sm font-medium">
              مدة المناقشة (ساعات)
            </label>
            <Input
              type="number"
              id="discussionPeriodHours"
              value={discussionPeriodHours}
              onChange={(e) => setDiscussionPeriodHours(e.target.value)}
              className="text-right"
              min="0"
              max="23"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="benefits" className="text-right block text-sm font-medium">
            العوائد من تنفيذ الفكرة
          </label>
          <Textarea
            id="benefits"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            className="text-right"
            placeholder="اذكر العوائد المتوقعة من تنفيذ الفكرة"
            required
          />
        </div>

        <DepartmentsSection
          departments={departments}
          onDepartmentChange={handleDepartmentChange}
          onAddDepartment={() => setDepartments([...departments, { name: "", contribution: "" }])}
        />

        <PartnersSection
          partners={partners}
          onPartnerChange={handlePartnerChange}
          onAddPartner={() => setPartners([...partners, { name: "", contribution: "" }])}
        />

        <div className="space-y-2">
          <label htmlFor="requiredResources" className="text-right block text-sm font-medium">
            الموارد التنفيذية المطلوبة
          </label>
          <Textarea
            id="requiredResources"
            value={requiredResources}
            onChange={(e) => setRequiredResources(e.target.value)}
            className="text-right"
            placeholder="اذكر الموارد المطلوبة لتنفيذ الفكرة"
            required
          />
        </div>

        <CostsSection
          costs={costs}
          totalCost={totalCost}
          onCostChange={handleCostChange}
          onAddCost={() => setCosts([...costs, { item: "", quantity: 0, total_cost: 0 }])}
        />

        <SimilarIdeasSection
          similarIdeas={similarIdeas}
          onSimilarIdeaChange={handleSimilarIdeaChange}
          onAddSimilarIdea={() => {
            if (similarIdeas.length < 10) {
              setSimilarIdeas([...similarIdeas, { title: "", link: "" }]);
            } else {
              toast.error("لا يمكن إضافة أكثر من 10 أفكار مشابهة");
            }
          }}
        />

        <SupportingFilesSection
          files={supportingFiles}
          onFileChange={handleFileChange}
          onAddFile={() => setSupportingFiles([...supportingFiles, { name: "", file: null }])}
          onRemoveFile={(index) => {
            const newFiles = supportingFiles.filter((_, i) => i !== index);
            setSupportingFiles(newFiles.length ? newFiles : [{ name: "", file: null }]);
          }}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الإضافة..." : "إضافة الفكرة"}
          </Button>
        </div>
      </form>
    </div>
  );
};

