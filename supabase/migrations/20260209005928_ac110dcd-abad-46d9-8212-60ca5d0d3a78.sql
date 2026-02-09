
-- Create orders table to track completed payments
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  customer_email TEXT,
  tier TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow the service role (edge functions) to insert
-- No public read needed unless you want users to see their orders
CREATE POLICY "Service role can manage orders"
  ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for lookups
CREATE INDEX idx_orders_stripe_session ON public.orders (stripe_session_id);
CREATE INDEX idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX idx_orders_tier ON public.orders (tier);
