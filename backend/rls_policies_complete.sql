-- Extra security for applications and tasks tables
-- Just simple tenant checks and role validation

-- Applications table security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Can only see stuff from your own company
CREATE POLICY "applications_select_policy"
ON public.applications
FOR SELECT
USING (
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
);

-- Counselors and admins can create applications
CREATE POLICY "applications_insert_policy"
ON public.applications
FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
  AND (current_setting('request.jwt.claims', true)::jsonb->>'role') IN ('counselor', 'admin')
);

-- Can update if same company
CREATE POLICY "applications_update_policy"
ON public.applications
FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
);

-- Tasks table security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Same deal - only see your company's tasks
CREATE POLICY "tasks_select_policy"
ON public.tasks
FOR SELECT
USING (
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
);

-- Create tasks if you're a counselor or admin
CREATE POLICY "tasks_insert_policy"
ON public.tasks
FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
  AND (current_setting('request.jwt.claims', true)::jsonb->>'role') IN ('counselor', 'admin')
);

-- Can mark complete if same company
CREATE POLICY "tasks_update_policy"
ON public.tasks
FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid = tenant_id
);

