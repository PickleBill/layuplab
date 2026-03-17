import { Outlet, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Dumbbell, Calendar, BarChart3, Video, Trophy } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/train", icon: Dumbbell, label: "Train" },
  { to: "/app/plan", icon: Calendar, label: "Plan" },
  { to: "/app/progress", icon: BarChart3, label: "Progress" },
  { to: "/app/analyze", icon: Video, label: "Analyze" },
  { to: "/app/challenges", icon: Trophy, label: "Challenges" },
];

const AppLayout = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-sidebar flex flex-col fixed inset-y-0 left-0 z-40">
          <div className="p-6 border-b border-border">
            <button onClick={() => navigate("/")} className="font-display font-extrabold text-xl tracking-tight text-foreground">
              LAYUP<span className="text-primary">LAB</span>
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-body text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                activeClassName="bg-primary/10 text-primary font-medium border border-primary/20"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-body">LayupLab v1.0</p>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'pb-20' : ''}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-border z-40 flex justify-around py-2 px-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-muted-foreground transition-colors"
              activeClassName="text-primary"
            >
              <item.icon size={20} />
              <span className="text-[10px] font-body">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
