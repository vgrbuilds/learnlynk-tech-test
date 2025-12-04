-- Test data to see the dashboard in action
-- Run this in Supabase SQL Editor

-- First create a lead
INSERT INTO public.leads (tenant_id, owner_id, full_name, email, stage, source)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'Rajesh Kumar',
  'rajesh.kumar@example.com',
  'qualified',
  'website'
)
RETURNING id, tenant_id;

-- Copy the lead ID from above
-- Replace 'YOUR-LEAD-ID-HERE' with that UUID

-- Then create an application for that lead
INSERT INTO public.applications (tenant_id, lead_id, program_id, stage, status)
VALUES (
  'YOUR-TENANT-ID-HERE',  -- same tenant_id from the lead
  'YOUR-LEAD-ID-HERE',
  gen_random_uuid(),
  'review',
  'open'
)
RETURNING id;

-- Copy the application ID from above
-- Replace 'YOUR-APPLICATION-ID-HERE' with that UUID

-- Finally create some tasks for today
INSERT INTO public.tasks (tenant_id, application_id, title, type, status, due_at)
VALUES 
  -- Call task in 2 hours
  (
    'YOUR-TENANT-ID-HERE',
    'YOUR-APPLICATION-ID-HERE',
    'Follow up call with applicant',
    'call',
    'open',
    NOW() + interval '2 hours'
  ),
  -- Email task in 4 hours
  (
    'YOUR-TENANT-ID-HERE',
    'YOUR-APPLICATION-ID-HERE',
    'Send application documents',
    'email',
    'open',
    NOW() + interval '4 hours'
  ),
  -- Review task in 6 hours
  (
    'YOUR-TENANT-ID-HERE',
    'YOUR-APPLICATION-ID-HERE',
    'Review application materials',
    'review',
    'open',
    NOW() + interval '6 hours'
  );

-- Check if it worked
SELECT * FROM public.tasks WHERE due_at::date = CURRENT_DATE;

