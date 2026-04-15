import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Eye, EyeOff, UserPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("1");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          program_of_study: program,
          year_of_study: parseInt(year),
        }).eq("user_id", user.id);
      }
      toast.success("Account created! Check your email to verify.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 py-12">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[100px] animate-float" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[100px] animate-float [animation-delay:2.5s]" />
        <div className="absolute top-1/3 right-1/3 h-[300px] w-[300px] rounded-full bg-primary/05 blur-[70px]" />
      </div>

      {/* UCU Logo watermark */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{ backgroundImage: "url('/UCU LOGO.png')", backgroundSize: '40%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      />

      <div className="w-full max-w-md animate-slide-up">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent/70 shadow-xl shadow-primary/30">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">StudyFinder</h1>
          <p className="mt-1 text-muted-foreground text-sm">Join your campus study community</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="relative glass rounded-3xl p-8 shadow-2xl shadow-primary/10">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-full" />

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">New Account</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Register to find and create study groups</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="h-11 rounded-xl bg-background/60 border-border/60 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-semibold">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@ucu.ac.ug"
                className="h-11 rounded-xl bg-background/60 border-border/60 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  minLength={6}
                  className="h-11 rounded-xl bg-background/60 border-border/60 focus:border-primary focus:ring-primary/20 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program" className="text-sm font-semibold">Program of Study</Label>
              <Input
                id="program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                required
                placeholder="BSc Information Technology"
                className="h-11 rounded-xl bg-background/60 border-border/60 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Year of Study</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-11 rounded-xl bg-background/60 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground/60">
          © 2026 StudyFinder · Uganda Christian University
        </p>
      </div>
    </div>
  );
}
