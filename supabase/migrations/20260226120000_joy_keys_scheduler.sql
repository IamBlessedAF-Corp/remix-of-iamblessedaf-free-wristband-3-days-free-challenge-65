-- ═══════════════════════════════════════════════════════════════
-- Joy Keys Scheduler Migration
-- Creates log tables + pg_cron jobs + campaign_config entries
-- ═══════════════════════════════════════════════════════════════

-- ── 1. joy_keys_nudge_log ──
CREATE TABLE IF NOT EXISTS joy_keys_nudge_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_key INT NOT NULL DEFAULT 0,
  template_key TEXT NOT NULL,
  twilio_sid  TEXT,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed')),
  error_message TEXT
);

CREATE INDEX idx_nudge_log_user_sent
  ON joy_keys_nudge_log (user_id, sent_at DESC);

ALTER TABLE joy_keys_nudge_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only — nudge log"
  ON joy_keys_nudge_log FOR ALL
  USING (auth.role() = 'service_role');

-- ── 2. joy_keys_email_log ──
CREATE TABLE IF NOT EXISTS joy_keys_email_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_number  INT NOT NULL DEFAULT 0,
  resend_id   TEXT,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed')),
  error_message TEXT
);

CREATE UNIQUE INDEX idx_email_log_user_key
  ON joy_keys_email_log (user_id, key_number)
  WHERE status = 'sent';

CREATE INDEX idx_email_log_user
  ON joy_keys_email_log (user_id, sent_at DESC);

ALTER TABLE joy_keys_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only — email log"
  ON joy_keys_email_log FOR ALL
  USING (auth.role() = 'service_role');

-- ── 3. campaign_config entries (idempotent) ──
INSERT INTO campaign_config (key, value)
VALUES
  ('engagement_joy_keys_nudges', 'active'),
  ('engagement_joy_keys_emails', 'active')
ON CONFLICT (key) DO NOTHING;

-- ── 4. pg_cron jobs ──
-- Joy Keys nudges — every 30 min
SELECT cron.schedule(
  'send-joy-keys-nudges',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-joy-keys-nudges',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Joy Keys emails — every 30 min
SELECT cron.schedule(
  'send-joy-keys-emails',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-joy-keys-emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
