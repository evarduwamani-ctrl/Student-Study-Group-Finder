import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, MapPin } from "lucide-react";

interface GroupWithCount {
  id: string;
  name: string;
  course_name: string;
  course_code: string | null;
  faculty: string | null;
  description: string;
  meeting_location: string | null;
  member_count: number;
}

export default function BrowseGroups() {
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [faculties, setFaculties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const { data: groupsData } = await supabase
      .from("study_groups")
      .select("id, name, course_name, course_code, faculty, description, meeting_location")
      .order("created_at", { ascending: false });

    if (groupsData) {
      // Get member counts
      const { data: members } = await supabase.from("group_members").select("group_id");
      const counts: Record<string, number> = {};
      members?.forEach((m) => {
        counts[m.group_id] = (counts[m.group_id] || 0) + 1;
      });

      const enriched = groupsData.map((g) => ({
        ...g,
        member_count: counts[g.id] || 0,
      }));
      setGroups(enriched);

      const uniqueFaculties = [...new Set(groupsData.map((g) => g.faculty).filter(Boolean))] as string[];
      setFaculties(uniqueFaculties);
    }
    setLoading(false);
  };

  const filtered = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.course_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.course_code || "").toLowerCase().includes(search.toLowerCase());
    const matchesFaculty = facultyFilter === "all" || g.faculty === facultyFilter;
    return matchesSearch && matchesFaculty;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold">Browse Study Groups</h1>
          <p className="mt-1 text-muted-foreground">Find a group that matches your courses</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by group name, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Faculties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {faculties.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No groups found. Try a different search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">{group.name}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{group.course_code || group.course_name}</Badge>
                      {group.faculty && <Badge variant="outline">{group.faculty}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {group.member_count} members
                      </span>
                      {group.meeting_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {group.meeting_location}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
