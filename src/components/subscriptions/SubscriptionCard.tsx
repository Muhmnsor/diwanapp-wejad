
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Edit, 
  Paperclip, 
  Trash, 
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteSubscriptionDialog } from "./DeleteSubscriptionDialog";
import { EditSubscriptionDialog } from "./EditSubscriptionDialog";
import { formatDate, getRemainingDays } from "@/utils/formatters";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { SubscriptionAttachments } from "./SubscriptionAttachments";

interface Subscription {
  id: string;
  name: string;
  description: string | null;
  provider: string | null;
  category: string;
  cost: number | null;
  currency: string;
  billing_cycle: string;
  start_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  status: string;
  payment_method: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: () => void;
  onUpdate: () => void;
}

export const SubscriptionCard = ({ 
  subscription, 
  onDelete, 
  onUpdate 
}: SubscriptionCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  // Prepare formatted values
  const formattedCost = subscription.cost 
    ? new Intl.NumberFormat('ar-SA', { 
        style: 'currency', 
        currency: subscription.currency || 'SAR',
        minimumFractionDigits: 0
      }).format(subscription.cost)
    : "غير محدد";

  // Get remaining days until expiry/renewal
  const remainingDays = subscription.expiry_date 
    ? getRemainingDays(subscription.expiry_date) 
    : null;

  // Get status color
  const getStatusColor = (status: string, remainingDays: number | null) => {
    if (status === 'expired') return "bg-destructive";
    if (status === 'cancelled') return "bg-slate-500";
    if (status === 'pending') return "bg-amber-500";
    
    // Active status with expiry date check
    if (remainingDays !== null) {
      if (remainingDays <= 0) return "bg-destructive";
      if (remainingDays <= 30) return "bg-amber-500";
    }
    
    return "bg-emerald-500";
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'expired': return 'منتهي';
      case 'cancelled': return 'ملغي';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  const getExpiryText = () => {
    if (!subscription.expiry_date) return null;
    
    if (remainingDays !== null) {
      if (remainingDays < 0) {
        return "منتهي منذ " + Math.abs(remainingDays) + " يوم";
      } else if (remainingDays === 0) {
        return "ينتهي اليوم";
      } else if (remainingDays === 1) {
        return "ينتهي غداً";
      } else {
        return `ينتهي بعد ${remainingDays} يوم`;
      }
    }
    
    return formatDate(subscription.expiry_date);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{subscription.name}</CardTitle>
              {subscription.provider && (
                <CardDescription>{subscription.provider}</CardDescription>
              )}
            </div>
            <Badge className={getStatusColor(subscription.status, remainingDays)}>
              {getStatusText(subscription.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2 space-x-reverse">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{formattedCost}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{subscription.billing_cycle}</span>
              </div>
              
              {subscription.expiry_date && (
                <div className="flex items-center space-x-2 space-x-reverse col-span-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className={`${remainingDays !== null && remainingDays <= 30 ? 'text-amber-600 font-medium' : 'text-gray-700'}`}>
                    {getExpiryText()}
                  </span>
                </div>
              )}
              
              {subscription.contact_name && (
                <div className="flex items-center space-x-2 space-x-reverse col-span-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{subscription.contact_name}</span>
                </div>
              )}
            </div>
            
            {subscription.description && (
              <div className="mt-2 text-sm text-gray-700">
                {subscription.description}
              </div>
            )}
            
            <Collapsible 
              open={attachmentsOpen} 
              onOpenChange={setAttachmentsOpen}
              className="border rounded-md p-2 mt-4"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Paperclip className="h-4 w-4" />
                    <span>المرفقات</span>
                  </div>
                  <span className="text-xs">{attachmentsOpen ? 'إخفاء' : 'عرض'}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <SubscriptionAttachments subscriptionId={subscription.id} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            تعديل
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4 mr-2" />
            حذف
          </Button>
        </CardFooter>
      </Card>
      
      <DeleteSubscriptionDialog
        subscriptionId={subscription.id}
        subscriptionName={subscription.name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={onDelete}
      />
      
      <EditSubscriptionDialog
        subscription={subscription}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={onUpdate}
      />
    </>
  );
};
