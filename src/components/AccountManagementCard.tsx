// src/components/AccountManagementCard.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AccountManagementCard() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // get current user on mount
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("supabase getUser error:", error);
          return;
        }
        setEmail(data?.user?.email ?? null);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();

    // listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSendMagicLink = async () => {
    if (!emailInput) {
      toast?.({ title: "Error", description: "Please enter an email", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email: emailInput });
      setLoading(false);
      if (error) {
        toast?.({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast?.({ title: "Check your email", description: "Sent a magic link to sign in" });
      setEmailInput("");
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast?.({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    toast?.({ title: "Signed out" });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-card-foreground">Email Access</Label>
        <Input
          value={email ?? ""}
          placeholder="Not signed in"
          disabled
          className="bg-input border-border text-foreground"
        />
        <p className="text-sm text-muted-foreground">
          {email ? "Connected with Supabase auth" : "Sign in with a magic link"}
        </p>
      </div>

      {!email ? (
        <div className="flex gap-2">
          <Input
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="bg-input border-border text-foreground"
          />
          <Button onClick={handleSendMagicLink} disabled={loading}>
            {loading ? "Sending..." : "Send Link"}
          </Button>
        </div>
      ) : (
        <Button variant="destructive" onClick={handleSignOut}>
          <Shield className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      )}
    </div>
  );
}
