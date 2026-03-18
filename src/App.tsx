import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import GamesPage from "@/pages/season/GamesPage";
import StandingsPage from "@/pages/season/StandingsPage";
import TeamsRostersPage from "@/pages/season/TeamsRostersPage";
import BracketsPage from "@/pages/season/BracketsPage";
import ReportsPage from "@/pages/season/ReportsPage";
import StatsPage from "@/pages/season/StatsPage";
import CategoriesPage from "@/pages/structure/CategoriesPage";
import NewSeasonWizard from "@/pages/setup/NewSeasonWizard";
import UsersPermissionsPage from "@/pages/admin/UsersPermissionsPage";
import LocationsPage from "@/pages/structure/LocationsPage";
import StandingsRulesPage from "@/pages/structure/StandingsRulesPage";
import RegistrationPage from "@/pages/registration/RegistrationPage";
import AccoladesPage from "@/pages/accolades/AccoladesPage";
import MembersPage from "@/pages/members/MembersPage";
import CMSPagesPage from "@/pages/cms/CMSPagesPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NewsPage from "@/pages/cms/NewsPage";
import AIContentPage from "@/pages/content/AIContentPage";
import NavigationMenusPage from "@/pages/settings/NavigationMenusPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/season/overview" element={<PlaceholderPage title="Season Overview" description="Current season summary and key metrics." />} />
            <Route path="/season/games" element={<GamesPage />} />
            <Route path="/season/teams" element={<TeamsRostersPage />} />
            <Route path="/season/standings" element={<StandingsPage />} />
            <Route path="/season/brackets" element={<BracketsPage />} />
            <Route path="/season/stats" element={<PlaceholderPage title="Stats" description="Player and team statistics overview." />} />
            <Route path="/season/officials" element={<PlaceholderPage title="Officials & Staff" description="Manage officials and game staff." />} />
            <Route path="/season/reports" element={<ReportsPage />} />
            <Route path="/setup/new-season" element={<NewSeasonWizard />} />
            <Route path="/setup/seasons" element={<PlaceholderPage title="Seasons" description="View and manage all seasons." />} />
            <Route path="/setup/tournaments" element={<PlaceholderPage title="Tournaments" description="Manage tournament brackets and formats." />} />
            <Route path="/setup/division-assignment" element={<PlaceholderPage title="Division Assignment" description="Assign teams to divisions." />} />
            <Route path="/setup/conferences" element={<PlaceholderPage title="Conferences" description="Configure conferences and subdivisions." />} />
            <Route path="/setup/scheduling" element={<PlaceholderPage title="Scheduling Setup" description="Configure scheduling rules and constraints." />} />
            <Route path="/structure/leagues" element={<PlaceholderPage title="Leagues" description="Manage your leagues." />} />
            <Route path="/structure/categories" element={<CategoriesPage />} />
            <Route path="/structure/divisions" element={<PlaceholderPage title="Divisions" description="Manage divisions across categories." />} />
            <Route path="/structure/conferences" element={<PlaceholderPage title="Conferences" description="Configure conferences." />} />
            <Route path="/structure/subdivisions" element={<PlaceholderPage title="Subdivisions" description="Manage conference subdivisions." />} />
            <Route path="/structure/locations" element={<LocationsPage />} />
            <Route path="/structure/rules" element={<PlaceholderPage title="Rules Settings" description="Configure rule templates." />} />
            <Route path="/structure/stats-tracking" element={<PlaceholderPage title="Stats Tracking" description="Configure which stats to track." />} />
            <Route path="/structure/standings-rules" element={<StandingsRulesPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/accolades" element={<AccoladesPage />} />
            <Route path="/members/all" element={<MembersPage />} />
            <Route path="/members/players" element={<MembersPage />} />
            <Route path="/members/coaches" element={<MembersPage />} />
            <Route path="/members/staff" element={<MembersPage />} />
            <Route path="/members/*" element={<MembersPage />} />
            <Route path="/cms/pages" element={<CMSPagesPage />} />
            <Route path="/cms/articles" element={<PlaceholderPage title="Articles" description="Manage news articles and blog posts." />} />
            <Route path="/cms/news" element={<NewsPage />} />
            <Route path="/cms/ai-content" element={<AIContentPage />} />
            <Route path="/cms/authors" element={<PlaceholderPage title="Authors" description="Manage content authors." />} />
            <Route path="/cms/media" element={<PlaceholderPage title="Media / Documents" description="Manage media files and documents." />} />
            <Route path="/cms/media" element={<PlaceholderPage title="Media / Documents" description="Manage media files and documents." />} />
            <Route path="/forms/*" element={<PlaceholderPage title="Forms" description="Manage forms, submissions, and payments." />} />
            <Route path="/admin/users" element={<UsersPermissionsPage />} />
            <Route path="/admin/roles" element={<UsersPermissionsPage />} />
            <Route path="/admin/permissions" element={<PlaceholderPage title="Permission Groups" description="Configure granular permission groups." />} />
            <Route path="/admin/access" element={<PlaceholderPage title="App Access Controls" description="Manage application-level access." />} />
            <Route path="/integrations/*" element={<PlaceholderPage title="Integrations" description="Manage third-party integrations." />} />
            <Route path="/settings/navigation" element={<NavigationMenusPage />} />
            <Route path="/settings/*" element={<PlaceholderPage title="Settings" description="League settings and configuration." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
