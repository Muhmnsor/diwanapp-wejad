import { useEffect, useState } from "react";
import { Event } from "@/store/eventStore";
import { EventImage } from "../EventImage";
import { EventTitle } from "../EventTitle";
import { EventContent } from "../EventContent";
import { AdminTabs } from "./AdminTabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventDetailsContainerProps {
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
  children?: React.ReactNode;
}

export const EventDetailsContainer = ({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id,
  children
}: EventDetailsContainerProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <EventImage imageUrl={event.image_url || event.imageUrl} title={event.title} />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <EventTitle
            title={event.title}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToCalendar={onAddToCalendar}
            isVisible={event.is_visible}
            onVisibilityChange={async (visible) => {
              try {
                const { error } = await supabase
                  .from('events')
                  .update({ is_visible: visible })
                  .eq('id', id);

                if (error) throw error;
                toast.success(visible ? 'تم إظهار الفعالية' : 'تم إخفاء الفعالية');
              } catch (error) {
                console.error('Error updating event visibility:', error);
                toast.error('حدث خطأ أثناء تحديث حالة الظهور');
              }
            }}
          />

          {children}

          {isAdmin ? (
            <AdminTabs 
              event={event}
              id={id}
              onRegister={onRegister}
            />
          ) : (
            <EventContent 
              event={event}
              onRegister={onRegister}
            />
          )}
        </div>
      </div>
    </div>
  );
};