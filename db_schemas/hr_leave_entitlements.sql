
-- Create leave entitlements table if it doesn't exist
CREATE TABLE IF NOT EXISTS hr_leave_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES hr_leave_types(id) ON DELETE CASCADE,
    year INT NOT NULL,
    total_days INT NOT NULL DEFAULT 0,
    used_days INT NOT NULL DEFAULT 0,
    remaining_days INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to initialize leave entitlements for an employee
CREATE OR REPLACE FUNCTION initialize_employee_leave_entitlements(p_employee_id UUID)
RETURNS void AS $$
DECLARE
    v_year INT;
    v_leave_type RECORD;
BEGIN
    -- Get current year
    v_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Loop through leave types
    FOR v_leave_type IN SELECT * FROM hr_leave_types WHERE is_active = true
    LOOP
        -- Skip if entitlement already exists for this year and leave type
        CONTINUE WHEN EXISTS (
            SELECT 1 
            FROM hr_leave_entitlements 
            WHERE employee_id = p_employee_id 
            AND leave_type_id = v_leave_type.id
            AND year = v_year
        );
        
        -- Insert new entitlement
        INSERT INTO hr_leave_entitlements (
            employee_id,
            leave_type_id,
            year,
            total_days,
            remaining_days
        ) VALUES (
            p_employee_id,
            v_leave_type.id,
            v_year,
            v_leave_type.max_days,
            v_leave_type.max_days
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize leave entitlements for all employees
CREATE OR REPLACE FUNCTION initialize_all_employees_leave_entitlements()
RETURNS void AS $$
DECLARE
    v_employee RECORD;
BEGIN
    FOR v_employee IN SELECT id FROM employees WHERE is_active = true
    LOOP
        PERFORM initialize_employee_leave_entitlements(v_employee.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Initialize leave entitlements for all active employees
SELECT initialize_all_employees_leave_entitlements();

