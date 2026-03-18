
-- ============================================
-- Migration 1: Enums, Organizations, Auth
-- ============================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'manager', 'staff', 'viewer');
CREATE TYPE public.member_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE public.season_status AS ENUM ('draft', 'registration', 'active', 'completed', 'archived');
CREATE TYPE public.division_status AS ENUM ('setup', 'active', 'completed');
CREATE TYPE public.game_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed');
CREATE TYPE public.bracket_status AS ENUM ('setup', 'active', 'completed');
CREATE TYPE public.match_status AS ENUM ('upcoming', 'in_progress', 'completed');
CREATE TYPE public.waiver_status AS ENUM ('signed', 'unsigned', 'expired');
CREATE TYPE public.disciplinary_type AS ENUM ('warning', 'suspension', 'ban');
CREATE TYPE public.communication_channel AS ENUM ('email', 'sms');
CREATE TYPE public.delivery_status AS ENUM ('sent', 'failed', 'pending');
CREATE TYPE public.roster_role AS ENUM ('player', 'captain', 'coach');
CREATE TYPE public.stat_category AS ENUM ('passing', 'rushing', 'receiving', 'defense', 'special_teams', 'general');
CREATE TYPE public.registration_status AS ENUM ('draft', 'open', 'closed', 'archived');
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected', 'waitlisted');
CREATE TYPE public.page_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.domain_status AS ENUM ('pending_dns', 'active', 'error');
CREATE TYPE public.ssl_status AS ENUM ('pending', 'active', 'error');
CREATE TYPE public.note_category AS ENUM ('general', 'phone_call', 'meeting', 'issue', 'follow_up');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Organizations (top-level tenant)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Organization members (maps users to orgs with roles)
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Global user roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Security definer: check global role
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

-- Security definer: check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

-- Security definer: check org role
CREATE OR REPLACE FUNCTION public.get_org_role(_user_id UUID, _org_id UUID)
RETURNS org_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = _user_id AND org_id = _org_id
  LIMIT 1
$$;

-- Enable RLS on auth tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Organizations: members can view their orgs
CREATE POLICY "Org members can view their organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (public.is_org_member(auth.uid(), id));

-- Organizations: owners/admins can update
CREATE POLICY "Org admins can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.get_org_role(auth.uid(), id) IN ('owner', 'admin'));

-- Organization members: members can view other members in same org
CREATE POLICY "Org members can view org members"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

-- Organization members: owners/admins can manage
CREATE POLICY "Org admins can insert org members"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin'));

CREATE POLICY "Org admins can update org members"
  ON public.organization_members FOR UPDATE
  TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin'));

CREATE POLICY "Org admins can delete org members"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin'));

-- User roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_org_members_org_id ON public.organization_members(org_id);
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
