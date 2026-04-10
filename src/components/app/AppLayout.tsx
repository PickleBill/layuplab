import { Outlet, useNavigate } from "react-router-dom";
import TrialBanner from "@/components/app/TrialBanner";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Dumbbell, BookOpen, Calendar, BarChart3, Video, Trophy, Users, MessageCircle, X, Send, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import XpBar from "@/components/app/XpBar";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { getCoachStyle, getProfile, hasDetailedProfile, saveProfile, savePlan } from "@/lib/storage";
import { pushLocalDataToCloud, pullCloudDataToLocal } from "@/lib/cloud-sync";
import { generateWeeklyPlan } from "@/lib/plan-generator";
import { useToast } from "@/hooks/use-toast";
import { CoachStyle, Goal, Equipment, DayOfWeek } from "@/types/app";

const navItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/train", icon: Dumbbell, label: "Train" },
  { to: "/app/drills", icon: BookOpen, label: "Drills" },
  { to: "/app/plan", icon: Calendar, label: "Plan" },
  { to: "/app/progress", icon: BarChart3, label: "Progress" },
  { to: "/app/analyze", icon: Video, label: "Analyze" },
  { to: "/app/challenges", icon: Trophy, label: "Challenges" },
  { to: "/app/leaderboard", icon: Users, label: "Ranks" },
];

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

const COACHES: { id: CoachStyle; name: string; emoji: string }[] = [
  { id: 'mamba', name: 'Marcus', emoji: '🔥' },
  { id: 'queen', name: 'Aaliyah', emoji: '👑' },
  { id: 'chef', name: 'Jordan', emoji: '🍳' },
  { id: 'big_t', name: 'Tanya', emoji: '🎙️' },
  { id: 'zen', name: 'Maya', emoji: '🧘' },
];

const AppLayout = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCoach, setActiveCoach] = useState<CoachStyle>(getCoachStyle());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const hasSynced = useRef(false);

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth", { replace: true });
      } else {
        setAuthReady(true);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  // Sync data with cloud on mount (once)
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Push local data to cloud, then pull cloud data to local (cloud wins for conflicts)
        pushLocalDataToCloud().then(() => pullCloudDataToLocal()).catch(console.error);
      }
    });
  }, []);

  // Coach chat is available via the floating button — no auto-open

  const parseProfileUpdate = (text: string) => {
    const match = text.match(/\[PROFILE_UPDATE\]([\s\S]*?)\[\/PROFILE_UPDATE\]/);
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch { return null; }
  };

  const applyProfileUpdate = (update: any) => {
    const profile = getProfile();
    if (!profile) return;

    const validGoals: Goal[] = ['shooting', 'ball_handling', 'speed_agility', 'conditioning', 'overall'];
    const validEquipment: Equipment[] = ['hoop', 'cones', 'resistance_band', 'jump_rope', 'none'];
    const validDays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    if (update.goals) profile.goals = update.goals.filter((g: string) => validGoals.includes(g as Goal));
    if (update.equipment) profile.equipment = update.equipment.filter((e: string) => validEquipment.includes(e as Equipment));
    if (update.trainingDays) {
      profile.trainingDays = update.trainingDays.filter((d: string) => validDays.includes(d as DayOfWeek));
      profile.daysPerWeek = profile.trainingDays!.length;
    }
    if (update.sessionLength && [30, 45, 60].includes(update.sessionLength)) {
      profile.sessionLength = update.sessionLength;
    }

    saveProfile(profile);
    const plan = generateWeeklyPlan(profile);
    savePlan(plan);
    toast({ title: "Plan updated! 🏀", description: "Your coach customized your training plan." });
  };

  const streamCoachResponse = async (allMessages: Msg[], isNewUser = false, playerName = '') => {
    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          coachStyle: activeCoach,
          isNewUser,
          playerName,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast({ title: "Coach unavailable", description: err.error || "Try again later.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Check for profile update in the full response
      const profileUpdate = parseProfileUpdate(assistantSoFar);
      if (profileUpdate) {
        applyProfileUpdate(profileUpdate);
        // Clean the display text
        const cleanText = assistantSoFar.replace(/\[PROFILE_UPDATE\][\s\S]*?\[\/PROFILE_UPDATE\]/, '').trim();
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 && m.role === 'assistant' ? { ...m, content: cleanText } : m));
      }
    } catch (e) {
      console.error("Coach chat error:", e);
      toast({ title: "Connection error", description: "Could not reach the coach.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const allMessages = [...messages, userMsg];
    await streamCoachResponse(allMessages);
  };

  const switchCoach = (coach: CoachStyle) => {
    setActiveCoach(coach);
    setMessages([]);
    const profile = getProfile();
    if (profile) {
      profile.coachStyle = coach;
      saveProfile(profile);
    }
  };

  const currentCoach = COACHES.find(c => c.id === activeCoach) || COACHES[0];

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
        <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-body">LayupLab v2.0</p>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'pb-20' : ''}`}>
        <XpBar />
        <div className="px-4 pt-2">
          <TrialBanner />
        </div>
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

      {/* Floating Ask Coach Button */}
      {!chatOpen && (
        <button
          data-coach-btn
          onClick={() => setChatOpen(true)}
          className={`fixed z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform ${
            isMobile ? 'bottom-24 right-4' : 'bottom-6 right-6'
          }`}
          style={{ boxShadow: '0 4px 20px hsla(var(--primary) / 0.4)' }}
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Drawer */}
      {chatOpen && (
        <div className={`fixed z-50 bg-card border border-border rounded-lg shadow-2xl flex flex-col ${
          isMobile ? 'inset-2 bottom-20' : 'bottom-6 right-6 w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentCoach.emoji}</span>
              <div>
                <p className="font-display font-bold text-sm text-foreground">{currentCoach.name}</p>
                <p className="text-[10px] text-muted-foreground font-body">AI Coach</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Coach selector */}
              {COACHES.map(c => (
                <button
                  key={c.id}
                  onClick={() => switchCoach(c.id)}
                  className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                    activeCoach === c.id ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'
                  }`}
                  title={c.name}
                >
                  {c.emoji}
                </button>
              ))}
              <button onClick={() => setChatOpen(false)} className="ml-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">{currentCoach.emoji}</span>
                <p className="font-display font-bold text-sm text-foreground">Ask {currentCoach.name} anything</p>
                <p className="text-xs text-muted-foreground font-body mt-1">"How do I improve my crossover?" or "What should I work on today?"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm font-body ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground font-body">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form
              className="flex gap-2"
              onSubmit={e => { e.preventDefault(); sendMessage(); }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Ask ${currentCoach.name}...`}
                className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <Button type="submit" variant="hero" size="sm" disabled={isLoading || !input.trim()}>
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
