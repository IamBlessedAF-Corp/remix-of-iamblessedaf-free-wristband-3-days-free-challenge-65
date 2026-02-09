-- Function to calculate total meals donated based on orders
-- Tier-to-meals mapping: wristband-22=22, pack-111=11, pack-444=1111, pack-1111=11111, pack-4444=44444, monthly-11=1
-- We also add a base seed for meals from pre-launch / manual donations
CREATE OR REPLACE FUNCTION public.get_total_meals_donated()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT SUM(
      CASE tier
        WHEN 'free-wristband' THEN 0
        WHEN 'wristband-22' THEN 22
        WHEN 'pack-111' THEN 11
        WHEN 'pack-444' THEN 1111
        WHEN 'pack-1111' THEN 11111
        WHEN 'pack-4444' THEN 44444
        WHEN 'monthly-11' THEN 1
        ELSE 0
      END
    ) FROM orders WHERE status = 'completed'),
    0
  ) + 11247  -- base seed: pre-launch donations
$$;