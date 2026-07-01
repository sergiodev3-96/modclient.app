-- =====================================================
-- modclient.com — Supabase migrations
-- 002_projects.sql
-- =====================================================

CREATE TABLE public.projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  serial_config JSONB DEFAULT '{
    "baudRate": 9600,
    "dataBits": 8,
    "stopBits": 1,
    "parity": "none"
  }'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 003_macros.sql
-- =====================================================

CREATE TABLE public.macros (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  color        TEXT DEFAULT 'default' CHECK (color IN ('default','accent','success','signal','error')),
  actions      JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER macros_updated_at
  BEFORE UPDATE ON public.macros
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_macros_project_id ON public.macros(project_id);

ALTER TABLE public.macros ENABLE ROW LEVEL SECURITY;

-- Users can only access macros from their own projects
CREATE POLICY "Users can CRUD own macros"
  ON public.macros FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = macros.project_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = macros.project_id
        AND p.user_id = auth.uid()
    )
  );

-- =====================================================
-- 004_devices.sql
-- =====================================================

CREATE TABLE public.discovered_devices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  slave_id            INT NOT NULL CHECK (slave_id >= 1 AND slave_id <= 247),
  label               TEXT,
  last_seen           TIMESTAMPTZ DEFAULT now(),
  supported_functions INT[] DEFAULT '{}',
  response_time_ms    INT,
  metadata            JSONB DEFAULT '{}'::jsonb,
  UNIQUE (project_id, slave_id)
);

CREATE INDEX idx_devices_project_id ON public.discovered_devices(project_id);

ALTER TABLE public.discovered_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own discovered devices"
  ON public.discovered_devices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = discovered_devices.project_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = discovered_devices.project_id
        AND p.user_id = auth.uid()
    )
  );

-- =====================================================
-- 005_subscriptions.sql
-- =====================================================

CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  status                  TEXT DEFAULT 'inactive',
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role only can write subscriptions (via Stripe webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');
