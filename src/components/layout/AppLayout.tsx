import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import PageScopeBanner from "./PageScopeBanner";
import { LeagueProvider } from "@/contexts/LeagueContext";
import { getRouteScope } from "@/lib/routeScope";

function LayoutInner() {
  const location = useLocation();
  const scope = getRouteScope(location.pathname);
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          {scope !== "tenant" && (
            <div className="mb-4">
              <PageScopeBanner scope={scope} />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <LeagueProvider>
      <LayoutInner />
    </LeagueProvider>
  );
}
