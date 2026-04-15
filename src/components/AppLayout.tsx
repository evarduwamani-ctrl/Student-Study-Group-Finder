import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, Search, Plus, User, LogOut, Shield, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        setIsAdmin(!!data);
      });
    }
  }, [user]);

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/groups", icon: Search, label: "Browse Groups" },
    { to: "/groups/create", icon: Plus, label: "Create Group" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen">
      {/* Premium Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 sticky top-0 h-screen z-40 overflow-hidden">
        {/* Sidebar gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/95 via-foreground/90 to-foreground/85 backdrop-blur-xl" />
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 h-48 w-48 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-48 w-48 bg-accent/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
        {/* Subtle shimmer border on right */}
        <div className="absolute right-0 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <div className="relative flex flex-col h-full p-5">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 px-2 py-4 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md group-hover:blur-lg transition-all" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent/80 shadow-lg shadow-primary/40 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-display text-xl font-bold text-white tracking-tight block leading-tight">StudyFinder</span>
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">UCU Platform</span>
            </div>
          </Link>

          {/* Nav label */}
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Navigation</p>

          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <div className={`
                  group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer
                  ${isActive(item.to)
                    ? 'bg-white/15 shadow-inner text-white'
                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'}
                `}>
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                    ${isActive(item.to)
                      ? 'bg-primary/80 shadow-md shadow-primary/40'
                      : 'bg-white/5 group-hover:bg-white/10'}
                  `}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium tracking-wide flex-1">{item.label}</span>
                  {isActive(item.to) && (
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  )}
                </div>
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="my-3 mx-3 h-px bg-white/10" />
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Administration</p>
                <Link to="/admin">
                  <div className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer
                    ${isActive("/admin")
                      ? 'bg-primary/25 shadow-inner text-white border border-primary/30'
                      : 'text-white/60 hover:bg-primary/15 hover:text-white/90'}
                  `}>
                    <div className={`
                      flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                      ${isActive("/admin")
                        ? 'bg-primary shadow-md shadow-primary/50'
                        : 'bg-primary/20 group-hover:bg-primary/40'}
                    `}>
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium tracking-wide flex-1">Admin Portal</span>
                    {isActive("/admin") && <ChevronRight className="h-3 w-3 opacity-50" />}
                  </div>
                </Link>
              </>
            )}
          </nav>

          {/* Bottom section */}
          <div className="pt-4 mt-4 border-t border-white/10">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
                {user?.email?.[0] ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white/80 truncate">{user?.email}</p>
                <p className="text-[10px] text-white/40">{isAdmin ? "System Administrator" : "Student"}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}
        <header className="md:hidden sticky top-0 z-50 border-b border-border/30 backdrop-blur-xl bg-foreground/85 shadow-lg">
          <div className="container flex h-16 items-center justify-between px-4">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent/70 shadow-md">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">StudyFinder</span>
            </Link>
            <div className="flex items-center gap-1">
              {navItems.slice(0, 3).map((item) => (
                <Link key={item.to} to={item.to}>
                  <button className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all ${isActive(item.to) ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}>
                    <item.icon className="h-4 w-4" />
                  </button>
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
