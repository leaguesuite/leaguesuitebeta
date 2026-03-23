-- Storage bucket for document files
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Allow authenticated users to upload to documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow public read access
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'documents');

-- Allow authenticated users to read documents
CREATE POLICY "Authenticated can view documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to delete their documents
CREATE POLICY "Authenticated can delete documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents');

-- Documents metadata table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size BIGINT,
  show_in_menu BOOLEAN NOT NULL DEFAULT false,
  menu_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Org members can view documents"
ON public.documents FOR SELECT TO authenticated
USING (is_org_member(auth.uid(), org_id));

CREATE POLICY "Org admins can manage documents"
ON public.documents FOR ALL TO authenticated
USING (get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]));

CREATE POLICY "Public can view documents"
ON public.documents FOR SELECT TO anon
USING (show_in_menu = true);

-- Updated at trigger
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();