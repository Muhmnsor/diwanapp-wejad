
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employeeId, leaveTypeId, startDate, endDate } = req.body;

    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const currentYear = new Date().getFullYear();
    
    // Get the entitlement
    const { data: entitlement, error: entitlementError } = await supabase
      .from("hr_leave_entitlements")
      .select("id, remaining_days")
      .eq("employee_id", employeeId)
      .eq("leave_type_id", leaveTypeId)
      .eq("year", currentYear)
      .maybeSingle();
      
    if (entitlementError) throw entitlementError;
    
    let availableDays = 0;
    
    // If no entitlement exists, get default from leave types
    if (!entitlement) {
      const { data: leaveType } = await supabase
        .from("hr_leave_types")
        .select("max_days_per_year")
        .eq("id", leaveTypeId)
        .single();
        
      availableDays = leaveType?.max_days_per_year || 0;
    } else {
      availableDays = entitlement.remaining_days || 0;
    }
    
    // Calculate required days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const requiredDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return res.status(200).json({
      hasBalance: availableDays >= requiredDays,
      available: availableDays,
      required: requiredDays,
      entitlementId: entitlement?.id
    });
  } catch (error: any) {
    console.error('Error checking leave balance:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while checking leave balance' });
  }
}
