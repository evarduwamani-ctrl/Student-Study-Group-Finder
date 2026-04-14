import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CreateGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    course_name: "",
    course_code: "",
    faculty: "",
    description: "",
    meeting_location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("study_groups")
        .insert({
          ...form,
          leader_id: user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Study group created!");
      navigate(`/groups/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Create Study Group</CardTitle>
            <CardDescription>Set up a new group for your course</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. CSC1202 Study Squad" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course_name">Course Name</Label>
                  <Input id="course_name" value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} required placeholder="Web & Mobile App Dev" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_code">Course Code</Label>
                  <Input id="course_code" value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} placeholder="CSC1202" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Input id="faculty" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="Engineering, Design & Technology" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="What will your group focus on?" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Meeting Location</Label>
                <Input id="location" value={form.meeting_location} onChange={(e) => setForm({ ...form, meeting_location: e.target.value })} placeholder="Library Room 3 or Zoom link" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
