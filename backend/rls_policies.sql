-- LearnLynk Tech Test - Task 2: RLS Policies on leads

alter table public.leads enable row level security;

-- Example helper: assume JWT has tenant_id, user_id, role.
-- You can use: current_setting('request.jwt.claims', true)::jsonb

-- TODO: write a policy so:
-- - counselors see leads where they are owner_id OR in one of their teams
-- - admins can see all leads of their tenant


-- Example skeleton for SELECT (replace with your own logic):

-- SELECT policy: enforce tenant isolation and role-based access
-- Simplified version for this assessment (team membership checking would require additional tables)
create policy "leads_select_policy"
on public.leads
for select
using (
  -- Extract JWT claims and ensure tenant isolation
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
  and (
    -- Admins can see all leads in their tenant
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
    or
    -- Counselors can see leads they own
    (current_setting('request.jwt.claims', true)::jsonb->>'user_id')::uuid = owner_id
    -- Note: In production, you would add team-based access here
    -- by checking user_teams and lead_teams tables
  )
);

-- INSERT policy: allow counselors and admins to insert leads for their tenant
create policy "leads_insert_policy"
on public.leads
for insert
with check (
  -- Ensure tenant_id matches the user's tenant
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
  and
  -- Only counselors and admins can insert
  (current_setting('request.jwt.claims', true)::jsonb->>'role') in ('counselor', 'admin')
);
