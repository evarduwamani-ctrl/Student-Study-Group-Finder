import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, Calendar, MapPin, MessageSquare, UserPlus, UserMinus, Plus, Send, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Group {
  id: string;
  name: string;
  course_name: string;
  course_code: string | null;
  faculty: string | null;
  description: string;
  meeting_location: string | null;
  leader_id: string;
}

interface Member {
  user_id: string;
  joined_at: string;
  profile: { full_name: string; program_of_study: string } | null;
}

interface Session {
  id: string;
  title: string;
  description: string | null;
  session_date: string;
  session_time: string;
  location: string | null;
  meeting_link: string | null;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: { full_name: string } | null;
}

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [sessionForm, setSessionForm] = useState({ title: "", description: "", session_date: "", session_time: "", location: "", meeting_link: "" });
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadGroup();
  }, [id]);

  const loadGroup = async () => {
    if (!id || !user) return;

    const { data: g } = await supabase.from("study_groups").select("*").eq("id", id).single();
    if (g) {
      setGroup(g);
      setIsLeader(g.leader_id === user.id);
    }

    // Members with profiles
    const { data: membersData } = await supabase
      .from("group_members")
      .select("user_id, joined_at")
      .eq("group_id", id);

    if (membersData) {
      const userIds = membersData.map((m) => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, program_of_study").in("user_id", userIds.length > 0 ? userIds : ["none"]);
      
      const enriched = membersData.map((m) => ({
        ...m,
        profile: profiles?.find((p) => p.user_id === m.user_id) || null,
      }));
      setMembers(enriched);
      setIsMember(userIds.includes(user.id) || g?.leader_id === user.id);
    }

    // Sessions
    const { data: sessionsData } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("group_id", id)
      .order("session_date", { ascending: true });
    setSessions(sessionsData || []);

    // Posts with profiles
    const { data: postsData } = await supabase
      .from("group_posts")
      .select("id, content, created_at, user_id")
      .eq("group_id", id)
      .order("created_at", { ascending: false });

    if (postsData) {
      const postUserIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: postProfiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", postUserIds.length > 0 ? postUserIds : ["none"]);
      
      const enrichedPosts = postsData.map((p) => ({
        ...p,
        profile: postProfiles?.find((pr) => pr.user_id === p.user_id) || null,
      }));
      setPosts(enrichedPosts);
    }

    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user || !id) return;
    const { error } = await supabase.from("group_members").insert({ group_id: id, user_id: user.id });
    if (error) {
      toast.error("Failed to join group");
    } else {
      toast.success("Joined the group!");
      loadGroup();
    }
  };

  const handleLeave = async () => {
    if (!user || !id) return;
    await supabase.from("group_members").delete().eq("group_id", id).eq("user_id", user.id);
    toast.success("Left the group");
    loadGroup();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    await supabase.from("group_members").delete().eq("group_id", id).eq("user_id", userId);
    toast.success("Member removed");
    loadGroup();
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    const { error } = await supabase.from("study_sessions").insert({
      ...sessionForm,
      group_id: id,
      created_by: user.id,
    });
    if (error) {
      toast.error("Failed to create session");
    } else {
      toast.success("Session created!");
      setShowSessionDialog(false);
      setSessionForm({ title: "", description: "", session_date: "", session_time: "", location: "", meeting_link: "" });
      loadGroup();
    }
  };

  const handlePostSubmit = async () => {
    if (!user || !id || !newPost.trim()) return;
    const { error } = await supabase.from("group_posts").insert({
      group_id: id,
      user_id: user.id,
      content: newPost.trim(),
    });
    if (error) {
      toast.error("Failed to post. Make sure you're a member.");
    } else {
      setNewPost("");
      loadGroup();
    }
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from("group_posts").delete().eq("id", postId);
    loadGroup();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Group not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">{group.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{group.course_code || group.course_name}</Badge>
              {group.faculty && <Badge variant="outline">{group.faculty}</Badge>}
              {isLeader && <Badge variant="secondary">Leader</Badge>}
            </div>
            <p className="mt-3 text-muted-foreground">{group.description}</p>
            {group.meeting_location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {group.meeting_location}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!isMember && !isLeader && (
              <Button onClick={handleJoin} className="gap-2">
                <UserPlus className="h-4 w-4" /> Join Group
              </Button>
            )}
            {isMember && !isLeader && (
              <Button variant="outline" onClick={handleLeave} className="gap-2">
                <UserMinus className="h-4 w-4" /> Leave Group
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="discussion">
          <TabsList>
            <TabsTrigger value="discussion" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Discussion
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="h-4 w-4" /> Sessions
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" /> Members ({members.length + 1})
            </TabsTrigger>
          </TabsList>

          {/* Discussion */}
          <TabsContent value="discussion" className="space-y-4">
            {isMember && (
              <Card>
                <CardContent className="flex gap-2 pt-4">
                  <Textarea
                    placeholder="Share something with the group..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handlePostSubmit} disabled={!newPost.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No posts yet. Be the first to share!
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{post.profile?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("en-UG", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {post.user_id === user?.id && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 text-sm">{post.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Sessions */}
          <TabsContent value="sessions" className="space-y-4">
            {isLeader && (
              <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Schedule Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Schedule Study Session</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} required placeholder="e.g. Exam Revision" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={sessionForm.description} onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} placeholder="What will you cover?" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={sessionForm.session_date} onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="time" value={sessionForm.session_time} onChange={(e) => setSessionForm({ ...sessionForm, session_time: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={sessionForm.location} onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })} placeholder="Library Room 3" />
                    </div>
                    <div className="space-y-2">
                      <Label>Meeting Link</Label>
                      <Input value={sessionForm.meeting_link} onChange={(e) => setSessionForm({ ...sessionForm, meeting_link: e.target.value })} placeholder="https://zoom.us/..." />
                    </div>
                    <Button type="submit" className="w-full">Create Session</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No sessions scheduled yet.
                </CardContent>
              </Card>
            ) : (
              sessions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        {s.description && <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>}
                      </div>
                      <Badge variant="outline">
                        {s.session_date} · {s.session_time}
                      </Badge>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      {s.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {s.location}
                        </span>
                      )}
                      {s.meeting_link && (
                        <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Join Online
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Members */}
          <TabsContent value="members" className="space-y-3">
            {/* Leader */}
            <Card>
              <CardContent className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-medium">Group Leader</p>
                  <p className="text-sm text-muted-foreground">Creator & manager</p>
                </div>
                <Badge>Leader</Badge>
              </CardContent>
            </Card>
            {members.map((m) => (
              <Card key={m.user_id}>
                <CardContent className="flex items-center justify-between pt-4">
                  <div>
                    <p className="font-medium">{m.profile?.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{m.profile?.program_of_study || ""}</p>
                  </div>
                  {isLeader && m.user_id !== user?.id && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveMember(m.user_id)}>
                      Remove
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
