
-- Table for HR leave entitlements
CREATE TABLE IF NOT EXISTS hr_leave_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES hr_leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  entitled_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  remaining_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (employee_id, leave_type_id, year)
);

-- Create an index to speed up queries by employee and year
CREATE INDEX IF NOT EXISTS hr_leave_entitlements_employee_year_idx ON hr_leave_entitlements (employee_id, year);
