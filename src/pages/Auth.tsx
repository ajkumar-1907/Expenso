import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Preloader from "@/components/PreLoader";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Check your email to verify account.");
    }
    setLoading(false);
  };

  // show preloader while request is processing
  if (loading) return <Preloader />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white">
      <h1 className="text-2xl font-bold mb-6">Welcome to ExpenseTracker</h1>

      <div className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-card text-white"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-card text-white"
        />

        <Button onClick={handleLogin} className="w-full">
          Login
        </Button>
        <Button onClick={handleSignup} variant="outline" className="w-full">
          Sign Up
        </Button>

        {/* message (error or success) */}
        {message && (
          <p className="text-center text-sm mt-2 text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
