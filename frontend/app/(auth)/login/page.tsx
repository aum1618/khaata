"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Wallet } from "lucide-react";
import { NeoButton, NeoInput, NeoCard } from "@/components/neo-ui";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { isValidEmail } from "@/lib/validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = "Email is missing";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "That email looks off";
    }

    if (!password) {
      nextErrors.password = "Password is missing";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "You are in",
          description: "Welcome back, you legend.",
        });
        router.push("/dashboard");
      } else {
        const message = "Email or password looks wrong";
        setError(message);
        toast({
          title: "Login flopped",
          description: message,
          variant: "destructive",
        });
      }
    } catch (caughtError) {
      const message = getErrorMessage(
        caughtError,
        "Something glitched. Try again.",
      );
      setError(message);
      toast({
        title: "Login flopped",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF0] flex flex-col items-center justify-center p-4 neo-page">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#A6FAFF] border-2 border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] neo-float">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold">Khaata</h1>
        </div>
        <p className="text-gray-600">Split bills with friends, no drama</p>
      </div>

      {/* Login Card */}
      <NeoCard className="w-full max-w-md p-6 neo-pop" shadow="lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Back again?</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#FF6B6B] border-2 border-black rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <NeoInput
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <NeoInput
                type="password"
                placeholder="Your secret code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
                aria-invalid={!!errors.password}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          <NeoButton
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Letting you in..." : "Log in"}
          </NeoButton>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-black text-center">
          <p className="text-sm text-gray-600">
            {"New here? "}
            <Link href="/signup" className="font-bold hover:underline">
              Join up
            </Link>
          </p>
        </div>
      </NeoCard>
    </div>
  );
}
