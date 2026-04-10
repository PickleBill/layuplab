import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Returning user → go to dashboard; new user → onboarding
        navigate("/app/dashboard");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/app/dashboard");
    });
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || 'Player' },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email! 📧",
          description: "We sent you a confirmation link. Click it to activate your account.",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const handleAppleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground">
            LAYUP<span className="text-primary">LAB</span>
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            {isLogin ? "Welcome back, baller." : "Create your account."}
          </p>
        </div>

        {/* SSO Buttons */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full gap-2 font-body" onClick={handleGoogleLogin}>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full gap-2 font-body" onClick={handleAppleLogin}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continue with Apple
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground font-body">or</span></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {!isLogin && (
            <div>
              <Label className="text-xs font-body text-muted-foreground">Username</Label>
              <div className="relative mt-1">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your name" className="pl-9 font-body" />
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs font-body text-muted-foreground">Email</Label>
            <div className="relative mt-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="pl-9 font-body" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-body text-muted-foreground">Password</Label>
            <div className="relative mt-1">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-9 font-body" />
            </div>
          </div>
          <Button type="submit" variant="hero" className="w-full gap-1" disabled={loading}>
            {loading ? "..." : isLogin ? "Sign In" : "Create Account"} <ArrowRight size={14} />
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-body">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-bold">
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Auth;
