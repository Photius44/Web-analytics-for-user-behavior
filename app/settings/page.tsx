"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trackingScript } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Settings,
  Copy,
  Check,
  Code,
  Globe,
  Bell,
  Shield,
  Users,
  Zap,
  Loader2,
  UserPlus,
  Trash2,
} from "lucide-react";

type SettingsTab = "tracking" | "details" | "preferences" | "team";

const initialTeam = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", lastActive: "Just now" },
  { id: 2, name: "Sarah Chen", email: "sarah@example.com", role: "Editor", lastActive: "2h ago" },
  { id: 3, name: "Marcus Webb", email: "marcus@example.com", role: "Viewer", lastActive: "1d ago" },
];

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("tracking");
  const [team, setTeam] = useState(initialTeam);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setVerified(false);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setTeam((prev) => [
      ...prev,
      { id: Date.now(), name: inviteEmail.split("@")[0], email: inviteEmail.trim(), role: "Viewer", lastActive: "Just now" },
    ]);
    setInviteEmail("");
    setShowInvite(false);
  };

  const removeTeamMember = (id: number) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Settings className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your analytics configuration and preferences.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-border overflow-x-auto">
              {[
                { id: "tracking" as const, label: "Tracking Implementation" },
                { id: "details" as const, label: "Site Details" },
                { id: "preferences" as const, label: "User Preferences" },
                { id: "team" as const, label: "Team Management" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tracking Tab */}
            {activeTab === "tracking" && (
              <>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">Tracking Script</CardTitle>
                      </div>
                      {/* Pulsing live badge */}
                      <div className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                        </span>
                        <span className="text-xs font-semibold text-success">Recording Data</span>
                      </div>
                    </div>
                    <CardDescription>
                      Add this script to your website to start tracking analytics.
                      Place it in the {"<head>"} section of your HTML.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-secondary p-4 text-sm font-mono text-foreground">
                        <code>{trackingScript}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute right-2 top-2 gap-2 transition-all"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-success" />
                            <span className="text-success">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-4">
                      <h4 className="font-medium mb-2">Installation Instructions</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Copy the tracking script above</li>
                        <li>Paste it in the {"<head>"} section of your website&apos;s HTML</li>
                        <li>Deploy your changes — analytics will start tracking immediately</li>
                        <li>Data typically appears in your dashboard within 5 minutes</li>
                      </ol>
                    </div>
                    <Button
                      className={cn(
                        "w-full gap-2 transition-all",
                        verified
                          ? "bg-success/20 text-success hover:bg-success/30 border border-success/30"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={handleVerify}
                      disabled={verifying}
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : verified ? (
                        <>
                          <Check className="h-4 w-4" />
                          Installation Verified
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Verify Installation
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Domain Settings */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg font-semibold">Domain Settings</CardTitle>
                    </div>
                    <CardDescription>Manage the domains where your tracking script is active.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { domain: "example.com", desc: "Primary domain" },
                        { domain: "app.example.com", desc: "Subdomain" },
                      ].map(({ domain, desc }) => (
                        <div key={domain} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-success/20">
                              <Check className="h-4 w-4 text-success" />
                            </div>
                            <div>
                              <p className="font-medium">{domain}</p>
                              <p className="text-sm text-muted-foreground">{desc}</p>
                            </div>
                          </div>
                          <Badge className="bg-success/20 text-success border-success/30">Active</Badge>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-2">Add Domain</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "details" && (
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>Site Details</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Site details configuration coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "preferences" && (
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>User Preferences</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">User preferences configuration coming soon...</p>
                </CardContent>
              </Card>
            )}

            {/* Team Management Tab */}
            {activeTab === "team" && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Team Management</CardTitle>
                    <CardDescription>Manage who has access to your analytics.</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowInvite((s) => !s)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Inline invite input */}
                  {showInvite && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-3">
                      <Input
                        placeholder="Enter email address..."
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                        className="bg-transparent border-border"
                      />
                      <Button size="sm" onClick={handleInvite} className="shrink-0 bg-primary text-primary-foreground">
                        Send Invite
                      </Button>
                    </div>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        <TableHead className="text-muted-foreground">Email</TableHead>
                        <TableHead className="text-muted-foreground">Role</TableHead>
                        <TableHead className="text-muted-foreground">Last Active</TableHead>
                        <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.map((member) => (
                        <TableRow key={member.id} className="border-border hover:bg-secondary/50">
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">{member.email}</TableCell>
                          <TableCell>
                            <Select defaultValue={member.role}>
                              <SelectTrigger className="h-8 w-28 bg-secondary border-border text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{member.lastActive}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeTeamMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Bell, label: "Email Alerts" },
                  { icon: Shield, label: "Bot Filtering" },
                  { icon: Users, label: "Session Recording" },
                  { icon: Zap, label: "Real-time Updates" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <Badge variant="secondary">On</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">Pro</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Pageviews</span>
                    <span>543K / 1M</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "54%" }} />
                  </div>
                </div>
                <Button variant="outline" className="w-full">Upgrade Plan</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-destructive/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
                  Clear All Data
                </Button>
                <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
