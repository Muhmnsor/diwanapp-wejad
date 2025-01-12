import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FolderKanban, ChevronDown, ChevronRight, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReportDeleteDialog } from "@/components/reports/shared/components/ReportDeleteDialog";

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  asana_gid?: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
}

interface PortfolioProject {
  portfolio_id: string;
  project_id: string;
  projects: Project;
}

const Tasks = () => {
  const [expandedPortfolios, setExpandedPortfolios] = useState<{ [key: string]: boolean }>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    name: '',
    description: ''
  });

  // Fetch portfolios
  const { data: portfolios, isLoading: isLoadingPortfolios, refetch: refetchPortfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('Fetching portfolios...');
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolios:', error);
        toast.error('حدث خطأ أثناء جلب المحافظ');
        throw error;
      }

      console.log('Fetched portfolios:', data);
      return data as Portfolio[];
    }
  });

  // Fetch portfolio projects
  const { data: portfolioProjects, isLoading: isLoadingPortfolioProjects } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: async () => {
      console.log('Fetching portfolio projects...');
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(`
          portfolio_id,
          project_id,
          projects:projects (
            id,
            title,
            description
          )
        `);

      if (error) {
        console.error('Error fetching portfolio projects:', error);
        toast.error('حدث خطأ أثناء جلب المشاريع');
        throw error;
      }

      console.log('Fetched portfolio projects:', data);
      return data as unknown as PortfolioProject[];
    }
  });

  // Add sync function
  const syncPortfolios = async () => {
    try {
      const { error } = await supabase.functions.invoke('sync-asana-portfolios')
      
      if (error) {
        console.error('Error syncing portfolios:', error);
        toast.error('حدث خطأ أثناء مزامنة المحافظ');
        return;
      }

      toast.success('تم مزامنة المحافظ بنجاح');
      refetchPortfolios();
      
    } catch (error) {
      console.error('Error syncing portfolios:', error);
      toast.error('حدث خطأ أثناء مزامنة المحافظ');
    }
  };

  const handleCreatePortfolio = async () => {
    try {
      if (!portfolioForm.name.trim()) {
        toast.error('الرجاء إدخال اسم المحفظة');
        return;
      }

      // First create portfolio in Asana
      const asanaResponse = await supabase.functions.invoke('create-asana-portfolio', {
        body: { 
          name: portfolioForm.name,
          notes: portfolioForm.description
        }
      });

      if (asanaResponse.error) {
        throw new Error('Failed to create portfolio in Asana');
      }

      const asanaGid = asanaResponse.data.gid;
      console.log('Created Asana portfolio with GID:', asanaGid);

      // Then create in our database with the Asana GID
      const { error } = await supabase
        .from('portfolios')
        .insert([
          { 
            name: portfolioForm.name,
            description: portfolioForm.description,
            asana_gid: asanaGid
          }
        ]);

      if (error) {
        console.error('Error creating portfolio:', error);
        toast.error('حدث خطأ أثناء إنشاء المحفظة');
        return;
      }

      toast.success('تم إنشاء المحفظة بنجاح');
      setShowCreateDialog(false);
      setPortfolioForm({ name: '', description: '' });
      refetchPortfolios();
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('حدث خطأ أثناء إنشاء المحفظة');
    }
  };

  const handleEditPortfolio = async () => {
    try {
      if (!selectedPortfolio || !portfolioForm.name.trim()) {
        toast.error('الرجاء إدخال اسم المحفظة');
        return;
      }

      const { error } = await supabase
        .from('portfolios')
        .update({ 
          name: portfolioForm.name,
          description: portfolioForm.description
        })
        .eq('id', selectedPortfolio.id);

      if (error) {
        console.error('Error updating portfolio:', error);
        toast.error('حدث خطأ أثناء تحديث المحفظة');
        return;
      }

      toast.success('تم تحديث المحفظة بنجاح');
      setShowEditDialog(false);
      setSelectedPortfolio(null);
      setPortfolioForm({ name: '', description: '' });
      refetchPortfolios();

    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('حدث خطأ أثناء تحديث المحفظة');
    }
  };

  // Update handleDeletePortfolio
  const handleDeletePortfolio = async () => {
    try {
      if (!selectedPortfolio) return;

      // First delete from Asana if we have an Asana GID
      if (selectedPortfolio.asana_gid) {
        const { error: asanaError } = await supabase.functions.invoke('delete-asana-portfolio', {
          body: { asana_gid: selectedPortfolio.asana_gid }
        });

        if (asanaError) {
          console.error('Error deleting from Asana:', asanaError);
          toast.error('حدث خطأ أثناء حذف المحفظة من Asana');
          return;
        }
      }

      // Then delete from our database
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', selectedPortfolio.id);

      if (error) {
        console.error('Error deleting portfolio:', error);
        toast.error('حدث خطأ أثناء حذف المحفظة');
        return;
      }

      toast.success('تم حذف المحفظة بنجاح');
      setShowDeleteDialog(false);
      setSelectedPortfolio(null);
      refetchPortfolios();

    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('حدث خطأ أثناء حذف المحفظة');
    }
  };

  const togglePortfolio = (portfolioId: string) => {
    setExpandedPortfolios(prev => ({
      ...prev,
      [portfolioId]: !prev[portfolioId]
    }));
  };

  const getProjectsForPortfolio = (portfolioId: string) => {
    return portfolioProjects
      ?.filter(pp => pp.portfolio_id === portfolioId)
      .map(pp => pp.projects) || [];
  };

  const openEditDialog = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setPortfolioForm({
      name: portfolio.name,
      description: portfolio.description || ''
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setShowDeleteDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">المحافظ والمشاريع</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={syncPortfolios}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              مزامنة مع Asana
            </Button>
            <Button onClick={() => {
              setPortfolioForm({ name: '', description: '' });
              setShowCreateDialog(true);
            }}>
              <Plus className="h-4 w-4 ml-2" />
              محفظة جديدة
            </Button>
          </div>
        </div>

        {isLoadingPortfolios || isLoadingPortfolioProjects ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !portfolios?.length ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <FolderKanban className="w-16 h-16 text-primary" />
            <p className="text-lg text-muted-foreground text-center">لا توجد محافظ حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {portfolios.map((portfolio) => (
              <Collapsible
                key={portfolio.id}
                open={expandedPortfolios[portfolio.id]}
                onOpenChange={() => togglePortfolio(portfolio.id)}
              >
                <Card className="p-4">
                  <CollapsibleTrigger className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{portfolio.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(portfolio);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(portfolio);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      {expandedPortfolios[portfolio.id] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 space-y-2">
                    {portfolio.description && (
                      <p className="text-muted-foreground mb-4">{portfolio.description}</p>
                    )}
                    
                    <div className="grid gap-2">
                      {getProjectsForPortfolio(portfolio.id).map((project) => (
                        <Card key={project.id} className="p-4 hover:bg-accent transition-colors">
                          <h4 className="font-medium">{project.title}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.description}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}

        {/* Create Portfolio Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">إنشاء محفظة جديدة</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  placeholder="اسم المحفظة"
                  value={portfolioForm.name}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  id="description"
                  placeholder="وصف المحفظة"
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                  className="text-right"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePortfolio}>إنشاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Portfolio Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل المحفظة</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  placeholder="اسم المحفظة"
                  value={portfolioForm.name}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  id="description"
                  placeholder="وصف المحفظة"
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                  className="text-right"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditPortfolio}>حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Portfolio Dialog */}
        <ReportDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeletePortfolio}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;
