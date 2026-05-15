"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  Users,
  Receipt,
} from "lucide-react";
import { NeoCard, NeoAvatar } from "@/components/neo-ui";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Expense, FriendBalance } from "@/lib/types";
import { formatCurrency, useCurrency } from "@/lib/currency";
import { strings } from "@/locales/en";
import { themeVars } from "@/lib/theme";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { symbol } = useCurrency();
  const [balances, setBalances] = useState<FriendBalance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [balanceData, expenseData] = await Promise.all([
          apiGet("/balances/friends"),
          apiGet("/expenses/user"),
        ]);
        setBalances(balanceData || []);
        setExpenses(expenseData || []);
      } catch (error) {
        toast({
          title: strings.dashboard.toasts.loadFailTitle,
          description: getErrorMessage(
            error,
            strings.dashboard.toasts.loadFailFallback,
          ),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totals = useMemo(() => {
    const youOwe = balances
      .filter((b) => b.balance < 0)
      .reduce((sum, b) => sum + Math.abs(b.balance), 0);
    const youAreOwed = balances
      .filter((b) => b.balance > 0)
      .reduce((sum, b) => sum + b.balance, 0);
    return {
      youOwe,
      youAreOwed,
      netBalance: youAreOwed - youOwe,
    };
  }, [balances]);

  const recentExpenses = expenses.slice(0, 5);
  const topOwers = [...balances]
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3);
  const topOwed = [...balances]
    .filter((b) => b.balance < 0)
    .sort((a, b) => a.balance - b.balance)
    .slice(0, 3);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {strings.dashboard.greeting(
              user?.name?.split(" ")[0] || strings.dashboard.greetingFallback,
            )}
          </h1>
          <p className="text-gray-600">{strings.dashboard.subtitle}</p>
        </div>
        <NeoAvatar
          name={user?.name || strings.dashboard.userFallback}
          size="lg"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Balance */}
        <NeoCard
          className="p-5"
          style={{
            backgroundColor:
              totals.netBalance >= 0
                ? themeVars.neoGreen
                : themeVars.destructive,
          }}
          shadow="md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium mb-1">
                {strings.dashboard.summary.netTitle}
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(totals.netBalance, symbol, {
                  absolute: true,
                })}
              </p>
              <p className="text-sm mt-1">
                {totals.netBalance >= 0
                  ? strings.dashboard.summary.netPositive
                  : strings.dashboard.summary.netNegative}
              </p>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </NeoCard>

        {/* You Are Owed */}
        <NeoCard
          className="p-5"
          style={{ backgroundColor: themeVars.neoCyan }}
          shadow="md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium mb-1">
                {strings.dashboard.summary.owedTitle}
              </p>
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(totals.youAreOwed, symbol)}
              </p>
              <p className="text-sm mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                {strings.dashboard.summary.owedBy(
                  balances.filter((b) => b.balance > 0).length,
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </NeoCard>

        {/* You Owe */}
        <NeoCard
          className="p-5"
          style={{ backgroundColor: themeVars.neoPink }}
          shadow="md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium mb-1">
                {strings.dashboard.summary.oweTitle}
              </p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totals.youOwe, symbol)}
              </p>
              <p className="text-sm mt-1 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                {strings.dashboard.summary.oweTo(
                  balances.filter((b) => b.balance < 0).length,
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </NeoCard>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1  md:grid-cols-3 gap-4">
        <NeoCard className="p-4" shadow="sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeVars.neoOrange }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{balances.length}</p>
              <p className="text-xs text-gray-600">
                {strings.dashboard.quickStats.squad}
              </p>
            </div>
          </div>
        </NeoCard>
        <NeoCard className="p-4" shadow="sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeVars.neoGreen }}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expenses.length}</p>
              <p className="text-xs text-gray-600">
                {strings.dashboard.quickStats.splits}
              </p>
            </div>
          </div>
        </NeoCard>

        <NeoCard className="p-4" shadow="sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeVars.neoPink }}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  expenses.reduce((sum, e) => sum + e.amount, 0),
                  symbol,
                  { minimumFractionDigits: 0, maximumFractionDigits: 0 },
                )}
              </p>
              <p className="text-xs text-gray-600">
                {strings.dashboard.quickStats.totalSplit}
              </p>
            </div>
          </div>
        </NeoCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <NeoCard shadow="md">
          <div className="p-4 border-b-2 border-black flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {strings.dashboard.recentBills.title}
            </h2>
            <Link
              href="/dashboard/friends"
              className="text-sm font-medium hover:underline"
            >
              {strings.dashboard.recentBills.viewAll}
            </Link>
          </div>
          <div className="divide-y-2 divide-black">
            {loading && (
              <div className="p-4 text-center text-gray-500">
                {strings.dashboard.recentBills.loading}
              </div>
            )}
            {!loading && recentExpenses.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                {strings.dashboard.recentBills.empty}
              </div>
            )}
            {!loading &&
              recentExpenses.map((expense) => (
                <Link
                  key={expense._id}
                  href={`/dashboard/add-expense?edit=${expense._id}`}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: themeVars.neoOrange }}
                  >
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {expense.title ||
                        expense.description ||
                        strings.dashboard.recentBills.fallbackTitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(expense.amount, symbol)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.paidBy._id === user?._id
                        ? strings.dashboard.recentBills.paidByYou
                        : strings.dashboard.recentBills.paidByFriend(
                            expense.paidBy.name,
                          )}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </NeoCard>

        {/* Balance Overview */}
        <div className="space-y-6">
          {/* People who owe you */}
          <NeoCard shadow="md">
            <div
              className="p-4 border-b-2 border-black"
              style={{ backgroundColor: themeVars.neoGreen }}
            >
              <h2 className="text-lg font-bold">
                {strings.dashboard.balances.oweYouTitle}
              </h2>
            </div>
            <div className="divide-y-2 divide-black">
              {topOwers.length > 0 ? (
                topOwers.map((entry) => (
                  <Link
                    key={entry.friend._id}
                    href={`/dashboard/friends/${entry.friend._id}`}
                    className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <NeoAvatar name={entry.friend.name} size="md" />
                    <div className="flex-1">
                      <p className="font-medium">{entry.friend.name}</p>
                    </div>
                    <p className="font-bold text-green-600">
                      {formatCurrency(entry.balance, symbol, {
                        absolute: true,
                        sign: true,
                      })}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {strings.dashboard.balances.oweYouEmpty}
                </div>
              )}
            </div>
          </NeoCard>

          {/* People you owe */}
          <NeoCard shadow="md">
            <div
              className="p-4 border-b-2 border-black"
              style={{ backgroundColor: themeVars.neoPink }}
            >
              <h2 className="text-lg font-bold">
                {strings.dashboard.balances.youOweTitle}
              </h2>
            </div>
            <div className="divide-y-2 divide-black">
              {topOwed.length > 0 ? (
                topOwed.map((entry) => (
                  <Link
                    key={entry.friend._id}
                    href={`/dashboard/friends/${entry.friend._id}`}
                    className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <NeoAvatar name={entry.friend.name} size="md" />
                    <div className="flex-1">
                      <p className="font-medium">{entry.friend.name}</p>
                    </div>
                    <p className="font-bold text-red-600">
                      {formatCurrency(entry.balance, symbol, {
                        absolute: true,
                        sign: true,
                      })}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {strings.dashboard.balances.youOweEmpty}
                </div>
              )}
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
