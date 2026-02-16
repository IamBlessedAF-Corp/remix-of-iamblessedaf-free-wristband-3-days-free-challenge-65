-- Allow authenticated users to view their own orders by email
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = customer_email);

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));