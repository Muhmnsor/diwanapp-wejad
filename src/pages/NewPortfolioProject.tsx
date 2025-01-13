import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const NewPortfolioProject = () => {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Creating new portfolio project:', { portfolioId, title, description });
      
      // First create the project with correct project_type
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title,
          description,
          start_date: new Date(),
          end_date: new Date(),
          max_attendees: 0,
          image_url: '/placeholder.svg',
          event_type: 'in-person',
          beneficiary_type: 'both',
          event_path: 'environment',
          event_category: 'social',
          project_type: 'portfolio_project' // تحديد نوع المشروع بشكل صحيح
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Then create the portfolio project association
      const { error: portfolioProjectError } = await supabase
        .from('portfolio_projects')
        .insert([{
          portfolio_id: portfolioId,
          project_id: projectData.id
        }]);

      if (portfolioProjectError) throw portfolioProjectError;

      toast.success('تم إنشاء المشروع بنجاح');
      navigate(`/portfolios/${portfolioId}`);
    } catch (error) {
      console.error('Error creating portfolio project:', error);
      toast.error('حدث خطأ أثناء إنشاء المشروع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          إضافة مشروع جديد إلى {portfolio?.name}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              عنوان المشروع
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              وصف المشروع
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/portfolios/${portfolioId}`)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المشروع'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewPortfolioProject;