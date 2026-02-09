
-- Short links table (Bitly-style)
CREATE TABLE public.short_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code text NOT NULL UNIQUE,
  destination_url text NOT NULL,
  title text,
  campaign text,
  source_page text,
  created_by uuid,
  click_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Click tracking table (detailed analytics)
CREATE TABLE public.link_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id uuid NOT NULL REFERENCES public.short_links(id) ON DELETE CASCADE,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  referrer text,
  user_agent text,
  ip_hash text,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_short_links_code ON public.short_links(short_code);
CREATE INDEX idx_short_links_campaign ON public.short_links(campaign);
CREATE INDEX idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON public.link_clicks(clicked_at);

-- Enable RLS
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Short links: anyone can read active links (needed for redirect)
CREATE POLICY "Anyone can read active short links"
ON public.short_links FOR SELECT
USING (is_active = true);

-- Short links: authenticated users can create
CREATE POLICY "Authenticated users can create short links"
ON public.short_links FOR INSERT
WITH CHECK (true);

-- Short links: admins can manage all
CREATE POLICY "Admins can manage short links"
ON public.short_links FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Link clicks: anyone can insert (edge function inserts on redirect)
CREATE POLICY "Anyone can insert link clicks"
ON public.link_clicks FOR INSERT
WITH CHECK (true);

-- Link clicks: admins can read analytics
CREATE POLICY "Admins can read link clicks"
ON public.link_clicks FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Link clicks: link creators can read their own link analytics
CREATE POLICY "Creators can read own link clicks"
ON public.link_clicks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.short_links
    WHERE short_links.id = link_clicks.link_id
    AND short_links.created_by = auth.uid()
  )
);

-- Function to generate short codes
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..7 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to atomically increment click count
CREATE OR REPLACE FUNCTION public.increment_click_count(p_link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.short_links
  SET click_count = click_count + 1, updated_at = now()
  WHERE id = p_link_id;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_short_links_updated_at
BEFORE UPDATE ON public.short_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
