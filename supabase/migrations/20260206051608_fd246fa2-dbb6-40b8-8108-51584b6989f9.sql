-- Add DELETE policy for creator_profiles to comply with GDPR right to erasure
CREATE POLICY "Users can delete their own profile"
ON public.creator_profiles
FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);