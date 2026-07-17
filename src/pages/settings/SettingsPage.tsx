import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings2, Palette, Menu, Globe, Languages } from "lucide-react";
import GeneralSettingsPage from "./GeneralSettingsPage";
import BrandingPage from "./BrandingPage";
import NavigationMenusPage from "./NavigationMenusPage";
import DomainsPage from "./DomainsPage";
import LanguagesPage from "./LanguagesPage";
import { useActiveLeague } from "@/contexts/LeagueContext";

const TABS = [
  { value: "general", label: "General", icon: Settings2 },
  { value: "branding", label: "Branding", icon: Palette },
  { value: "navigation", label: "Navigation", icon: Menu },
  { value: "domains", label: "Domains", icon: Globe },
  { value: "languages", label: "Languages", icon: Languages },
] as const;

export default function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { activeLeague } = useActiveLeague();
  const active = TABS.find((t) => t.value === tab)?.value ?? "general";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {activeLeague.name} <span className="text-muted-foreground font-normal">› Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage league preferences, branding, navigation, and domains.
        </p>
      </div>

      <Tabs
        value={active}
        onValueChange={(v) => navigate(`/settings/${v}`)}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="mt-0"><GeneralSettingsPage /></TabsContent>
        <TabsContent value="branding" className="mt-0"><BrandingPage /></TabsContent>
        <TabsContent value="navigation" className="mt-0"><NavigationMenusPage /></TabsContent>
        <TabsContent value="domains" className="mt-0"><DomainsPage /></TabsContent>
        <TabsContent value="languages" className="mt-0"><LanguagesPage /></TabsContent>
      </Tabs>
    </div>
  );
}
