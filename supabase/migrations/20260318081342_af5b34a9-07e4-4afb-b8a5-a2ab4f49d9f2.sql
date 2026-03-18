
-- ============================================
-- Migration 6: CRM, Registration, Accolades, CMS, Settings, Standings
-- ============================================

-- Member Tags
CREATE TABLE public.member_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'hsl(221, 83%, 53%)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.member_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.member_tags(id) ON DELETE CASCADE,
  UNIQUE(member_id, tag_id)
);

-- Member Notes
CREATE TABLE public.member_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category note_category NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Waivers
CREATE TABLE public.waivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  waiver_type TEXT NOT NULL,
  status waiver_status NOT NULL DEFAULT 'unsigned',
  signed_date DATE,
  expiry_date DATE,
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disciplinary Records
CREATE TABLE public.disciplinary_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type disciplinary_type NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Communications
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  channel communication_channel NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status delivery_status NOT NULL DEFAULT 'pending'
);

-- Registration
CREATE TABLE public.registration_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'individual',
  status registration_status NOT NULL DEFAULT 'draft',
  capacity INTEGER,
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_registration_forms_updated_at
  BEFORE UPDATE ON public.registration_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.registration_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.registration_forms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  team_name TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  status submission_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accolades
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.award_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
  notes TEXT,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CMS
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  status page_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, slug)
);

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT,
  featured_image TEXT,
  status page_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, slug)
);

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Domains
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  status domain_status NOT NULL DEFAULT 'pending_dns',
  ssl_status ssl_status NOT NULL DEFAULT 'pending',
  dns_provider TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Standings
CREATE TABLE public.standings_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  points_config JSONB DEFAULT '{"win": 3, "loss": 0, "tie": 1}'::jsonb,
  sort_criteria JSONB DEFAULT '["points", "wins", "point_diff"]'::jsonb,
  tiebreak_rules JSONB DEFAULT '["head_to_head", "point_diff"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.standing_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS on all new tables
ALTER TABLE public.member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standing_overrides ENABLE ROW LEVEL SECURITY;

-- Policies for org-scoped tables (member_tags, awards, pages, articles, domains)
CREATE POLICY "Org members can view member tags" ON public.member_tags FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org staff can manage member tags" ON public.member_tags FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager', 'staff'));

CREATE POLICY "Org members can view awards" ON public.awards FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org admins can manage awards" ON public.awards FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager'));

CREATE POLICY "Org members can view pages" ON public.pages FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org admins can manage pages" ON public.pages FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager'));

CREATE POLICY "Org members can view articles" ON public.articles FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org admins can manage articles" ON public.articles FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager'));

CREATE POLICY "Org members can view domains" ON public.domains FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org admins can manage domains" ON public.domains FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin'));

-- Policies for member-scoped tables
CREATE POLICY "Org members can view tag assignments" ON public.member_tag_assignments FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_member_org_id(member_id)));
CREATE POLICY "Org staff can manage tag assignments" ON public.member_tag_assignments FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_member_org_id(member_id)) IN ('owner', 'admin', 'manager', 'staff'));

CREATE POLICY "Org members can view member notes" ON public.member_notes FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_member_org_id(member_id)));
CREATE POLICY "Org staff can manage member notes" ON public.member_notes FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_member_org_id(member_id)) IN ('owner', 'admin', 'manager', 'staff'));

CREATE POLICY "Org members can view waivers" ON public.waivers FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_member_org_id(member_id)));
CREATE POLICY "Org staff can manage waivers" ON public.waivers FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_member_org_id(member_id)) IN ('owner', 'admin', 'manager', 'staff'));

CREATE POLICY "Org members can view disciplinary records" ON public.disciplinary_records FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_member_org_id(member_id)));
CREATE POLICY "Org staff can manage disciplinary records" ON public.disciplinary_records FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_member_org_id(member_id)) IN ('owner', 'admin', 'manager', 'staff'));

CREATE POLICY "Org members can view communications" ON public.communications FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_member_org_id(member_id)));
CREATE POLICY "Org staff can manage communications" ON public.communications FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_member_org_id(member_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Policies for season-scoped tables (registration)
CREATE POLICY "Org members can view registration forms" ON public.registration_forms FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_season_org_id(season_id)));
CREATE POLICY "Org admins can manage registration forms" ON public.registration_forms FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_season_org_id(season_id)) IN ('owner', 'admin', 'manager'));

-- Helper: get org_id from registration form
CREATE OR REPLACE FUNCTION public.get_form_org_id(_form_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.get_season_org_id(season_id)
  FROM public.registration_forms WHERE id = _form_id LIMIT 1
$$;

CREATE POLICY "Org members can view submissions" ON public.registration_submissions FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_form_org_id(form_id)));
CREATE POLICY "Org staff can manage submissions" ON public.registration_submissions FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_form_org_id(form_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Policies for award recipients
CREATE OR REPLACE FUNCTION public.get_award_org_id(_award_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT org_id FROM public.awards WHERE id = _award_id LIMIT 1
$$;

CREATE POLICY "Org members can view award recipients" ON public.award_recipients FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_award_org_id(award_id)));
CREATE POLICY "Org admins can manage award recipients" ON public.award_recipients FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_award_org_id(award_id)) IN ('owner', 'admin', 'manager'));

-- Standings policies
CREATE POLICY "Org members can view standings profiles" ON public.standings_profiles FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_league_org_id(league_id)));
CREATE POLICY "Org admins can manage standings profiles" ON public.standings_profiles FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_league_org_id(league_id)) IN ('owner', 'admin', 'manager'));

CREATE POLICY "Org members can view standing overrides" ON public.standing_overrides FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), public.get_division_org_id(division_id)));
CREATE POLICY "Org admins can manage standing overrides" ON public.standing_overrides FOR ALL TO authenticated USING (public.get_org_role(auth.uid(), public.get_division_org_id(division_id)) IN ('owner', 'admin', 'manager'));

-- Indexes
CREATE INDEX idx_member_tags_org_id ON public.member_tags(org_id);
CREATE INDEX idx_member_tag_assignments_member_id ON public.member_tag_assignments(member_id);
CREATE INDEX idx_member_tag_assignments_tag_id ON public.member_tag_assignments(tag_id);
CREATE INDEX idx_member_notes_member_id ON public.member_notes(member_id);
CREATE INDEX idx_waivers_member_id ON public.waivers(member_id);
CREATE INDEX idx_disciplinary_records_member_id ON public.disciplinary_records(member_id);
CREATE INDEX idx_communications_member_id ON public.communications(member_id);
CREATE INDEX idx_registration_forms_season_id ON public.registration_forms(season_id);
CREATE INDEX idx_registration_submissions_form_id ON public.registration_submissions(form_id);
CREATE INDEX idx_awards_org_id ON public.awards(org_id);
CREATE INDEX idx_award_recipients_award_id ON public.award_recipients(award_id);
CREATE INDEX idx_award_recipients_member_id ON public.award_recipients(member_id);
CREATE INDEX idx_pages_org_id ON public.pages(org_id);
CREATE INDEX idx_articles_org_id ON public.articles(org_id);
CREATE INDEX idx_domains_org_id ON public.domains(org_id);
CREATE INDEX idx_standings_profiles_league_id ON public.standings_profiles(league_id);
CREATE INDEX idx_standing_overrides_division_id ON public.standing_overrides(division_id);
