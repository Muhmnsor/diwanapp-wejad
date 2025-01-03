import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SignatureDialog } from "./SignatureDialog";
import { SignaturesList } from "./SignaturesList";

export const CertificateSignatures = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">التوقيعات</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة توقيع
        </Button>
      </div>

      <SignaturesList />
      
      <SignatureDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};