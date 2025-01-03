import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VerificationStatsCardProps {
  projectId: string;
}

export const VerificationStatsCard = ({ projectId }: VerificationStatsCardProps) => {
  const { data: stats } = useQuery({
    queryKey: ['certificate-verifications', projectId],
    queryFn: async () => {
      // Get certificates for this project
      const { data: certificates } = await supabase
        .from('certificates')
        .select('id')
        .eq('project_id', projectId);

      if (!certificates?.length) return { total: 0, lastDay: 0 };

      // Get verifications for these certificates
      const certificateIds = certificates.map(cert => cert.id);
      
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: verifications } = await supabase
        .from('certificate_verifications')
        .select('id, verified_at')
        .in('certificate_id', certificateIds);

      const lastDayVerifications = verifications?.filter(v => 
        new Date(v.verified_at) >= oneDayAgo
      ).length || 0;

      return {
        total: verifications?.length || 0,
        lastDay: lastDayVerifications
      };
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">عمليات التحقق</CardTitle>
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats?.total || 0}</div>
        <p className="text-xs text-muted-foreground">
          {stats?.lastDay || 0} عملية تحقق في آخر 24 ساعة
        </p>
      </CardContent>
    </Card>
  );
};