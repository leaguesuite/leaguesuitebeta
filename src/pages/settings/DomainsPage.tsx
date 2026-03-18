import { useState } from "react";
import { Globe, Copy, CheckCircle2, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface DomainRecord {
  type: string;
  name: string;
  value: string;
  ttl: string;
}

interface ConnectedDomain {
  domain: string;
  status: "active" | "pending" | "error";
  ssl: boolean;
  addedAt: string;
}

const LEAGUE_IP = "185.158.133.1";

const generateDnsRecords = (domain: string): DomainRecord[] => [
  { type: "A", name: "@", value: LEAGUE_IP, ttl: "3600" },
  { type: "A", name: "www", value: LEAGUE_IP, ttl: "3600" },
  { type: "TXT", name: "_leaguesuite", value: `leaguesuite_verify=${btoa(domain).slice(0, 12)}`, ttl: "3600" },
];

const mockDomains: ConnectedDomain[] = [
  { domain: "greatlakesleague.com", status: "active", ssl: true, addedAt: "2025-11-15" },
  { domain: "youthfootball.org", status: "pending", ssl: false, addedAt: "2026-03-17" },
];

export default function DomainsPage() {
  const [domains, setDomains] = useState<ConnectedDomain[]>(mockDomains);
  const [newDomain, setNewDomain] = useState("");
  const [showDns, setShowDns] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddDomain = () => {
    const cleaned = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!cleaned || !cleaned.includes(".")) {
      toast.error("Please enter a valid domain name");
      return;
    }
    if (domains.some(d => d.domain === cleaned)) {
      toast.error("Domain already added");
      return;
    }
    setDomains(prev => [...prev, { domain: cleaned, status: "pending", ssl: false, addedAt: new Date().toISOString().split("T")[0] }]);
    setShowDns(cleaned);
    setNewDomain("");
    toast.success("Domain added — configure your DNS records below");
  };

  const removeDomain = (domain: string) => {
    setDomains(prev => prev.filter(d => d.domain !== domain));
    if (showDns === domain) setShowDns(null);
    toast.success("Domain removed");
  };

  const statusBadge = (status: ConnectedDomain["status"]) => {
    const map = {
      active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      pending: { label: "Pending DNS", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      error: { label: "Error", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    const s = map[status];
    return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
  };

  const DnsInstructions = ({ domain }: { domain: string }) => {
    const records = generateDnsRecords(domain);
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">DNS Configuration for {domain}</CardTitle>
          <CardDescription>Add these records at your domain registrar. Changes can take up to 48 hours to propagate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="godaddy">
            <TabsList>
              <TabsTrigger value="godaddy">GoDaddy</TabsTrigger>
              <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="godaddy" className="space-y-3 mt-3">
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Log in to your <a href="https://dcc.godaddy.com" target="_blank" rel="noopener" className="text-primary underline">GoDaddy account</a></li>
                <li>Go to <strong>My Products → DNS</strong> next to your domain</li>
                <li>Click <strong>Add Record</strong> and enter each record below</li>
                <li>Save and wait for propagation</li>
              </ol>
            </TabsContent>

            <TabsContent value="cloudflare" className="space-y-3 mt-3">
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Log in to your <a href="https://dash.cloudflare.com" target="_blank" rel="noopener" className="text-primary underline">Cloudflare dashboard</a></li>
                <li>Select your domain → <strong>DNS → Records</strong></li>
                <li>Click <strong>Add Record</strong> for each entry below</li>
                <li>Set proxy status to <strong>DNS only</strong> (grey cloud) for A records</li>
              </ol>
            </TabsContent>

            <TabsContent value="other" className="mt-3">
              <p className="text-sm text-muted-foreground">Add the DNS records below using your registrar's DNS management panel. Refer to their documentation for specific steps.</p>
            </TabsContent>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Type</TableHead>
                <TableHead className="w-32">Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-16">TTL</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r, i) => (
                <TableRow key={i}>
                  <TableCell><Badge variant="secondary" className="font-mono text-xs">{r.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs break-all">{r.value}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.ttl}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(r.value, `${domain}-${i}`)}>
                      {copiedField === `${domain}-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              SSL certificates are provisioned automatically once DNS records are verified. This may take up to 24 hours after DNS propagation.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Domains</h1>
        <p className="text-muted-foreground mt-1">Connect your custom domain to your league's public site.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Custom Domain</CardTitle>
          <CardDescription>Enter your domain name to get DNS setup instructions for GoDaddy or Cloudflare.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="domain" className="sr-only">Domain</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddDomain()}
              />
            </div>
            <Button onClick={handleAddDomain}>
              <Globe className="h-4 w-4 mr-2" />
              Connect Domain
            </Button>
          </div>
        </CardContent>
      </Card>

      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connected Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SSL</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map(d => (
                  <TableRow key={d.domain}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {d.domain}
                        {d.status === "active" && (
                          <a href={`https://${d.domain}`} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(d.status)}</TableCell>
                    <TableCell>
                      {d.ssl
                        ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Secured</Badge>
                        : <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.addedAt}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => setShowDns(showDns === d.domain ? null : d.domain)}>
                        DNS Records
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toast.success("Checking DNS status...")}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeDomain(d.domain)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {showDns && <DnsInstructions domain={showDns} />}
    </div>
  );
}
