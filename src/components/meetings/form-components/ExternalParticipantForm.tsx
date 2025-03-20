
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface ExternalParticipantFormProps {
  onAdd: (name: string, email: string, role: string) => void;
}

export const ExternalParticipantForm: React.FC<ExternalParticipantFormProps> = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), email.trim(), role);
      setName("");
      setEmail("");
      setRole("member");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl">
      <div className="space-y-2">
        <Label htmlFor="participant-name">اسم المشارك</Label>
        <Input
          id="participant-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="أدخل اسم المشارك"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="participant-email">البريد الإلكتروني</Label>
        <Input
          id="participant-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="أدخل البريد الإلكتروني (اختياري)"
          className="text-right"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="participant-role">الدور</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="participant-role" className="text-right">
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chairman">رئيس الاجتماع</SelectItem>
            <SelectItem value="secretary">مقرر</SelectItem>
            <SelectItem value="member">عضو</SelectItem>
            <SelectItem value="viewer">مشاهد</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="flex gap-2">
        <UserPlus className="h-4 w-4" />
        إضافة مشارك خارجي
      </Button>
    </form>
  );
};
