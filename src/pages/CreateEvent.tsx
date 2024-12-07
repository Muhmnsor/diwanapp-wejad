import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEventStore } from "@/store/eventStore";

// Form validation schema
const eventSchema = z.object({
  title: z.string().min(1, "عنوان الفعالية مطلوب"),
  description: z.string().min(1, "وصف الفعالية مطلوب"),
  date: z.string().min(1, "تاريخ الفعالية مطلوب"),
  time: z.string().min(1, "وقت الفعالية مطلوب"),
  location: z.string().min(1, "موقع الفعالية مطلوب"),
  imageUrl: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const addEvent = useEventStore((state) => state.addEvent);
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      imageUrl: "",
    },
  });

  const onSubmit = (data: EventFormData) => {
    console.log("Form submitted:", data);
    
    // Add the new event to our store
    addEvent(data);
    
    // Show success message
    toast.success("تم إنشاء الفعالية بنجاح");
    
    // Navigate back to home page
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط الصورة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل رابط صورة الفعالية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                إلغاء
              </Button>
              <Button type="submit">إنشاء الفعالية</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateEvent;