import { Link, useLocation } from "wouter";
import { Users, Calendar, Utensils, Building2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Leave Report", href: "/leaves", icon: Calendar },
  { name: "Meal Expenses", href: "/meals", icon: Utensils },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <Building2 className="text-primary-foreground w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight text-foreground">Deego Textiles</h1>
          <p className="text-xs text-muted-foreground font-medium">HR Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/employees");
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 text-xs text-center text-muted-foreground">
        © {new Date().getFullYear()} Deego Textiles and Manufacturing Pvt. Ltd.
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-display font-bold text-foreground">Deego Textiles</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-border/50 bg-card/50 backdrop-blur-xl shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-[80%] h-full bg-card shadow-2xl animate-in slide-in-from-left-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
