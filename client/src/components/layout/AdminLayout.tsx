import { Link, useLocation } from "wouter";
import { LayoutDashboard, LogOut, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Content CMS" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <span className="font-serif text-xl font-bold text-sidebar-foreground">Piliora CMS</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant="ghost" 
                className={`w-full justify-start gap-3 ${location === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-3 mb-2">
              <Home className="h-4 w-4" />
              View Live Site
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 md:hidden">
           <span className="font-serif text-xl font-bold">Piliora Admin</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
