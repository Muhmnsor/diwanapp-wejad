-- Update the RLS policy for user_roles table to allow reading
create policy "Enable read for authenticated users"
on public.user_roles
for select
to authenticated
using (true);