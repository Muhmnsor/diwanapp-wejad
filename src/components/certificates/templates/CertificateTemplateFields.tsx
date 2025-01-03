import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export interface CertificateTemplateFieldsProps {
  form: UseFormReturn<any>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

export const CertificateTemplateFields = ({
  form,
  selectedFile,
  setSelectedFile
}: CertificateTemplateFieldsProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>اسم القالب</FormLabel>
            <FormControl>
              <Input placeholder="أدخل اسم القالب" {...field} />
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
            <FormLabel>وصف القالب</FormLabel>
            <FormControl>
              <Input placeholder="أدخل وصف القالب" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="template"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ملف القالب</FormLabel>
            <FormControl>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="template-upload"
                />
                <label
                  htmlFor="template-upload"
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  <span>{selectedFile ? selectedFile.name : "اختر ملف القالب"}</span>
                </label>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};