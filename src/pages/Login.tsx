import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[100px] animate-float [animation-delay:3s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/05 blur-[80px]" />
      </div>

      {/* UCU Logo watermark */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{ backgroundImage: "url('/UCU LOGO.png')", backgroundSize: '40%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      />

      <div className="w-full max-w-md animate-slide-up">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/30">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">StudyFinder</h1>
          <p className="mt-1 text-muted-foreground text-sm">Uganda Christian University · Study Platform</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="relative glass rounded-3xl p-8 shadow-2xl shadow-primary/10">
          {/* Decorative shimmer line at top */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome Back</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Sign in to your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Continue your study journey with your peers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@ucu.ac.ug"
                className="h-12 rounded-xl bg-background/60 border-border/60 focus:border-primary focus:ring-primary/20 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-background/60 border-border/60 focus:border-primary focus:ring-primary/20 text-base pr-12"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                Create one here
              </Link>
            </p>
          </div>

          {/* Bottom shimmer line */}
          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent rounded-full" />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          © 2026 StudyFinder · Uganda Christian University
        </p>
      </div>
    </div>
  );
}
