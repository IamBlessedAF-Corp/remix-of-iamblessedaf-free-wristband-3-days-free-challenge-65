
-- Challenge participants: users who join the 3-day gratitude challenge
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  phone TEXT NOT NULL,
  display_name TEXT,
  friend_1_name TEXT NOT NULL,
  friend_2_name TEXT,
  friend_3_name TEXT,
  opted_in_sms BOOLEAN DEFAULT false,
  challenge_start_date DATE DEFAULT (CURRENT_DATE + 1),
  challenge_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Public insert for frictionless signup
CREATE POLICY "Anyone can join the challenge"
ON public.challenge_participants FOR INSERT
WITH CHECK (true);

-- Auth users can read their own data
CREATE POLICY "Users can read own participant data"
ON public.challenge_participants FOR SELECT
USING (auth.uid() = user_id);

-- Auth users can update their own data
CREATE POLICY "Users can update own participant data"
ON public.challenge_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Scheduled gratitude messages for each day of the challenge
CREATE TABLE public.scheduled_gratitude_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  friend_name TEXT NOT NULL,
  message_body TEXT NOT NULL,
  scheduled_send_at TIMESTAMPTZ,
  reminder_send_at TIMESTAMPTZ,
  message_sent_at TIMESTAMPTZ,
  twilio_message_sid TEXT,
  twilio_reminder_sid TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.scheduled_gratitude_messages ENABLE ROW LEVEL SECURITY;

-- Public insert for frictionless message creation
CREATE POLICY "Anyone can create scheduled messages"
ON public.scheduled_gratitude_messages FOR INSERT
WITH CHECK (true);

-- Read through participant relationship for authenticated users
CREATE POLICY "Users can read own scheduled messages"
ON public.scheduled_gratitude_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE challenge_participants.id = scheduled_gratitude_messages.participant_id
    AND challenge_participants.user_id = auth.uid()
  )
);

-- Update through participant relationship
CREATE POLICY "Users can update own scheduled messages"
ON public.scheduled_gratitude_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE challenge_participants.id = scheduled_gratitude_messages.participant_id
    AND challenge_participants.user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_challenge_participants_updated_at
BEFORE UPDATE ON public.challenge_participants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_gratitude_messages_updated_at
BEFORE UPDATE ON public.scheduled_gratitude_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
