
-- Add screenshots column to board_cards (array of storage URLs)
ALTER TABLE public.board_cards
ADD COLUMN screenshots TEXT[] DEFAULT '{}';

-- Create storage bucket for board card screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-screenshots', 'board-screenshots', true);

-- Allow authenticated users to view screenshots
CREATE POLICY "Anyone can view board screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'board-screenshots');

-- Only admins can upload screenshots
CREATE POLICY "Admins can upload board screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'board-screenshots'
  AND public.has_role(auth.uid(), 'admin')
);

-- Only admins can delete screenshots
CREATE POLICY "Admins can delete board screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'board-screenshots'
  AND public.has_role(auth.uid(), 'admin')
);
