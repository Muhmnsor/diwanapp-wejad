
-- Table for HR leave requests
CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  leave_type_id UUID REFERENCES hr_leave_types(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN end_date >= start_date THEN (end_date - start_date + 1)
      ELSE 0
    END
  ) STORED,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index to speed up status queries
CREATE INDEX IF NOT EXISTS hr_leave_requests_status_idx ON hr_leave_requests (status);

-- Create an index for employee queries
CREATE INDEX IF NOT EXISTS hr_leave_requests_employee_idx ON hr_leave_requests (employee_id);

-- Add a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_hr_leave_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_hr_leave_requests_updated_at_trigger
BEFORE UPDATE ON hr_leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_hr_leave_requests_updated_at();

-- Add a column for leave type ID if it doesn't exist already
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'hr_leave_requests' AND column_name = 'leave_type_id') THEN
    ALTER TABLE hr_leave_requests ADD COLUMN leave_type_id UUID REFERENCES hr_leave_types(id) ON DELETE SET NULL;
  END IF;
END $$;
