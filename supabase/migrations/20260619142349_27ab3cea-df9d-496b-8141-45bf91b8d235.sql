
CREATE TABLE public.scorekeeper_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  format text NOT NULL DEFAULT '5v5',
  downs integer NOT NULL DEFAULT 4,
  period_length integer NOT NULL DEFAULT 20,
  field_size integer NOT NULL DEFAULT 50,
  red_zone_yards integer NOT NULL DEFAULT 5,
  number_of_periods integer NOT NULL DEFAULT 2,
  league_type text NOT NULL DEFAULT 'Flag',
  onside_plays_relative_default_position integer NOT NULL DEFAULT 5,
  possession_start_relative_default_position integer NOT NULL DEFAULT 10,
  ocur_plays_off integer NOT NULL DEFAULT 5,
  female_switch boolean NOT NULL DEFAULT true,
  allow_live_scoring boolean NOT NULL DEFAULT true,
  use_fumble boolean NOT NULL DEFAULT true,
  use_lateral boolean NOT NULL DEFAULT true,
  touchdown_points integer NOT NULL DEFAULT 6,
  female_additional_points integer NOT NULL DEFAULT 2,
  use_air_yards boolean NOT NULL DEFAULT true,
  use_yards_after_catch boolean NOT NULL DEFAULT true,
  use_pass_direction boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.scorekeeper_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scorekeeper_categories TO authenticated;
GRANT ALL ON public.scorekeeper_categories TO service_role;

ALTER TABLE public.scorekeeper_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read scorekeeper categories"
  ON public.scorekeeper_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert scorekeeper categories"
  ON public.scorekeeper_categories FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update scorekeeper categories"
  ON public.scorekeeper_categories FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete scorekeeper categories"
  ON public.scorekeeper_categories FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER trg_scorekeeper_categories_updated_at
  BEFORE UPDATE ON public.scorekeeper_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.scorekeeper_categories
  (name, format, downs, period_length, field_size, red_zone_yards, number_of_periods, league_type,
   onside_plays_relative_default_position, possession_start_relative_default_position, ocur_plays_off,
   female_switch, allow_live_scoring, use_fumble, use_lateral, touchdown_points, female_additional_points,
   use_air_yards, use_yards_after_catch, use_pass_direction)
VALUES
  ('Men''s 6v6','6v6',4,20,100,5,2,'Flag',5,10,5,true,true,true,true,6,1,true,true,true),
  ('Men''s 5v5','5v5',4,20,80,5,2,'Flag',5,10,5,false,true,true,false,6,0,true,true,false),
  ('Women''s 5v5','5v5',4,15,50,5,2,'Flag',5,10,5,false,true,false,false,6,0,false,false,false),
  ('Co-Ed 7v7','7v7',4,25,100,10,4,'Tackle',5,10,5,true,true,true,true,6,2,true,true,true);
