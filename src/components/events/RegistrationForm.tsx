import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface RegistrationFormProps {
  eventTitle: string;
  onSubmit: () => void;
}

export const RegistrationForm = ({ eventTitle, onSubmit }: RegistrationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast({
      title: "تم التسجيل بنجاح",
      description: "سيتم التواصل معك قريباً",
    });
    onSubmit();
    setFormData({ name: "", email: "", phone: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-right block">الاسم</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-right block">رقم الجوال</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      <Button type="submit" className="w-full">تأكيد التسجيل</Button>
    </form>
  );
};