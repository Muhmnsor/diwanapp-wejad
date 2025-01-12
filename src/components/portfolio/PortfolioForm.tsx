import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  name: z.string().min(1, 'اسم المحفظة مطلوب'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PortfolioFormProps {
  onSuccess: () => void;
}

export const PortfolioForm = ({ onSuccess }: PortfolioFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Creating portfolio with values:', values);
      
      // First create the portfolio in Asana
      const { data: asanaData, error: asanaError } = await supabase.functions.invoke('create-portfolio', {
        body: JSON.stringify(values)
      });
      
      if (asanaError) {
        throw new Error(asanaError.message || 'Failed to create portfolio in Asana');
      }

      console.log('Asana portfolio created:', asanaData);

      // Then create in Supabase with the Asana GID
      const { error: supabaseError } = await supabase.from('portfolio_workspaces').insert({
        name: values.name,
        description: values.description,
        asana_gid: asanaData.gid,
      });

      if (supabaseError) throw supabaseError;

      toast.success('تم إنشاء المحفظة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      onSuccess();
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('حدث خطأ أثناء إنشاء المحفظة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المحفظة</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل اسم المحفظة" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="أدخل وصف المحفظة" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المحفظة'}
          </Button>
        </div>
      </form>
    </Form>
  );
};