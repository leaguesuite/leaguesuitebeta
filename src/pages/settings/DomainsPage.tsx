import { useState } from "react";
import {
  Globe, Copy, CheckCircle2, ExternalLink, AlertCircle, RefreshCw,
  Mail, Shield, Plus, Trash2, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

/* ─── Types ─── */

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

interface EmailDomain {
  domain: string;
  status: "active" | "pending" | "error";
  provider: "godaddy" | "cloudflare" | "other";
  addedAt: string;
  records: {
    spf: { status: "verified" | "pending" | "error"; value: string };
    dkim: { status: "verified" | "pending" | "error"; value: string; name: string };
    mx: { status: "verified" | "pending" | "error"; value: string };
    dmarc: { status: "verified" | "pending" | "error"; value: string };
  };
}

/* ─── Constants ─── */

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

const mockEmailDomains: EmailDomain[] = [
  {
    domain: "greatlakesleague.com",
    status: "active",
    provider: "godaddy",
    addedAt: "2025-11-20",
    records: {
      spf: { status: "verified", value: 'v=spf1 include:_spf.leaguesuite.app ~all' },
      dkim: { status: "verified", value: "dkim._domainkey.greatlakesleague.com", name: "leaguesuite._domainkey" },
      mx: { status: "verified", value: "mx.leaguesuite.app" },
      dmarc: { status: "verified", value: "v=DMARC1; p=none; rua=mailto:dmarc@greatlakesleague.com" },
    },
  },
];

/* ─── Helpers ─── */

const statusBadge = (status: "active" | "pending" | "error") => {
  const map = {
    active: { label: "Active", variant: "default" as const },
    pending: { label: "Pending", variant: "secondary" as const },
    error: { label: "Error", variant: "destructive" as const },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
};

const recordStatusIcon = (status: "verified" | "pending" | "error") => {
  if (status === "verified") return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (status === "pending") return <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />;
  return <AlertCircle className="h-4 w-4 text-destructive" />;
};

/* ─── Component ─── */

export default function DomainsPage() {
  const [activeTab, setActiveTab] = useState("domains");
  const [domains, setDomains] = useState<ConnectedDomain[]>(mockDomains);
  const [emailDomains, setEmailDomains] = useState<EmailDomain[]>(mockEmailDomains);
  const [newDomain, setNewDomain] = useState("");
  const [newEmailDomain, setNewEmailDomain] = useState("");
  const [showDns, setShowDns] = useState<string | null>(null);
  const [showEmailDns, setShowEmailDns] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(text, field)}>
      {copiedField === field ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );

  /* ── Site domain handlers ── */

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

  /* ── Email domain handlers ── */

  const handleAddEmailDomain = () => {
    const cleaned = newEmailDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!cleaned || !cleaned.includes(".")) {
      toast.error("Please enter a valid domain name");
      return;
    }
    if (emailDomains.some(d => d.domain === cleaned)) {
      toast.error("Email domain already added");
      return;
    }
    const newRecord: EmailDomain = {
      domain: cleaned,
      status: "pending",
      provider: "other",
      addedAt: new Date().toISOString().split("T")[0],
      records: {
        spf: { status: "pending", value: `v=spf1 include:_spf.leaguesuite.app ~all` },
        dkim: { status: "pending", value: `leaguesuite._domainkey.${cleaned}`, name: "leaguesuite._domainkey" },
        mx: { status: "pending", value: "mx.leaguesuite.app" },
        dmarc: { status: "pending", value: `v=DMARC1; p=none; rua=mailto:dmarc@${cleaned}` },
      },
    };
    setEmailDomains(prev => [...prev, newRecord]);
    setShowEmailDns(cleaned);
    setNewEmailDomain("");
    toast.success("Email domain added — configure DNS records to verify");
  };

  const removeEmailDomain = (domain: string) => {
    setEmailDomains(prev => prev.filter(d => d.domain !== domain));
    if (showEmailDns === domain) setShowEmailDns(null);
    toast.success("Email domain removed");
  };

  /* ── DNS instructions sub-component ── */

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
              <p className="text-sm text-muted-foreground">Add the DNS records below using your registrar's DNS management panel.</p>
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
                  <TableCell><CopyBtn text={r.value} field={`${domain}-${i}`} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              SSL certificates are provisioned automatically once DNS records are verified.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  /* ── Email DNS instructions sub-component ── */

  const EmailDnsInstructions = ({ emailDomain }: { emailDomain: EmailDomain }) => {
    const emailRecords: DomainRecord[] = [
      { type: "TXT", name: "@", value: emailDomain.records.spf.value, ttl: "3600" },
      { type: "CNAME", name: emailDomain.records.dkim.name, value: emailDomain.records.dkim.value, ttl: "3600" },
      { type: "MX", name: "@", value: emailDomain.records.mx.value, ttl: "3600" },
      { type: "TXT", name: "_dmarc", value: emailDomain.records.dmarc.value, ttl: "3600" },
    ];

    const allVerified = Object.values(emailDomain.records).every(r => r.status === "verified");

    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email DNS for {emailDomain.domain}
          </CardTitle>
          <CardDescription>
            {allVerified
              ? "All records verified — email is active for this domain."
              : "Add these records to enable email sending from your domain."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verification status summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["spf", "dkim", "mx", "dmarc"] as const).map(key => (
              <div key={key} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                {recordStatusIcon(emailDomain.records[key].status)}
                <span className="text-sm font-medium text-foreground uppercase">{key}</span>
                <span className="text-xs text-muted-foreground ml-auto capitalize">
                  {emailDomain.records[key].status}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Provider tabs */}
          <Tabs defaultValue="godaddy">
            <TabsList>
              <TabsTrigger value="godaddy">GoDaddy</TabsTrigger>
              <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <TabsContent value="godaddy" className="space-y-3 mt-3">
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Log in to <a href="https://dcc.godaddy.com" target="_blank" rel="noopener" className="text-primary underline">GoDaddy</a> → <strong>DNS Management</strong></li>
                <li>Add each record below (TXT, CNAME, MX)</li>
                <li>If an SPF record already exists, merge the <code className="text-xs bg-muted px-1 rounded">include:</code> value into it</li>
                <li>Save and wait for verification</li>
              </ol>
            </TabsContent>
            <TabsContent value="cloudflare" className="space-y-3 mt-3">
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Open <a href="https://dash.cloudflare.com" target="_blank" rel="noopener" className="text-primary underline">Cloudflare</a> → select domain → <strong>DNS → Records</strong></li>
                <li>Add each record below</li>
                <li>For CNAME records, set proxy to <strong>DNS only</strong></li>
                <li>If an SPF TXT record exists, merge values rather than creating a duplicate</li>
              </ol>
            </TabsContent>
            <TabsContent value="other" className="mt-3">
              <p className="text-sm text-muted-foreground">Add each DNS record below via your registrar's DNS management panel.</p>
            </TabsContent>
          </Tabs>

          {/* Records table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Type</TableHead>
                <TableHead className="w-40">Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailRecords.map((r, i) => {
                const keys = ["spf", "dkim", "mx", "dmarc"] as const;
                const recordStatus = emailDomain.records[keys[i]].status;
                return (
                  <TableRow key={i}>
                    <TableCell><Badge variant="secondary" className="font-mono text-xs">{r.type}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{r.name}</TableCell>
                    <TableCell className="font-mono text-xs break-all">{r.value}</TableCell>
                    <TableCell>{recordStatusIcon(recordStatus)}</TableCell>
                    <TableCell><CopyBtn text={r.value} field={`email-${emailDomain.domain}-${i}`} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              Once all records are verified, emails from <strong>noreply@{emailDomain.domain}</strong> will be authenticated and deliverable. Notifications, registration confirmations, and league communications will use this domain.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  /* ─── Render ─── */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Domains & Email</h1>
        <p className="text-muted-foreground mt-1">
          Manage your custom site domain and configure email sending for your league.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="domains" className="gap-1.5">
            <Globe className="h-4 w-4" />
            Site Domains
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-4 w-4" />
            Email Domains
          </TabsTrigger>
        </TabsList>

        {/* ── Site Domains Tab ── */}
        <TabsContent value="domains" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connect Custom Domain</CardTitle>
              <CardDescription>
                Point your domain to your league's public site. We'll provide DNS records for GoDaddy, Cloudflare, or any registrar.
              </CardDescription>
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
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Domain
                </Button>
              </div>
            </CardContent>
          </Card>

          {domains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connected Domains</CardTitle>
                <CardDescription>{domains.length} domain{domains.length !== 1 ? "s" : ""} connected</CardDescription>
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
                            ? <Badge variant="default">Secured</Badge>
                            : <Badge variant="secondary">Pending</Badge>
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
                            <Trash2 className="h-3.5 w-3.5" />
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
        </TabsContent>

        {/* ── Email Domains Tab ── */}
        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connect Email Domain</CardTitle>
              <CardDescription>
                Send league emails (notifications, registration confirmations, communications) from your own domain instead of a generic address. We'll generate the SPF, DKIM, MX, and DMARC records you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="emailDomain" className="sr-only">Email Domain</Label>
                  <Input
                    id="emailDomain"
                    placeholder="yourdomain.com"
                    value={newEmailDomain}
                    onChange={e => setNewEmailDomain(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddEmailDomain()}
                  />
                </div>
                <Button onClick={handleAddEmailDomain}>
                  <Mail className="h-4 w-4 mr-2" />
                  Connect Email
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  <strong>Tip:</strong> If you've already connected a site domain above, you can use the same domain for email. We support GoDaddy, Cloudflare, and any DNS provider.
                </span>
              </div>
            </CardContent>
          </Card>

          {emailDomains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Domains</CardTitle>
                <CardDescription>{emailDomains.length} email domain{emailDomains.length !== 1 ? "s" : ""} configured</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sends From</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailDomains.map(d => (
                      <TableRow key={d.domain}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {d.domain}
                          </div>
                        </TableCell>
                        <TableCell>{statusBadge(d.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">noreply@{d.domain}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{d.addedAt}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => setShowEmailDns(showEmailDns === d.domain ? null : d.domain)}>
                            DNS Records
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.success("Verifying DNS records...")}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeEmailDomain(d.domain)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {showEmailDns && (
            <EmailDnsInstructions emailDomain={emailDomains.find(d => d.domain === showEmailDns)!} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
