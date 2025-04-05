
-- Create accounting_opening_balances table
CREATE TABLE IF NOT EXISTS public.accounting_opening_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounting_accounts(id),
  period_id UUID NOT NULL REFERENCES public.accounting_periods(id),
  debit_amount NUMERIC DEFAULT 0 NOT NULL,
  credit_amount NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add unique constraint to ensure each account has only one opening balance per period
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_account_period_opening_balance 
  ON public.accounting_opening_balances (account_id, period_id);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.accounting_opening_balances ENABLE ROW LEVEL SECURITY;

-- Create policy for admin roles
CREATE POLICY admin_policy ON public.accounting_opening_balances
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'app_admin', 'developer')
    )
  );

-- Add function to update timestamp on update
CREATE OR REPLACE FUNCTION update_opening_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp
CREATE TRIGGER update_opening_balance_timestamp
  BEFORE UPDATE ON public.accounting_opening_balances
  FOR EACH ROW EXECUTE FUNCTION update_opening_balance_timestamp();

-- Add Comment
COMMENT ON TABLE public.accounting_opening_balances IS 'Stores opening balances for accounting accounts by period';
