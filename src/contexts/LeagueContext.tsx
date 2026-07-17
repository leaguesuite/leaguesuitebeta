import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface League {
  id: string;
  name: string;
  shortName?: string;
}

export interface Tenant {
  id: string;
  name: string;
}

// Mock data — real data will come from the API later.
const MOCK_TENANT: Tenant = { id: "t1", name: "Acme Sports Group" };
const MOCK_LEAGUES: League[] = [
  { id: "l1", name: "Metro Flag League", shortName: "MFL" },
  { id: "l2", name: "Junior Development League", shortName: "JDL" },
  { id: "l3", name: "Corporate Flag League", shortName: "CFL" },
];

interface LeagueContextValue {
  tenant: Tenant;
  leagues: League[];
  activeLeague: League;
  activeLeagueId: string;
  setActiveLeagueId: (id: string) => void;
  isMultiLeague: boolean;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

const STORAGE_KEY = "activeLeagueId";

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [activeLeagueId, setActiveLeagueIdState] = useState<string>(() => {
    if (typeof window === "undefined") return MOCK_LEAGUES[0].id;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && MOCK_LEAGUES.some(l => l.id === stored)) return stored;
    return MOCK_LEAGUES[0].id;
  });

  const setActiveLeagueId = (id: string) => {
    setActiveLeagueIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, activeLeagueId);
    } catch {}
  }, [activeLeagueId]);

  const value = useMemo<LeagueContextValue>(() => {
    const activeLeague =
      MOCK_LEAGUES.find(l => l.id === activeLeagueId) ?? MOCK_LEAGUES[0];
    return {
      tenant: MOCK_TENANT,
      leagues: MOCK_LEAGUES,
      activeLeague,
      activeLeagueId: activeLeague.id,
      setActiveLeagueId,
      isMultiLeague: MOCK_LEAGUES.length > 1,
    };
  }, [activeLeagueId]);

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
}

export function useActiveLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error("useActiveLeague must be used inside <LeagueProvider>");
  return ctx;
}
