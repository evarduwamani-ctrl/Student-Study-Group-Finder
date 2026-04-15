import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, TrendingUp, Shield, Trash2, ShieldAlert } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type UserProfile = {
  id: string; // from profiles.id
  user_id: string;
  full_name: string;
  program_of_study: string;
  year_of_study: number;
  role: string;
  created_at: string;
};

type GroupData = {
  id: string;
  name: string;
  course_code: string | null;
  course_name: string;
  created_at: string;
  leader_name: string;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  const [stats, setStats] = useState({ users: 0, groups: 0, topCourses: [] as { course_name: string; count: number }[] });
  
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [groupsList, setGroupsList] = useState<GroupData[]>([]);
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) {
        loadStats();
        loadUsers();
        loadGroups();
      }
    });
  }, [user]);

  const loadStats = async () => {
    const [{ count: userCount }, { count: groupCount }, { data: groups }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("study_groups").select("*", { count: "exact", head: true }),
      supabase.from("study_groups").select("course_name"),
    ]);

    const courseCounts: Record<string, number> = {};
    groups?.forEach((g) => {
      courseCounts[g.course_name] = (courseCounts[g.course_name] || 0) + 1;
    });
    const topCourses = Object.entries(courseCounts)
      .map(([course_name, count]) => ({ course_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({ users: userCount || 0, groups: groupCount || 0, topCourses });
  };

  const loadUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    
    if (profiles) {
      const merged: UserProfile[] = profiles.map(p => {
        const userRole = roles?.find(r => r.user_id === p.user_id)?.role || "user";
        return {
          id: p.id,
          user_id: p.user_id,
          full_name: p.full_name,
          program_of_study: p.program_of_study,
          year_of_study: p.year_of_study,
          created_at: p.created_at,
          role: userRole
        };
      });
      setUsersList(merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  };

  const loadGroups = async () => {
    const { data: groups } = await supabase.from("study_groups").select("*");
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
    
    if (groups) {
      const merged: GroupData[] = groups.map(g => {
        const leader = profiles?.find(p => p.user_id === g.leader_id);
        return {
          id: g.id,
          name: g.name,
          course_code: g.course_code,
          course_name: g.course_name,
          created_at: g.created_at,
          leader_name: leader?.full_name || "Unknown"
        };
      });
      setGroupsList(merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    setLoadingAction(userId);
    try {
      if (currentRole === "admin") {
        // Demote to user
        const { error } = await supabase.from("user_roles").update({ role: "user" }).eq("user_id", userId);
        if (error && error.code !== "PGRST116") { // If no row exists, inserting is handled by triggers usually
           await supabase.from("user_roles").insert({ user_id: userId, role: "user" });
        }
      } else {
        // Promote to admin
        const { data, error } = await supabase.from("user_roles").select("id").eq("user_id", userId).single();
        if (data) {
          await supabase.from("user_roles").update({ role: "admin" }).eq("user_id", userId);
        } else {
          await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        }
      }
      
      toast({ title: "Success", description: "User role updated successfully." });
      await loadUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to update user role", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this study group? This action cannot be undone.")) return;
    
    setLoadingAction(groupId);
    try {
      const { error } = await supabase.from("study_groups").delete().eq("id", groupId);
      if (error) throw error;
      toast({ title: "Group Deleted", description: "The study group has been removed." });
      await loadGroups();
      await loadStats();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to delete group", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  if (isAdmin === null) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      {/* Background Image - clearly visible */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/admin-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.45,
        }}
        aria-hidden="true"
      />
      {/* Subtle overlay for readability */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-background/40" aria-hidden="true" />
      
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-3 border-b pb-4 border-border/50">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">System Administrator</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage users, oversee groups, and monitor system activities.</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md h-12 glass border border-white/40 p-1 shadow-md">
            <TabsTrigger value="overview" className="rounded-lg font-semibold">Overview</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg font-semibold">Users</TabsTrigger>
            <TabsTrigger value="groups" className="rounded-lg font-semibold">Study Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="glass rounded-2xl border border-white/40 hover:border-primary/40 transition-all shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5">
                <div className="flex items-center gap-4 p-6">
                  <div className="rounded-xl bg-primary/15 p-3 shadow-inner border border-primary/20">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold">{stats.users}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </div>
              <div className="glass rounded-2xl border border-white/40 hover:border-accent/40 transition-all shadow-sm hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5">
                <div className="flex items-center gap-4 p-6">
                  <div className="rounded-xl bg-accent/20 p-3 shadow-inner border border-accent/20">
                    <BookOpen className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold">{stats.groups}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Active Groups</p>
                  </div>
                </div>
              </div>
              <Card className="glass border border-white/40 sm:col-span-2 lg:col-span-1 shadow-sm">
                <CardHeader className="pb-2 pt-5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Active Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.topCourses.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No data yet.</p>
                  ) : (
                    <div className="space-y-3 mt-1">
                      {stats.topCourses.map((c, i) => (
                        <div key={c.course_name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-background shadow-sm text-xs font-bold text-muted-foreground border">
                              {i + 1}
                            </span>
                            <span className="font-medium line-clamp-1">{c.course_name}</span>
                          </div>
                          <span className="text-muted-foreground whitespace-nowrap ml-2"><span className="font-medium text-foreground">{c.count}</span> grps</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="glass border border-white/40 shadow-md overflow-hidden flex flex-col">
              <CardHeader className="bg-white/10 border-b border-white/20 py-4">
                <CardTitle className="text-lg">User Profiles Directory</CardTitle>
                <CardDescription>View all registered users and manage their access roles.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>Program Base</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Role Status</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                        </TableRow>
                      )}
                      {usersList.map((usr) => (
                        <TableRow key={usr.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-medium">{usr.full_name}</TableCell>
                          <TableCell>{usr.program_of_study}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal text-xs">{usr.year_of_study}</Badge>
                          </TableCell>
                          <TableCell>
                            {usr.role === "admin" ? (
                              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 gap-1 border-primary/20">
                                <ShieldAlert className="h-3 w-3" /> Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="font-normal bg-secondary/40 text-secondary-foreground">
                                Member
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(usr.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={loadingAction === usr.user_id || usr.user_id === user?.id}
                              onClick={() => handleToggleAdmin(usr.user_id, usr.role)}
                              className="text-xs h-8"
                            >
                              {usr.role === "admin" ? "Demote" : "Make Admin"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card className="glass border border-white/40 shadow-md overflow-hidden flex flex-col">
              <CardHeader className="bg-white/10 border-b border-white/20 py-4">
                <CardTitle className="text-lg">Study Groups Monitor</CardTitle>
                <CardDescription>Oversee all active study groups within the platform.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Course Target</TableHead>
                        <TableHead>Leader</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead className="text-right">Admin Control</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupsList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No groups found.</TableCell>
                        </TableRow>
                      )}
                      {groupsList.map((grp) => (
                        <TableRow key={grp.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-medium whitespace-nowrap">{grp.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {grp.course_code && <span className="text-xs text-muted-foreground">{grp.course_code}</span>}
                              <span className="text-sm line-clamp-1">{grp.course_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{grp.leader_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(grp.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={loadingAction === grp.id}
                              onClick={() => handleDeleteGroup(grp.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

