-- =====================================================
-- modclient.com — Supabase migrations
-- 003_add_ultimate_plan.sql
-- =====================================================

-- Drop the old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Add the new constraint allowing 'ultimate'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro', 'ultimate'));
