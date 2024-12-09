import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/ui/image-upload";
import { useState } from "react";
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
  registration_start_date: z.string().optional(),
  registration_end_date: z.string().optional(),
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
      registration_start_date: "",
      registration_end_date: "",
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

        // Upload image to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, data.imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        // Get public URL for the uploaded image
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
        registration_start_date: data.registration_start_date || null,
        registration_end_date: data.registration_end_date || null,
      };

      console.log("Inserting event data into Supabase:", eventData);

      // Insert event data into Supabase
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

  const watchPriceType = form.watch("priceType");

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">إنشاء فعالية جديدة</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الفعالية</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان الفعالية" {...field} />
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
                  <FormLabel>وصف الفعالية</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أدخل وصف الفعالية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوقت</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموقع</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل موقع الفعالية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الفعالية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الفعالية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in-person">حضوري</SelectItem>
                        <SelectItem value="online">عن بعد</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع السعر</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع السعر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">مجاني</SelectItem>
                        <SelectItem value="paid">مدفوع</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchPriceType === "paid" && (
              <FormField
                control={form.control}
                name="priceAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر (ريال)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="أدخل السعر"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="maxAttendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد المقاعد</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
