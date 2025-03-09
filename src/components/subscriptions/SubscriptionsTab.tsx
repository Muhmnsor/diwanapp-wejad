
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { SubscriptionStats } from "./SubscriptionStats";
import { SubscriptionControls } from "./SubscriptionControls";
import { SubscriptionCard } from "./SubscriptionCard";

interface Subscription {
  id: string;
  name: string;
  description: string | null;
  provider: string | null;
  category: string;
  cost: number | null;
  currency: string;
  billing_cycle: string;
  start_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  status: string;
  payment_method: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
}

export const SubscriptionsTab = () => {
  const { user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [subscriptions, searchQuery, categoryFilter, statusFilter]);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data - update status based on expiry date
      const processedData = (data || []).map(subscription => {
        let status = subscription.status;
        
        // Update status if expired
        if (status === 'active' && subscription.expiry_date) {
          const now = new Date();
          const expiryDate = new Date(subscription.expiry_date);
          if (now > expiryDate) {
            status = 'expired';
          }
        }
        
        return {
          ...subscription,
          status
        };
      });

      console.log('Fetched subscriptions:', processedData);
      setSubscriptions(processedData);
      setFilteredSubscriptions(processedData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('حدث خطأ أثناء تحميل الاشتراكات');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...subscriptions];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(subscription => 
        subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subscription.provider && subscription.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (subscription.description && subscription.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(subscription => subscription.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'soon') {
        // Filter for subscriptions expiring within 30 days
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        filtered = filtered.filter(subscription => {
          if (subscription.status !== 'active' || !subscription.expiry_date) return false;
          const expiryDate = new Date(subscription.expiry_date);
          return expiryDate > today && expiryDate <= thirtyDaysFromNow;
        });
      } else {
        filtered = filtered.filter(subscription => subscription.status === statusFilter);
      }
    }

    setFilteredSubscriptions(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterCategory = (category: string) => {
    setCategoryFilter(category);
  };

  const handleFilterStatus = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <div>
      <SubscriptionStats subscriptions={subscriptions} />
      
      <SubscriptionControls
        onSearch={handleSearch}
        onFilterCategory={handleFilterCategory}
        onFilterStatus={handleFilterStatus}
        onRefresh={fetchSubscriptions}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">لا توجد اشتراكات</h3>
          <p className="text-muted-foreground">
            لم يتم العثور على اشتراكات تطابق معايير البحث الحالية
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map(subscription => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onDelete={fetchSubscriptions}
              onUpdate={fetchSubscriptions}
            />
          ))}
        </div>
      )}
    </div>
  );
};
