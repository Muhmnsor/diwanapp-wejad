import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";

interface ActivityDetailsFieldsProps {
  form: UseFormReturn<any>;
}

export const ActivityDetailsFields = ({ form }: ActivityDetailsFieldsProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">تفاصيل النشاط</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="detailed_description"
          render={({ field }) => (
            <FormItem>
              <Label>التفاصيل</Label>
              <FormControl>
                <Textarea 
                  placeholder="التفاصيل" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="activity_duration"
            render={({ field }) => (
              <FormItem>
                <Label>مدة النشاط</Label>
                <FormControl>
                  <Input placeholder="مدة النشاط" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attendees_count"
            render={({ field }) => (
              <FormItem>
                <Label>عدد المشاركين</Label>
                <FormControl>
                  <Input placeholder="عدد المشاركين" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </Card>
  );
};