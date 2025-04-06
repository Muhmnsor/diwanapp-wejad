
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PasswordRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string;
  password: string;
}

export const PasswordRevealDialog = ({
  open,
  onOpenChange,
  accountName,
  password,
}: PasswordRevealDialogProps) => {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [verified, setVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // مجرد مثال - في التطبيق الحقيقي يمكنك استخدام PIN مخزن في قاعدة البيانات
  const correctPin = "1234";
  const maxAttempts = 3;
  
  const handleVerify = () => {
    if (pin === correctPin) {
      setVerified(true);
      setAttempts(0);
    } else {
      setAttempts(attempts + 1);
      setPin("");
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleClose = () => {
    setVerified(false);
    setShowPassword(false);
    setPin("");
    setAttempts(0);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>عرض كلمة المرور</DialogTitle>
          <DialogDescription>
            {verified
              ? `كلمة المرور لـ ${accountName}`
              : "الرجاء إدخال رمز التحقق المكون من 4 أرقام"}
          </DialogDescription>
        </DialogHeader>
        
        {!verified ? (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <InputOTP
                value={pin}
                onChange={setPin}
                maxLength={4}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
              
              {attempts > 0 && (
                <p className="text-sm text-red-500">
                  رمز التحقق غير صحيح. محاولة {attempts} من {maxAttempts}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleVerify} disabled={pin.length !== 4}>
                  تحقق
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="relative">
              <div className="flex items-center border rounded-md overflow-hidden">
                <div className="flex-grow p-2 bg-white">
                  <p className="font-mono">
                    {showPassword ? password : "•".repeat(password.length)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="bg-gray-100 p-2 border-l"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-gray-100 p-2 border-l"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleClose}>إغلاق</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
