
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table (separate from profiles per security guidelines)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- User roles: users can only view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Board columns table
CREATE TABLE public.board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view columns"
ON public.board_columns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert columns"
ON public.board_columns FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update columns"
ON public.board_columns FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete columns"
ON public.board_columns FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Board cards table
CREATE TABLE public.board_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES public.board_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  master_prompt TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  staging_status TEXT DEFAULT 'staging',
  logs TEXT,
  summary TEXT,
  preview_link TEXT,
  labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.board_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view cards"
ON public.board_cards FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert cards"
ON public.board_cards FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cards"
ON public.board_cards FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cards"
ON public.board_cards FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on cards
CREATE TRIGGER update_board_cards_updated_at
BEFORE UPDATE ON public.board_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
