"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Users, Receipt, Sparkles, ArrowRight } from "lucide-react";
import { NeoButton, NeoCard } from "@/components/neo-ui";
import { AuthProvider, useAuth } from "@/lib/auth-context";

function LandingContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEF0]">
        Loading the vibe...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFEF0] text-black neo-page">
      <div className="relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#A6FAFF] border-2 border-black rounded-full opacity-60" />
        <div className="absolute top-32 -right-16 w-60 h-60 bg-[#FFA6F6] border-2 border-black rounded-full opacity-50" />
        <div className="absolute bottom-10 left-1/2 w-40 h-40 bg-[#B8FF9F] border-2 border-black rotate-12 opacity-60" />

        <header className="relative z-10 px-6 pt-8 pb-6 md:px-12">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#A6FAFF] border-2 border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] neo-float">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xl font-bold">Khaata</p>
                <p className="text-xs text-gray-600">
                  Split bills without drama
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="font-medium hover:underline">
                Log in
              </Link>
              <NeoButton
                variant="secondary"
                size="sm"
                onClick={() => router.push("/signup")}
              >
                Get started
              </NeoButton>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-6 pb-16 md:px-12">
          <section className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  New: clean settle-up flow
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Bills split fast.{" "}
                <span className="bg-[#B8FF9F] px-2 border-2 border-black">
                  Friendships safe.
                </span>
              </h1>
              <p className="text-lg text-gray-700 max-w-xl">
                Khaata keeps your squad in sync with instant balances, smart
                reminders, and a dashboard that feels like a vibe check.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <NeoButton size="lg" onClick={() => router.push("/signup")}>
                  Start splitting
                  <ArrowRight className="w-4 h-4" />
                </NeoButton>
                <NeoButton
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push("/login")}
                >
                  I already have an account
                </NeoButton>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FFC29F] border-2 border-black rounded-full" />
                  No spreadsheets
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#A6FAFF] border-2 border-black rounded-full" />
                  Real-time balances
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FFA6F6] border-2 border-black rounded-full" />
                  Settle up in minutes
                </div>
              </div>
            </div>

            <NeoCard className="p-6 bg-white/90" shadow="lg">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tonight's dinner</p>
                    <p className="text-3xl font-bold">$64.20</p>
                  </div>
                  <div className="w-12 h-12 bg-[#A6FAFF] border-2 border-black rounded-lg flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Aisha", amount: "+$21.40", color: "#B8FF9F" },
                    { name: "Ray", amount: "-$12.80", color: "#FFA6F6" },
                    { name: "Mina", amount: "-$8.60", color: "#FFC29F" },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between p-3 border-2 border-black rounded-md bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 border-2 border-black rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: row.color }}
                        >
                          {row.name[0]}
                        </div>
                        <span className="font-medium">{row.name}</span>
                      </div>
                      <span className="font-semibold">{row.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-[#FF6B6B] border-2 border-black rounded-full" />
                  Auto-calc who owes what.
                </div>
              </div>
            </NeoCard>
          </section>

          <section className="max-w-6xl mx-auto mt-16 grid gap-6 md:grid-cols-3">
            <NeoCard className="p-5" shadow="md">
              <div className="w-12 h-12 bg-[#A6FAFF] border-2 border-black rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Squad synced</h3>
              <p className="text-sm text-gray-600">
                Pull in friends, track shared spend, and keep balance updates in
                one place.
              </p>
            </NeoCard>
            <NeoCard className="p-5" shadow="md">
              <div className="w-12 h-12 bg-[#FFA6F6] border-2 border-black rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Balances that stay true
              </h3>
              <p className="text-sm text-gray-600">
                Instant totals show who owes what, so nobody needs to do math on
                the fly.
              </p>
            </NeoCard>
            <NeoCard className="p-5" shadow="md">
              <div className="w-12 h-12 bg-[#B8FF9F] border-2 border-black rounded-lg flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Settle without chaos</h3>
              <p className="text-sm text-gray-600">
                Log expenses, split instantly, and settle up when the vibe is
                right.
              </p>
            </NeoCard>
          </section>

          <section className="max-w-6xl mx-auto mt-16">
            <NeoCard className="p-6 md:p-8 bg-[#A6FAFF]" shadow="lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Ready to keep it clean?
                  </h2>
                  <p className="text-gray-700 mt-2">
                    Join the crew splitting bills with zero awkward follow-ups.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <NeoButton
                    size="lg"
                    variant="secondary"
                    onClick={() => router.push("/signup")}
                  >
                    Create account
                  </NeoButton>
                  <NeoButton
                    size="lg"
                    variant="ghost"
                    onClick={() => router.push("/login")}
                  >
                    Sign in
                  </NeoButton>
                </div>
              </div>
            </NeoCard>
          </section>
        </main>

        <footer className="relative z-10 px-6 pb-12 md:px-12">
          <div className="max-w-6xl mx-auto border-t-2 border-black pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFA6F6] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold">Khaata</p>
                <p className="text-xs text-gray-600">Made for squads.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <a
                href="https://github.com/aum1618/khaata"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Instagram
              </a>
              <Link
                href="/copyright"
                className="underline-offset-4 hover:underline"
              >
                Copyright
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  );
}
