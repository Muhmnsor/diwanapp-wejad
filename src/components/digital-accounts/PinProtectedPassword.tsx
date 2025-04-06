
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface PinProtectedPasswordProps {
  password: string;
}

export const PinProtectedPassword = ({ password }: PinProtectedPasswordProps) => {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleVerifyPin = () => {
    if (pin.length === 4 && /^\d{4}$/.test(pin)) {
      // Simple PIN verification (for demo purposes, using a static PIN)
      const correctPin = "1234"; // In a real app, this would be user-defined and stored securely
      
      if (pin === correctPin) {
        setIsPasswordVisible(true);
        setIsPinDialogOpen(false);
        toast.success("تم عرض كلمة المرور");
      } else {
        toast.error("رمز PIN غير صحيح");
      }
    } else {
      toast.error("الرجاء إدخال 4 أرقام");
    }
    setPin("");
  };

  const handleShowPassword = () => {
    if (isPasswordVisible) {
      setIsPasswordVisible(false);
    } else {
      setIsPinDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isPasswordVisible ? (
          <>
            <span>{password}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShowPassword}
              className="p-0 h-auto"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShowPassword}
            className="p-0 h-auto"
          >
            <Eye className="h-4 w-4" />
            <span className="mr-1">عرض</span>
          </Button>
        )}
      </div>

      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">أدخل رمز التحقق</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <p className="text-center text-sm text-gray-500">
              الرجاء إدخال رمز PIN المكون من 4 أرقام لعرض كلمة المرور
            </p>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="أدخل 4 أرقام"
              className="text-center text-lg"
              inputMode="numeric"
              pattern="\d*"
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleVerifyPin}>تحقق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
