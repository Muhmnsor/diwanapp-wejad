
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BellRing, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  XCircle 
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  expiry_date: string | null;
  cost: number | null;
}

interface SubscriptionStatsProps {
  subscriptions: Subscription[];
}

export const SubscriptionStats = ({ subscriptions }: SubscriptionStatsProps) => {
  // Calculate stats
  const totalCount = subscriptions.length;
  
  // Calculate active/inactive counts
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;
  
  // Calculate expiring soon (active + expiry date within 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const expiringSoonCount = subscriptions.filter(s => {
    if (s.status !== 'active' || !s.expiry_date) return false;
    const expiryDate = new Date(s.expiry_date);
    return expiryDate > today && expiryDate <= thirtyDaysFromNow;
  }).length;
  
  // Calculate total monthly cost
  const totalMonthlyCost = subscriptions.reduce((total, subscription) => {
    if (subscription.status !== 'active' || !subscription.cost) return total;
    return total + subscription.cost;
  }, 0);
  
  // Format the monthly cost
  const formattedMonthlyCost = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0
  }).format(totalMonthlyCost);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الاشتراكات</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeCount} نشط, {expiredCount} منتهي
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">اشتراكات نشطة</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((activeCount / totalCount) * 100 || 0).toFixed(0)}% من الإجمالي
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تنتهي قريباً</CardTitle>
          <BellRing className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringSoonCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            خلال الـ 30 يوم القادمة
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التكلفة الشهرية</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedMonthlyCost}</div>
          <p className="text-xs text-muted-foreground mt-1">
            للاشتراكات النشطة فقط
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
