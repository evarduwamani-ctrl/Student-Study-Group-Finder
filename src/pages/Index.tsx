import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Search, ArrowRight, Sparkles, BookOpen } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary/20 selection:text-primary flex flex-col">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl shadow-sm">
        <nav className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20 bg-white flex items-center justify-center p-1">
              <img src="/UCU LOGO.png" alt="UCU Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              StudyFinder
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex text-base font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex-1">
        {/* Full Screen Hero with Logo Background */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20">
          {/* Logo Background with Gradients */}
          <div className="absolute inset-0 overflow-hidden z-0">
            {/* The actual Logo Background */}
            <div 
              className="absolute inset-0 bg-[url('/UCU%20LOGO.png')] bg-center bg-no-repeat opacity-[0.18] dark:opacity-[0.12]"
              style={{ backgroundSize: '70%', backgroundPosition: 'center 40%' }}
            />
            {/* Color Overlay to ensure readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background backdrop-blur-[1px]" />
            
            {/* Soft decorative glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] mix-blend-multiply opacity-50" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] mix-blend-multiply opacity-50" />
          </div>

          <div className="container relative z-10 text-center flex flex-col items-center pt-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8 animate-fade-in shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Uganda Christian University's Platform</span>
            </div>
            
            <h1 className="mx-auto max-w-4xl font-display text-5xl font-extrabold leading-[1.1] sm:text-6xl lg:text-7xl tracking-tight animate-fade-in [animation-delay:150ms]">
              Achieve More With Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-pulse">Study Network</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground/90 font-light leading-relaxed animate-fade-in [animation-delay:300ms]">
              Organize study sessions, find partners, and collaborate easily. Built exclusively for the students of Uganda Christian University.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in [animation-delay:450ms]">
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 gap-2">
                  Create Account <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/groups">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 bg-background/50 backdrop-blur-md hover:bg-muted hover:-translate-y-1 transition-all duration-300">
                  Browse Groups
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Organized Features Section */}
        <section className="relative py-24 bg-card z-10 border-t border-border">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">Clear Tools for Better Grades</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything is structured to help you focus on what really matters—learning.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Users, title: "Create Groups", desc: "Easily set up private or public study groups for your specific class sections." },
                { icon: Search, title: "Find Peers", desc: "Search through the directory to find classmates who share your courses." },
                { icon: Calendar, title: "Schedule", desc: "Plan library meetups or online zoom sessions with built-in calendars." },
                { icon: BookOpen, title: "Share Notes", desc: "Upload and organize course materials safely within your secure group." },
              ].map((f, i) => (
                <div 
                  key={f.title} 
                  className="group relative rounded-3xl border border-border bg-background p-8 hover:-translate-y-2 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <f.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Structured Footer */}
      <footer className="relative py-12 bg-muted/50 border-t border-border mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white p-1 shadow-sm border border-border">
               <img src="/UCU LOGO.png" alt="UCU Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">&copy; 2026 StudyFinder</p>
              <p>Uganda Christian University</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
