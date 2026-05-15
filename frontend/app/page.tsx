"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Users, Receipt, Sparkles, ArrowRight } from "lucide-react";
import { NeoButton, NeoCard } from "@/components/neo-ui";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { strings } from "@/locales/en";

function LandingContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const heroDotClasses = ["bg-warning", "bg-primary", "bg-secondary"];
  const sampleColorClasses = ["bg-accent", "bg-secondary", "bg-warning"];
  const featureIcons = [Users, Wallet, Receipt];
  const featureCardClasses = ["bg-primary", "bg-secondary", "bg-accent"];

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {strings.common.loadingVibe}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-black neo-page">
      <div className="relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-primary border-2 border-black rounded-full opacity-60" />
        <div className="absolute top-32 -right-16 w-60 h-60 bg-secondary border-2 border-black rounded-full opacity-50" />
        <div className="absolute bottom-10 left-1/2 w-40 h-40 bg-accent border-2 border-black rotate-12 opacity-60" />

        <header className="relative z-10 px-6 pt-8 pb-6 md:px-12">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary border-2 border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] neo-float">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xl font-bold">{strings.app.name}</p>
                <p className="text-xs text-gray-600">{strings.app.tagline}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="font-medium hover:underline">
                {strings.landing.navLogin}
              </Link>
              <NeoButton
                variant="secondary"
                size="sm"
                onClick={() => router.push("/signup")}
              >
                {strings.landing.navGetStarted}
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
                  {strings.landing.heroBadge}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                {strings.landing.heroTitleLead}{" "}
                <span className="bg-accent px-2 border-2 border-black">
                  {strings.landing.heroTitleHighlight}
                </span>
              </h1>
              <p className="text-lg text-gray-700 max-w-xl">
                {strings.landing.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <NeoButton size="lg" onClick={() => router.push("/signup")}>
                  {strings.landing.heroPrimaryCta}
                  <ArrowRight className="w-4 h-4" />
                </NeoButton>
                <NeoButton
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push("/login")}
                >
                  {strings.landing.heroSecondaryCta}
                </NeoButton>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {strings.landing.heroBullets.map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 border-2 border-black rounded-full ${heroDotClasses[index]}`}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <NeoCard className="p-6 bg-white/90" shadow="lg">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {strings.landing.sampleCard.title}
                    </p>
                    <p className="text-3xl font-bold">
                      {strings.landing.sampleCard.amount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary border-2 border-black rounded-lg flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-3">
                  {strings.landing.sampleCard.people.map((row, index) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between p-3 border-2 border-black rounded-md bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 border-2 border-black rounded-full flex items-center justify-center text-sm font-bold ${sampleColorClasses[index]}`}
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
                  <div className="w-3 h-3 bg-destructive border-2 border-black rounded-full" />
                  {strings.landing.sampleCard.note}
                </div>
              </div>
            </NeoCard>
          </section>

          <section className="max-w-6xl mx-auto mt-16 grid gap-6 md:grid-cols-3">
            {strings.landing.featureCards.map((card, index) => {
              const Icon = featureIcons[index] || Users;
              return (
                <NeoCard key={card.title} className="p-5" shadow="md">
                  <div
                    className={`w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center mb-4 ${
                      featureCardClasses[index] || "bg-primary"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </NeoCard>
              );
            })}
          </section>

          <section className="max-w-6xl mx-auto mt-16">
            <NeoCard className="p-6 md:p-8 bg-primary" shadow="lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {strings.landing.ctaTitle}
                  </h2>
                  <p className="text-gray-700 mt-2">
                    {strings.landing.ctaDescription}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <NeoButton
                    size="lg"
                    variant="secondary"
                    onClick={() => router.push("/signup")}
                  >
                    {strings.landing.ctaPrimary}
                  </NeoButton>
                  <NeoButton
                    size="lg"
                    variant="ghost"
                    onClick={() => router.push("/login")}
                  >
                    {strings.landing.ctaSecondary}
                  </NeoButton>
                </div>
              </div>
            </NeoCard>
          </section>
        </main>

        <footer className="relative z-10 px-6 pb-12 md:px-12">
          <div className="max-w-6xl mx-auto border-t-2 border-black pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold">{strings.app.name}</p>
                <p className="text-xs text-gray-600">
                  {strings.landing.footerTagline}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <a
                href="https://github.com/aum1618/khaata"
                target="_blank"
                rel="noreferrer noopener"
                className="underline-offset-4 hover:underline"
              >
                {strings.landing.footerLinks.github}
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer noopener"
                className="underline-offset-4 hover:underline"
              >
                {strings.landing.footerLinks.instagram}
              </a>
              <Link
                href="/copyright"
                className="underline-offset-4 hover:underline"
              >
                {strings.landing.footerLinks.copyright}
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
