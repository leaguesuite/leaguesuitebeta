import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Shield, Swords, Target, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE = 'https://flagplusfootball.com';
const defaultHeaders: HeadersInit = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

interface PlayerInfo {
  id: number | string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string | null;
  role?: string;
  status?: string;
  off_rating?: number | null;
  def_rating?: number | null;
  qb_rating?: number | null;
  is_qb?: boolean;
}

interface TeamHistoryRow {
  season_name: string;
  team_name: string;
  division_name: string;
}

interface SeasonStatRow {
  season_name: string;
  team_name: string;
  division_name: string;
  GP?: number;
  TD?: number;
  YDS?: number;
  INT?: number;
  COM?: number;
}

interface CareerTotals {
  GP?: number;
  TD?: number;
  YDS?: number;
  INT?: number;
  COM?: number;
}

async function fetchPlayer(id: string): Promise<PlayerInfo> {
  const res = await fetch(`${API_BASE}/api/v1/${id}`, {
    credentials: 'include',
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error(`Player fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

async function fetchSeasonStats(id: string): Promise<SeasonStatRow[]> {
  const codes = ['GP', 'TD', 'YDS', 'INT', 'COM'];
  const query = new URLSearchParams({ memberId: id });
  codes.forEach((c) => query.append('statsCode[]', c));
  const res = await fetch(`${API_BASE}/api/v1/player-stats-season?${query}`, {
    credentials: 'include',
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error(`Season stats fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

async function fetchCareerTotals(): Promise<CareerTotals> {
  const res = await fetch(
    `${API_BASE}/api/v1/career-totals?${new URLSearchParams({ stat_type: 'passing' })}`,
    { credentials: 'include', headers: defaultHeaders },
  );
  if (!res.ok) throw new Error(`Career totals fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function HeaderSkeleton() {
  return (
    <div className="section-card p-6 flex items-center gap-6">
      <Skeleton className="w-20 h-20 rounded-full shrink-0" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="section-card">
      <div className="px-5 py-4 border-b border-border">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingBadge({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | null | undefined;
  icon: React.ElementType;
}) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground">
      <Icon className="h-3 w-3 text-muted-foreground" />
      {label}
      <span className="text-primary">{value}</span>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: player,
    isLoading: playerLoading,
    isError: playerError,
  } = useQuery({
    queryKey: ['player', id],
    queryFn: () => fetchPlayer(id!),
    enabled: !!id,
  });

  const { data: seasonStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['player-season-stats', id],
    queryFn: () => fetchSeasonStats(id!),
    enabled: !!id,
  });

  const { data: careerTotals } = useQuery({
    queryKey: ['career-totals', id],
    queryFn: () => fetchCareerTotals(),
    enabled: !!id,
  });

  /* Error state */
  if (playerError) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/members')} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Button>
        <div className="section-card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
            <UserX className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Member not found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            This member may have been removed or the ID is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/members')} className="gap-1.5 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Button>

      {/* ── Header Card ─────────────────────────────────────────────────── */}
      {playerLoading ? (
        <HeaderSkeleton />
      ) : player ? (
        <div className="section-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shrink-0 uppercase overflow-hidden">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              `${player.first_name?.charAt(0) ?? ''}${player.last_name?.charAt(0) ?? ''}`
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            {/* Name + ID */}
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {player.first_name} {player.last_name}
              </h1>
              <span className="text-sm font-mono text-muted-foreground">Member #{player.id}</span>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              {player.role && (
                <Badge variant="outline" className="capitalize text-xs">
                  {player.role}
                </Badge>
              )}
              {(() => {
                const s = (player.status ?? '').toLowerCase();
                return (
                  <Badge
                    variant={s === 'active' ? 'default' : 'secondary'}
                    className="gap-1.5 text-xs font-medium"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s === 'active' ? 'bg-accent' : 'bg-muted-foreground'}`} />
                    {player.status}
                  </Badge>
                );
              })()}
            </div>

            {/* Ratings */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <RatingBadge label="OFF" value={player.off_rating} icon={Swords} />
              <RatingBadge label="DEF" value={player.def_rating} icon={Shield} />
              {player.is_qb && <RatingBadge label="QB" value={player.qb_rating} icon={Target} />}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Season Stats Table ──────────────────────────────────────────── */}
      {statsLoading ? (
        <TableSkeleton />
      ) : (
        <div className="section-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Season History</h2>
          </div>

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_60px_60px_70px] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
            <span>Season</span>
            <span>Team</span>
            <span>Division</span>
            <span className="text-center">GP</span>
            <span className="text-center">TD</span>
            <span className="text-center">YDS</span>
          </div>

          {seasonStats.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              No season data available.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {seasonStats.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_60px_60px_70px] px-5 py-3 items-center gap-1 sm:gap-4 text-sm"
                >
                  <span className="font-medium text-foreground">{row.season_name}</span>
                  <span className="text-foreground">{row.team_name}</span>
                  <span className="text-muted-foreground">{row.division_name}</span>
                  <span className="text-center font-mono text-foreground">{row.GP ?? '—'}</span>
                  <span className="text-center font-mono text-foreground">{row.TD ?? '—'}</span>
                  <span className="text-center font-mono text-foreground">{row.YDS ?? '—'}</span>
                </div>
              ))}

              {/* Career totals */}
              {careerTotals && (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_60px_60px_70px] px-5 py-3 items-center gap-1 sm:gap-4 text-sm bg-muted/30 font-bold">
                  <span className="text-foreground">Career Totals</span>
                  <span />
                  <span />
                  <span className="text-center font-mono text-foreground">{careerTotals.GP ?? '—'}</span>
                  <span className="text-center font-mono text-foreground">{careerTotals.TD ?? '—'}</span>
                  <span className="text-center font-mono text-foreground">{careerTotals.YDS ?? '—'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
