import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/ui/image-upload";
import { useState } from "react";
import { EventBasicFields } from "@/components/events/form/EventBasicFields";
import { EventTypeFields } from "@/components/events/form/EventTypeFields";
import { EventCertificateFields } from "@/components/events/form/EventCertificateFields";
import { RegistrationPeriodFields } from "@/components/events/RegistrationPeriodFields";

const eventSchema = z.object({
  title: z.string().min(1, "عنوان الفعالية مطلوب"),
  description: z.string().min(1, "وصف الفعالية مطلوب"),
  date: z.string().min(1, "تاريخ الفعالية مطلوب"),
  time: z.string().min(1, "وقت الفعالية مطلوب"),
  location: z.string().min(1, "موقع الفعالية مطلوب"),
  imageFile: z.instanceof(File, { message: "الصورة مطلوبة" }).optional(),
  imagePreview: z.string().optional(),
  eventType: z.enum(["online", "in-person"]),
  priceType: z.enum(["free", "paid"]),
  priceAmount: z.number().min(0).optional(),
  maxAttendees: z.number().min(1, "عدد المقاعد مطلوب"),
  beneficiaryType: z.enum(["men", "women", "both"]),
  registration_start_date: z.string().optional(),
  registration_end_date: z.string().optional(),
  certificateType: z.enum(["attendance", "certified", "none"]),
  eventHours: z.number().min(0).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      imagePreview: "",
      eventType: "in-person",
      priceType: "free",
      priceAmount: 0,
      maxAttendees: 1,
      beneficiaryType: "both",
      registration_start_date: "",
      registration_end_date: "",
      certificateType: "none",
      eventHours: 0,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    console.log("Starting event creation with data:", data);
    setIsSubmitting(true);
    try {
      let imageUrl = "";
      
      if (data.imageFile) {
        console.log("Uploading image file:", data.imageFile.name);
        const fileExt = data.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, data.imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        console.log("Image uploaded successfully. Public URL:", publicUrl);
        imageUrl = publicUrl;
      }

      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        image_url: imageUrl,
        event_type: data.eventType,
        price: data.priceType === "free" ? null : data.priceAmount,
        max_attendees: data.maxAttendees,
        beneficiary_type: data.beneficiaryType,
        registration_start_date: data.registration_start_date || null,
        registration_end_date: data.registration_end_date || null,
        certificate_type: data.certificateType,
        event_hours: data.eventHours || 0,
      };

      console.log("Inserting event data into Supabase:", eventData);

      const { data: createdEvent, error } = await supabase
        .from('events')
        .insert(eventData)
        .select();

      if (error) {
        console.error("Error inserting event data:", error);
        throw error;
      }

      console.log("Event created successfully:", createdEvent);
      toast.success("تم إنشاء الفعالية بنجاح");
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("حدث خطأ أثناء إنشاء الفعالية");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">إنشاء فعالية جديدة</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <EventBasicFields form={form} />
            
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>صورة الفعالية</FormLabel>
                  <FormControl>
                    <ImageUpload
                      onChange={(file) => {
                        onChange(file);
                        const previewUrl = URL.createObjectURL(file);
                        form.setValue("imagePreview", previewUrl);
                      }}
                      value={form.watch("imagePreview")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <EventTypeFields form={form} />
            <EventCertificateFields form={form} />
            <RegistrationPeriodFields form={form} />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإنشاء..." : "إنشاء الفعالية"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateEvent;