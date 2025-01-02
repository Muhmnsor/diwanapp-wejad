import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";

interface ObjectivesImpactFieldsProps {
  form: UseFormReturn<any>;
}

export const ObjectivesImpactFields = ({ form }: ObjectivesImpactFieldsProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">الأهداف والتأثير</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="activity_objectives"
          render={({ field }) => (
            <FormItem>
              <Label>الأهداف</Label>
              <FormControl>
                <Textarea 
                  placeholder="الأهداف" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="impact_on_participants"
          render={({ field }) => (
            <FormItem>
              <Label>الأثر على المشاركين</Label>
              <FormControl>
                <Textarea 
                  placeholder="الأثر على المشاركين" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
};