// Public read-only endpoint that serves Scorekeeper categories at
// {SUPABASE_URL}/functions/v1/sk-v2-categories  (a.k.a. /api/sk/v2/categories)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function toApi(r: any) {
  return {
    id: r.id,
    name: r.name,
    format: r.format,
    downs: r.downs,
    periodLength: r.period_length,
    FieldSize: r.field_size,
    RedZoneYards: r.red_zone_yards,
    NumberOfPeriods: r.number_of_periods,
    LeagueType: r.league_type,
    OnsidePlaysRelativeDefaultPosition: r.onside_plays_relative_default_position,
    PossessionStartRelativeDefaultPosition: r.possession_start_relative_default_position,
    OCURPlaysOff: r.ocur_plays_off,
    FemaleSwitch: r.female_switch,
    AllowLiveScoring: r.allow_live_scoring,
    UseFumble: r.use_fumble,
    UseLateral: r.use_lateral,
    TouchdownPoints: r.touchdown_points,
    FemaleAdditionalPoints: r.female_additional_points,
    UseAirYards: r.use_air_yards,
    UseYardsAfterCatch: r.use_yards_after_catch,
    UsePassDirection: r.use_pass_direction,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("scorekeeper_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ categories: (data ?? []).map(toApi) }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
