
-- Create table for expert/coach leads enrollment
CREATE TABLE public.expert_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  niche TEXT,
  source_page TEXT DEFAULT 'experts-leads',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public lead capture form, no auth required)
CREATE POLICY "Anyone can submit expert leads"
ON public.expert_leads
FOR INSERT
WITH CHECK (true);

-- Admins can view all leads
CREATE POLICY "Admins can view expert leads"
ON public.expert_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update leads
CREATE POLICY "Admins can update expert leads"
ON public.expert_leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index on email for dedup checks
CREATE INDEX idx_expert_leads_email ON public.expert_leads (email);

-- Trigger for updated_at
CREATE TRIGGER update_expert_leads_updated_at
BEFORE UPDATE ON public.expert_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
