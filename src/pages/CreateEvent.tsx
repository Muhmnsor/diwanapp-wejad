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
import { useEventStore, Event } from "@/store/eventStore";

const eventSchema = z.object({
  title: z.string().min(1, "عنوان الفعالية مطلوب"),
  description: z.string().min(1, "وصف الفعالية مطلوب"),
  date: z.string().min(1, "تاريخ الفعالية مطلوب"),
  time: z.string().min(1, "وقت الفعالية مطلوب"),
  location: z.string().min(1, "موقع الفعالية مطلوب"),
  imageUrl: z.string().min(1, "رابط الصورة مطلوب"),
  eventType: z.enum(["online", "in-person"]),
  price: z.union([z.literal("free"), z.number().positive()]),
  maxAttendees: z.number().min(1, "عدد المقاعد مطلوب"),
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
      eventType: "in-person",
      price: "free",
      maxAttendees: 1,
    },
  });

  const onSubmit = (data: EventFormData) => {
    console.log("Form submitted:", data);
    
    const eventData: Event = {
      ...data,
      attendees: 0,
    };
    
    addEvent(eventData);
    toast.success("تم إنشاء الفعالية بنجاح");
    
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        const price = value === "free" ? "free" : Number(value);
                        field.onChange(price);
                      }} 
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر سعر الفعالية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">مجاني</SelectItem>
                        <SelectItem value="50">50 ريال</SelectItem>
                        <SelectItem value="100">100 ريال</SelectItem>
                        <SelectItem value="200">200 ريال</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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