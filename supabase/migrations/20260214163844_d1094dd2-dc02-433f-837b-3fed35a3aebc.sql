-- Function to count paid SMART wristband reservations from orders table
CREATE OR REPLACE FUNCTION public.get_smart_reservation_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(count(*)::integer, 0) 
  FROM public.orders 
  WHERE tier ILIKE '%kickstarter%' 
    AND status = 'completed';
$$;