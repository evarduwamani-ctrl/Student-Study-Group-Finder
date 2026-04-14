import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Plus, BookOpen, Shield, ChevronRight, Sparkles, Clock, ArrowRight } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  course_name: string;
  course_code: string | null;
  description: string;
}

interface StudySession {
  id: string;
  title: string;
  session_date: string;
  session_time: string;
  location: string | null;
  study_groups: { name: string } | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<StudySession[]>([]);
  const [recentGroups, setRecentGroups] = useState<StudyGroup[]>([]);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check admin role
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });

    // Fetch profile
    supabase.from("profiles").select("full_name").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
    });

    // Fetch my groups (where I'm a member or leader)
    Promise.all([
      supabase.from("group_members").select("group_id").eq("user_id", user.id),
      supabase.from("study_groups").select("id, name, course_name, course_code, description").eq("leader_id", user.id),
    ]).then(async ([memberships, leaderGroups]) => {
      const memberGroupIds = memberships.data?.map((m) => m.group_id) || [];
      const leaderIds = leaderGroups.data?.map((g) => g.id) || [];
      const allIds = [...new Set([...memberGroupIds, ...leaderIds])];

      if (allIds.length > 0) {
        const { data } = await supabase.from("study_groups").select("id, name, course_name, course_code, description").in("id", allIds);
        setMyGroups(data || []);

        // Upcoming sessions for my groups
        const { data: sessions } = await supabase
          .from("study_sessions")
          .select("id, title, session_date, session_time, location, study_groups(name)")
          .in("group_id", allIds)
          .gte("session_date", new Date().toISOString().split("T")[0])
          .order("session_date", { ascending: true })
          .limit(5);
        setUpcomingSessions((sessions as any) || []);
      }
    });

    // Recent groups
    supabase
      .from("study_groups")
      .select("id, name, course_name, course_code, description")
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setRecentGroups(data || []));
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-8 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Dashboard Overview</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-1">
              Welcome back, <span className="text-gradient">{profile?.full_name || "Student"}</span>
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl">Here's what's happening in your study groups today. Jump back in or find a new group to join.</p>
          </div>
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        </div>

        {isAdmin && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 border border-primary/20 shadow-sm backdrop-blur-sm animate-fade-in transition-all hover:shadow-md hover:border-primary/30 group">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary p-3 text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">Administrator Portal</h2>
                  <p className="text-sm text-muted-foreground hidden sm:block mt-1">Manage users, view system metrics, and oversee the platform.</p>
                </div>
              </div>
              <Link to="/admin" className="w-full sm:w-auto">
                <Button className="gap-2 shadow-sm w-full sm:w-auto group-hover:bg-primary/90 transition-all">
                  Go to Panel <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary/30">
            <CardContent className="flex items-center gap-5 pt-6 pb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative rounded-xl bg-primary/10 p-4 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div className="relative">
                <p className="text-4xl font-display font-bold tracking-tight text-foreground">{myGroups.length}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">My Groups</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-accent/30">
            <CardContent className="flex items-center gap-5 pt-6 pb-6 relative">
               <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative rounded-xl bg-accent/20 p-4 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                <Calendar className="h-7 w-7 text-accent-foreground" />
              </div>
              <div className="relative">
                <p className="text-4xl font-display font-bold tracking-tight text-foreground">{upcomingSessions.length}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Upcoming Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-secondary/30">
            <CardContent className="flex items-center gap-5 pt-6 pb-6 relative">
               <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative rounded-xl bg-secondary p-4 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                <BookOpen className="h-7 w-7 text-secondary-foreground" />
              </div>
              <div className="relative">
                <p className="text-4xl font-display font-bold tracking-tight text-foreground">{recentGroups.length}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">New Groups</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Groups */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">My Study Groups</h2>
            <Link to="/groups/create">
              <Button size="sm" className="gap-2 shadow-sm hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4" /> Create Group
              </Button>
            </Link>
          </div>
          {myGroups.length === 0 ? (
            <Card className="border-dashed border-2 bg-background/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">You haven't joined any groups yet.</p>
                <Link to="/groups">
                  <Button variant="outline" className="mt-4">Browse Groups</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {myGroups.map((group) => (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/30 bg-card overflow-hidden">
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{group.name}</CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all group-hover:text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-3">
                        <Badge variant="secondary" className="px-2 py-1 font-medium bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 transition-colors">
                          {group.course_code || group.course_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{group.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <section className="animate-fade-in relative mt-10">
            <h2 className="mb-5 font-display text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" /> Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="group transition-all duration-300 hover:shadow-md hover:border-primary/20 bg-card overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                  <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 px-6 relative">
                    <div className="rounded-xl bg-primary/10 p-3 shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-colors hidden sm:block">
                      <Calendar className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{session.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{session.study_groups?.name}</span>
                        <span>•</span>
                        <span>{session.session_date}</span>
                        <span>•</span>
                        <span className="font-medium">{session.session_time}</span>
                      </div>
                    </div>
                    {session.location && (
                      <Badge variant="outline" className="sm:ml-auto w-fit bg-background shadow-sm border-border backdrop-blur-sm px-3 py-1 text-sm">
                        📍 {session.location}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recently Created Groups */}
        <section className="pb-8 mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Recently Created Groups</h2>
            <Link to="/groups">
              <Button variant="outline" size="sm" className="gap-2 group hover:bg-primary hover:text-primary-foreground transition-all">
                View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentGroups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 bg-card overflow-hidden relative">
                  <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight line-clamp-1">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col relative z-10 pt-2">
                    <div className="mb-3">
                      <Badge variant="secondary" className="bg-secondary/50 font-medium text-xs">
                        {group.course_code || group.course_name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">{group.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
