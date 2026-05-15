"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Wallet } from "lucide-react";
import { NeoButton, NeoInput, NeoCard } from "@/components/neo-ui";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { isStrongPassword, isValidEmail } from "@/lib/validation";
import { strings } from "@/locales/en";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const nextErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      nextErrors.name = strings.auth.signup.errors.nameMissing;
    }

    if (!email.trim()) {
      nextErrors.email = strings.auth.signup.errors.emailMissing;
    } else if (!isValidEmail(email)) {
      nextErrors.email = strings.auth.signup.errors.emailInvalid;
    }

    if (!password) {
      nextErrors.password = strings.auth.signup.errors.passwordMissing;
    } else if (!isStrongPassword(password)) {
      nextErrors.password = strings.auth.signup.errors.passwordWeak;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = strings.auth.signup.errors.confirmMissing;
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = strings.auth.signup.errors.confirmMismatch;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    setLoading(true);

    try {
      const success = await signup(name, email, password);
      if (success) {
        toast({
          title: strings.auth.signup.toasts.successTitle,
          description: strings.auth.signup.toasts.successDescription,
        });
        router.push("/dashboard");
      } else {
        const message = strings.auth.signup.toasts.failMessage;
        setError(message);
        toast({
          title: strings.auth.signup.toasts.failTitle,
          description: message,
          variant: "destructive",
        });
      }
    } catch (caughtError) {
      const message = getErrorMessage(
        caughtError,
        strings.auth.signup.toasts.glitchFallback,
      );
      setError(message);
      toast({
        title: strings.auth.signup.toasts.failTitle,
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 neo-page">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary border-2 border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] neo-float">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold">{strings.app.name}</h1>
        </div>
        <p className="text-gray-600">{strings.auth.signup.logoTagline}</p>
      </div>

      {/* Signup Card */}
      <NeoCard className="w-full max-w-md p-6 neo-pop" shadow="lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {strings.auth.signup.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive border-2 border-black rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.auth.signup.nameLabel}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <NeoInput
                type="text"
                placeholder={strings.auth.signup.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
                aria-invalid={!!errors.name}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.auth.signup.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <NeoInput
                type="email"
                placeholder={strings.auth.signup.emailPlaceholder}
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
            <label className="text-sm font-medium">
              {strings.auth.signup.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <NeoInput
                type="password"
                placeholder={strings.auth.signup.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
                title={strings.common.passwordHint}
                aria-invalid={!!errors.password}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.auth.signup.confirmPasswordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <NeoInput
                type="password"
                placeholder={strings.auth.signup.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                minLength={8}
                aria-invalid={!!errors.confirmPassword}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          <NeoButton
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading
              ? strings.auth.signup.submitLoading
              : strings.auth.signup.submit}
          </NeoButton>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-black text-center">
          <p className="text-sm text-gray-600">
            {strings.auth.signup.switchPrompt}{" "}
            <Link href="/login" className="font-bold hover:underline">
              {strings.auth.signup.switchCta}
            </Link>
          </p>
        </div>
      </NeoCard>
    </div>
  );
}
