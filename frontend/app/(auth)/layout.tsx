"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { strings } from "@/locales/en";

function AntiAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {strings.common.loadingVibe}
      </div>
    );
  }

  // Still render children temporarily to prevent flicker, Next Router push takes priority
  return <>{children}</>;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AntiAuthGuard>{children}</AntiAuthGuard>
    </AuthProvider>
  );
}
