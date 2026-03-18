import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', path: '/site' },
  { label: 'Standings', path: '/site/standings' },
  { label: 'Schedule', path: '/site/schedule' },
  { label: 'Stats', path: '/site/stats' },
  { label: 'Teams', path: '/site/teams' },
];

export default function PublicLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[hsl(220,20%,8%)] text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-[hsl(220,25%,6%)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-8">
            <Link to="/site" className="font-extrabold text-lg tracking-tight text-white shrink-0">
              METRO <span className="text-[hsl(var(--primary))]">FLAG FOOTBALL</span>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/site' && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition-colors rounded',
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-8 text-center text-white/40 text-sm">
        © 2025 Metro Flag Football League. Powered by LeagueSuite.
      </footer>
    </div>
  );
}
