import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const Navigation = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center">
          <Logo />
          ديوان الفعاليات
        </Link>
        <Button asChild>
          <Link to="/create" className="flex items-center gap-2">
            <Plus size={20} />
            فعالية جديدة
          </Link>
        </Button>
      </div>
    </nav>
  );
};