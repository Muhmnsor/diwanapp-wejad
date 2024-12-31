import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/store/eventStore";

interface EventPriceAndSeatsFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventPriceAndSeatsFields = ({ formData, setFormData }: EventPriceAndSeatsFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">السعر</label>
        <Select
          value={formData.price?.toString() || "free"}
          onValueChange={(value) => setFormData({ ...formData, price: value === "free" ? "free" : Number(value) })}
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر السعر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">مجاني</SelectItem>
            <SelectItem value="50">50 ريال</SelectItem>
            <SelectItem value="100">100 ريال</SelectItem>
            <SelectItem value="150">150 ريال</SelectItem>
            <SelectItem value="200">200 ريال</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">عدد المقاعد</label>
        <Input
          type="number"
          min="0"
          value={formData.max_attendees}
          onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 0 })}
          className="text-right"
          placeholder="أدخل عدد المقاعد المتاحة"
          required
        />
      </div>
    </>
  );
};