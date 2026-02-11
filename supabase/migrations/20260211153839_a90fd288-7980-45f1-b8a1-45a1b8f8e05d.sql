
-- Table to track TGF Gratitude Fridays rotation
CREATE TABLE public.tgf_friday_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id),
  friend_name TEXT NOT NULL,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  send_count INTEGER NOT NULL DEFAULT 0,
  referral_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tgf_friday_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friday contacts"
  ON public.tgf_friday_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own friday contacts"
  ON public.tgf_friday_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friday contacts"
  ON public.tgf_friday_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_tgf_friday_user ON public.tgf_friday_contacts(user_id);

-- Table for follow-up sequences (friend 2 & 3 collection)
CREATE TABLE public.followup_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.challenge_participants(id),
  sequence_type TEXT NOT NULL DEFAULT 'friend_collection',
  step_number INTEGER NOT NULL DEFAULT 1,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  channel TEXT NOT NULL DEFAULT 'sms',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.followup_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage followup sequences"
  ON public.followup_sequences FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can insert followups"
  ON public.followup_sequences FOR INSERT
  WITH CHECK (true);
