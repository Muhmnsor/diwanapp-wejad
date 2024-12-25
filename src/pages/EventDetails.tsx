import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { EventRegistrationDialog } from "@/components/events/EventRegistrationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "@/store/eventStore";
import { useAuthStore } from "@/store/authStore";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventNotFound } from "@/components/events/EventNotFound";
import { EventAdminView } from "@/components/events/EventAdminView";
import { handleAddToCalendar } from "@/components/events/EventCalendarHelper";
import { BeneficiaryType } from "@/types/event";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      console.log('Fetching event details for ID:', id);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      console.log('Fetched event details:', data);
      
      const transformedEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        date: data.date,
        time: data.time,
        location: data.location,
        imageUrl: data.image_url,
        attendees: 0,
        maxAttendees: data.max_attendees,
        eventType: data.event_type as "online" | "in-person",
        price: data.price === null ? "free" : data.price,
        beneficiaryType: data.beneficiary_type as BeneficiaryType,
        registrationStartDate: data.registration_start_date,
        registrationEndDate: data.registration_end_date,
      };

      return transformedEvent;
    },
  });

  const { data: registrationsCount = 0, isLoading: registrationsLoading } = useQuery({
    queryKey: ['registrations', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (error) {
        console.error('Error fetching registrations count:', error);
        throw error;
      }

      console.log('Fetched registrations count:', count);
      return count || 0;
    },
  });

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("تم حذف الفعالية بنجاح");
      navigate('/');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("حدث خطأ أثناء حذف الفعالية");
    }
  };

  const handleSaveEdit = async (updatedEvent: Event) => {
    try {
      console.log('Saving updated event:', updatedEvent);
      
      const { error } = await supabase
        .from('events')
        .update({
          title: updatedEvent.title,
          description: updatedEvent.description,
          date: updatedEvent.date,
          time: updatedEvent.time,
          location: updatedEvent.location,
          event_type: updatedEvent.eventType,
          max_attendees: updatedEvent.maxAttendees,
          price: updatedEvent.price === "free" ? null : updatedEvent.price,
          image_url: updatedEvent.imageUrl || updatedEvent.image_url,
          beneficiary_type: updatedEvent.beneficiaryType,
          registration_start_date: updatedEvent.registrationStartDate,
          registration_end_date: updatedEvent.registrationEndDate
        })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setIsEditDialogOpen(false);
      toast.success("تم تحديث الفعالية بنجاح");
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("حدث خطأ أثناء تحديث الفعالية");
    }
  };

  const isLoading = eventLoading || registrationsLoading;

  if (isLoading) {
    return <EventLoadingState />;
  }

  if (!event || !id) {
    return <EventNotFound />;
  }

  const eventWithAttendees = {
    ...event,
    attendees: registrationsCount,
  };

  return (
    <div dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {user?.isAdmin ? (
          <EventAdminView
            event={eventWithAttendees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToCalendar={() => handleAddToCalendar(event)}
            onRegister={() => setIsRegistrationOpen(true)}
            id={id}
          />
        ) : (
          <EventDetailsView
            event={eventWithAttendees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToCalendar={() => handleAddToCalendar(event)}
            onRegister={() => setIsRegistrationOpen(true)}
          />
        )}

        <EventRegistrationDialog
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
          event={event}
        />

        <EditEventDialog
          event={event}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );
};

export default EventDetails;
