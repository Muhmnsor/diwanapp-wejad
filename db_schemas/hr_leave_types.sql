
-- Table for HR leave types
CREATE TABLE IF NOT EXISTS hr_leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_days INTEGER,
  is_paid BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default leave types
INSERT INTO hr_leave_types (code, name, max_days, is_paid, requires_approval, description) 
VALUES 
  ('annual', 'سنوية', 30, true, true, 'الإجازة السنوية المدفوعة'),
  ('sick', 'مرضية', 15, true, true, 'إجازة مرضية'),
  ('emergency', 'طارئة', 7, true, true, 'إجازة للحالات الطارئة'),
  ('maternity', 'أمومة', 70, true, true, 'إجازة أمومة للموظفات'),
  ('unpaid', 'بدون راتب', 30, false, true, 'إجازة غير مدفوعة')
ON CONFLICT (code) DO NOTHING;
