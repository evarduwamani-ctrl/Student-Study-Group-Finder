import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, Search, Plus, User, LogOut, Shield } from "lucide-react";
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Standard Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/60 backdrop-blur-md sticky top-0 h-screen p-4 shadow-[2px_0_15px_rgb(0,0,0,0.03)] z-40">
        <Link to="/dashboard" className="flex items-center gap-3 px-2 py-4 mb-6 group">
          <div className="rounded-xl bg-primary/10 p-2 group-hover:bg-primary transition-colors">
            <BookOpen className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground tracking-tight">StudyFinder</span>
        </Link>
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname === item.to ? "default" : "ghost"}
                className={`w-full justify-start gap-3 rounded-xl h-11 transition-all ${location.pathname !== item.to ? 'hover:bg-primary/5 hover:text-primary' : 'shadow-sm'}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin">
              <Button variant={location.pathname === "/admin" ? "default" : "ghost"} className={`w-full justify-start gap-3 rounded-xl h-11 transition-all ${location.pathname !== "/admin" ? 'hover:bg-primary/5 hover:text-primary' : 'shadow-sm'}`}>
                <Shield className="h-5 w-5" />
                Admin Portal
              </Button>
            </Link>
          )}
        </nav>
        <div className="pt-4 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-11 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}
        <header className="md:hidden sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">StudyFinder</span>
            </Link>
            {/* Mobile nav */}
            <div className="flex items-center gap-1">
              {navItems.slice(0, 3).map((item) => (
                <Link key={item.to} to={item.to}>
                  <Button variant={location.pathname === item.to ? "default" : "ghost"} size="icon" className="h-9 w-9 rounded-full">
                    <item.icon className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
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
