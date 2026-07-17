export type Scope = "tenant" | "league" | "event";

// Ordered: first matching prefix wins.
const RULES: { prefix: string; scope: Scope }[] = [
  // Tenant-level pages
  { prefix: "/structure/leagues", scope: "tenant" },
  { prefix: "/members", scope: "tenant" },
  { prefix: "/admin", scope: "tenant" },
  { prefix: "/settings", scope: "tenant" },
  { prefix: "/support", scope: "tenant" },
  { prefix: "/integrations", scope: "tenant" },

  // Event-level pages (specific season/tournament in play)
  { prefix: "/season", scope: "event" },

  // League-level pages
  { prefix: "/structure", scope: "league" },
  { prefix: "/scorekeeper", scope: "league" },
  { prefix: "/setup", scope: "league" },
  { prefix: "/registration", scope: "league" },
  { prefix: "/ratings", scope: "league" },
  { prefix: "/accolades", scope: "league" },
  { prefix: "/features", scope: "league" },
  { prefix: "/cms", scope: "league" },
  { prefix: "/forms", scope: "league" },
];

export function getRouteScope(pathname: string): Scope {
  for (const rule of RULES) {
    if (pathname === rule.prefix || pathname.startsWith(rule.prefix + "/")) {
      return rule.scope;
    }
  }
  return "tenant"; // Dashboard and unknown routes
}
