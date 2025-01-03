import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CertificateStatsCardProps {
  projectId: string;
}

export const CertificateStatsCard = ({ projectId }: CertificateStatsCardProps) => {
  const { data: stats } = useQuery({
    queryKey: ['project-certificates', projectId],
    queryFn: async () => {
      const { data: certificates, error } = await supabase
        .from('certificates')
        .select('id, status')
        .eq('project_id', projectId);

      if (error) throw error;

      const total = certificates?.length || 0;
      const active = certificates?.filter(cert => cert.status === 'active').length || 0;
      const percentage = total > 0 ? Math.round((active / total) * 100) : 0;

      return { total, active, percentage };
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">الشهادات المصدرة</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats?.active || 0}</div>
        <p className="text-xs text-muted-foreground">
          من إجمالي {stats?.total || 0} شهادة
        </p>
      </CardContent>
    </Card>
  );
};