import { useEffect, useState } from "react";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("upcoming");
  const [projects, setProjects] = useState<any[]>([]);
  const { isAuthenticated } = useAuthStore();
  
  const { 
    data: events = [], 
    isError: isEventsError,
    error: eventsError 
  } = useEvents();
  
  const { 
    data: registrations = {}, 
    isError: isRegistrationsError,
    error: registrationsError 
  } = useRegistrations();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('*');
        
        if (error) throw error;
        
        setProjects(projectsData.map(project => ({
          ...project,
          event_type: project.event_type || 'in-person',
          date: project.start_date,
          time: '00:00'
        })));
        
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('حدث خطأ في تحميل المشاريع');
      }
    };

    fetchProjects();
  }, []);

  const now = new Date();
  
  const allItems = [...events, ...projects];
  
  const upcomingItems = allItems
    .filter((item: any) => {
      const itemDate = new Date(item.date);
      return itemDate >= now;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  const pastItems = allItems
    .filter((item: any) => {
      const itemDate = new Date(item.date);
      return itemDate < now;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  useEffect(() => {
    if (isEventsError) {
      console.error("❌ خطأ في جلب الفعاليات:", eventsError);
      toast.error("حدث خطأ في تحميل الفعاليات");
    }

    if (isRegistrationsError && isAuthenticated) {
      console.error("❌ خطأ في جلب التسجيلات:", registrationsError);
      toast.error("حدث خطأ في تحميل التسجيلات");
    }

    console.log("📊 حالة البيانات:", {
      eventsCount: events.length,
      projectsCount: projects.length,
      registrationsCount: Object.keys(registrations).length,
      upcomingItemsCount: upcomingItems.length,
      pastItemsCount: pastItems.length,
      isEventsError,
      isRegistrationsError,
      isAuthenticated
    });
  }, [
    events,
    projects,
    registrations,
    upcomingItems,
    pastItems,
    isEventsError,
    isRegistrationsError,
    eventsError,
    registrationsError,
    isAuthenticated
  ]);

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <Hero />
      <div className="container mx-auto px-4">
        <EventsTabs
          events={allItems}
          upcomingEvents={upcomingItems}
          pastEvents={pastItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          registrations={registrations}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Index;