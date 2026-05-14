"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Users, Settings, Wallet, Plus, Shield } from "lucide-react";
import { NeoButton } from "@/components/neo-ui";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const baseNavItems = [
  { id: "home", label: "Hub", href: "/dashboard", icon: Home },
  {
    id: "friends",
    label: "Squad",
    href: "/dashboard/friends",
    icon: Users,
  },
  {
    id: "settings",
    label: "Me",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navItems = user?.role === "admin"
    ? [
        ...baseNavItems,
        {
          id: "admin",
          label: "Admin Lab",
          href: "/dashboard/admin",
          icon: Shield,
        },
      ]
    : baseNavItems;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const showAddExpenseButton = !pathname.includes("/settings");

  return (
    <div className="min-h-screen bg-[#FFFEF0]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r-2 md:border-black bg-white">
        {/* Logo */}
        <div className="p-4 border-b-2 border-black">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A6FAFF] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">Khaata</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md border-2 border-black font-medium transition-all",
                  active
                    ? "bg-[#A6FAFF] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    : "bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Add Expense Button - Desktop */}
        {showAddExpenseButton && (
          <div className="p-4 border-t-2 border-black">
            <NeoButton
              variant="secondary"
              className="w-full"
              onClick={() => router.push("/dashboard/add-expense")}
            >
              <Plus className="w-5 h-5" />
              Add a bill
            </NeoButton>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-6 min-h-screen neo-page">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                  active ? "text-black" : "text-gray-500",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-md border-2",
                    active ? "bg-[#A6FAFF] border-black" : "border-transparent",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Add Expense Button - Mobile */}
      {showAddExpenseButton && (
        <button
          onClick={() => router.push("/dashboard/add-expense")}
          className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#FFA6F6] border-2 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}
