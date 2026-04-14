import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ users: 0, groups: 0, topCourses: [] as { course_name: string; count: number }[] });

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) loadStats();
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
      <div className="space-y-6 animate-fade-in">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.users}</p>
                <p className="text-sm text-muted-foreground">Registered Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-accent/20 p-3">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.groups}</p>
                <p className="text-sm text-muted-foreground">Study Groups</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Most Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCourses.length === 0 ? (
              <p className="text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.topCourses.map((c, i) => (
                  <div key={c.course_name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="font-medium">{c.course_name}</span>
                    </div>
                    <span className="text-muted-foreground">{c.count} groups</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
