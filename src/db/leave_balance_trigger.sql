
-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_leave_balance_trigger ON hr_leave_requests;
DROP FUNCTION IF EXISTS update_leave_balance();

-- Create new function with updated logic
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    v_leave_days integer;
    v_entitlement_record RECORD;
BEGIN
    -- Only proceed if status is changed to "approved"
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Calculate leave days between dates
        v_leave_days := calculate_leave_days(NEW.start_date, NEW.end_date);
        
        -- Get leave entitlement record directly using leave_type as UUID
        SELECT * INTO v_entitlement_record
        FROM hr_leave_entitlements
        WHERE employee_id = NEW.employee_id
        AND leave_type_id = NEW.leave_type::uuid
        AND year = EXTRACT(YEAR FROM NEW.start_date)::integer;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'لا يوجد رصيد إجازات لهذا الموظف';
        END IF;

        -- Check if enough balance
        IF (v_entitlement_record.remaining_days - v_leave_days) < 0 THEN
            RAISE EXCEPTION 'رصيد الإجازات غير كافٍ. الرصيد المتبقي: % يوم، المطلوب: % يوم', 
                v_entitlement_record.remaining_days, v_leave_days;
        END IF;

        -- Update used days
        UPDATE hr_leave_entitlements
        SET 
            used_days = COALESCE(used_days, 0) + v_leave_days,
            remaining_days = total_days - (COALESCE(used_days, 0) + v_leave_days),
            updated_at = now()
        WHERE id = v_entitlement_record.id;
        
        -- Log the update
        INSERT INTO hr_leave_balance_logs (
            employee_id,
            leave_type,
            year,
            action_type,
            details
        ) VALUES (
            NEW.employee_id,
            NEW.leave_type,
            EXTRACT(YEAR FROM NEW.start_date)::integer,
            'balance_update',
            jsonb_build_object(
                'days_taken', v_leave_days,
                'start_date', NEW.start_date,
                'end_date', NEW.end_date,
                'updated_at', CURRENT_TIMESTAMP
            )
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create new trigger
CREATE TRIGGER update_leave_balance_trigger
    BEFORE UPDATE ON hr_leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance();
