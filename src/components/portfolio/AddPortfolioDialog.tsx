import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PortfolioForm } from './PortfolioForm';

export const AddPortfolioDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 ml-2" />
          إضافة محفظة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة محفظة جديدة</DialogTitle>
        </DialogHeader>
        <PortfolioForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};