import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else alert("✅ Logged in!");
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("✅ Check your email to verify account");
  };

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
      </div>
    </div>
  );
}
