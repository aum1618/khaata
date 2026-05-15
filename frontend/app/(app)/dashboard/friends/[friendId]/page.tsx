"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  DollarSign,
  Receipt,
  Send,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  NeoCard,
  NeoButton,
  NeoAvatar,
  NeoBadge,
  NeoModal,
  NeoInput,
  NeoTextarea,
} from "@/components/neo-ui";
import { apiGet, apiPost } from "@/lib/api";
import { Expense, FriendBalance } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { cn, getErrorMessage } from "@/lib/utils";
import { formatCurrency, useCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { strings } from "@/locales/en";

export default function FriendDetailPage({
  params,
}: {
  params: Promise<{ friendId: string }>;
}) {
  const { friendId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { symbol } = useCurrency();
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleError, setSettleError] = useState("");
  const [friendEntry, setFriendEntry] = useState<FriendBalance | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [balances, expenseData] = await Promise.all([
          apiGet("/balances/friends"),
          apiGet("/expenses/user"),
        ]);
        const entry = (balances || []).find(
          (b: FriendBalance) => b.friend._id === friendId,
        );
        setFriendEntry(entry || null);
        setExpenses(expenseData || []);
      } catch (error) {
        toast({
          title: strings.friendDetails.toasts.loadFailTitle,
          description: getErrorMessage(
            error,
            strings.friendDetails.toasts.failFallback,
          ),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [friendId]);

  const friend = friendEntry?.friend;

  const friendExpenses = useMemo(() => {
    if (!friend) return [];
    return expenses.filter((expense) =>
      expense.participants.some((p) => p._id === friend._id),
    );
  }, [expenses, friend]);

  const balanceAmount = friendEntry?.balance ?? 0;

  const handleSettle = async () => {
    const amount = Number(settleAmount);
    const maxAmount = Math.abs(balanceAmount);
    if (!amount || amount <= 0) {
      setSettleError(strings.friendDetails.modal.errors.invalidAmount);
      return;
    }
    if (amount > maxAmount) {
      setSettleError(strings.friendDetails.modal.errors.exceedsBalance);
      return;
    }
    if (!friend) return;
    try {
      await apiPost("/balances/settle", { friendId: friend._id, amount });
      setShowSettleModal(false);
      setSettleAmount("");
      setSettleError("");
      const updated = await apiGet("/balances/friends");
      const entry = (updated || []).find(
        (b: FriendBalance) => b.friend._id === friend._id,
      );
      setFriendEntry(entry || null);
      toast({
        title: strings.friendDetails.toasts.settleSuccessTitle,
        description: strings.friendDetails.toasts.settleSuccessDescription,
      });
    } catch (error) {
      toast({
        title: strings.friendDetails.toasts.settleFailTitle,
        description: getErrorMessage(
          error,
          strings.friendDetails.toasts.failFallback,
        ),
        variant: "destructive",
      });
    }
  };

  if (!friend && !loading) {
    return (
      <div className="p-4 md:p-6">
        <NeoCard className="p-8 text-center" shadow="md">
          <p className="text-lg font-medium mb-4">
            {strings.friendDetails.notFoundTitle}
          </p>
          <NeoButton onClick={() => router.push("/dashboard/friends")}>
            {strings.friendDetails.backToSquad}
          </NeoButton>
        </NeoCard>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          aria-label={strings.common.back}
          title={strings.common.back}
          className="p-2 border-2 border-black rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">
          {strings.friendDetails.headerTitle}
        </h1>
      </div>

      {loading && (
        <NeoCard className="p-6 text-center" shadow="md">
          {strings.friendDetails.loading}
        </NeoCard>
      )}

      {!loading && friend && (
        <>
          {/* Friend Profile Card */}
          <NeoCard shadow="lg">
            <div
              className={cn(
                "p-6 border-b-2 border-black",
                balanceAmount > 0
                  ? "bg-accent"
                  : balanceAmount < 0
                    ? "bg-secondary"
                    : "bg-primary",
              )}
            >
              <div className="flex items-start gap-4">
                <NeoAvatar name={friend.name} size="lg" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{friend.name}</h2>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {friend.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {strings.friendDetails.balanceLabel}
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      balanceAmount > 0
                        ? "text-green-600"
                        : balanceAmount < 0
                          ? "text-red-600"
                          : "text-gray-600",
                    )}
                  >
                    {balanceAmount === 0 ? (
                      strings.friendDetails.balanceEven
                    ) : (
                      <>
                        {formatCurrency(balanceAmount, symbol, {
                          absolute: true,
                          sign: true,
                        })}
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {balanceAmount > 0
                      ? strings.friendDetails.balanceOwesYou
                      : balanceAmount < 0
                        ? strings.friendDetails.balanceYouOwe
                        : strings.friendDetails.balanceSettled}
                  </p>
                </div>
                <div className="flex gap-2">
                  {balanceAmount !== 0 && (
                    <>
                      <NeoButton
                        variant="accent"
                        onClick={() => setShowSettleModal(true)}
                      >
                        <DollarSign className="w-4 h-4" />
                        {strings.friendDetails.settleUp}
                      </NeoButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </NeoCard>

          {/* Transaction History */}
          <NeoCard shadow="md">
            <div className="p-4 border-b-2 border-black flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {strings.friendDetails.historyTitle}
              </h3>
              <NeoBadge>
                {strings.friendDetails.billsCount(friendExpenses.length)}
              </NeoBadge>
            </div>
            <div className="divide-y-2 divide-black">
              {friendExpenses.length > 0 ? (
                friendExpenses.map((expense) => {
                  const youPaid = expense.paidBy._id === user?._id;
                  const friendPaid = expense.paidBy._id === friend._id;
                  const friendSplit = expense.splits.find(
                    (s) => s.user._id === friend._id,
                  );
                  const userSplit = expense.splits.find(
                    (s) => s.user._id === user?._id,
                  );
                  const friendOwesYou = youPaid && friendSplit?.amountOwed;
                  const youOweFriend = friendPaid && userSplit?.amountOwed;

                  return (
                    <Link
                      key={expense._id}
                      href={`/dashboard/add-expense?edit=${expense._id}`}
                      className="p-4 block hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-warning border-2 border-black rounded-lg flex items-center justify-center shrink-0">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">
                                {expense.title ||
                                  expense.description ||
                                  strings.friendDetails.expenseFallback}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  expense.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                {formatCurrency(expense.amount, symbol)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {youPaid
                                  ? strings.friendDetails.paidByYou
                                  : strings.friendDetails.paidByFriend(
                                      expense.paidBy.name,
                                    )}
                              </p>
                            </div>
                          </div>

                          {(friendOwesYou || youOweFriend) && (
                            <div className="mt-2 flex items-center gap-2">
                              {friendOwesYou !== undefined && (
                                <NeoBadge variant="accent">
                                  <ArrowUpRight className="w-3 h-3 mr-1" />
                                  {friend.name}{" "}
                                  {strings.friendDetails.balanceOwesYou}{" "}
                                  {formatCurrency(
                                    friendSplit?.amountOwed || 0,
                                    symbol,
                                  )}
                                </NeoBadge>
                              )}
                              {youOweFriend !== undefined && (
                                <NeoBadge variant="secondary">
                                  <ArrowDownRight className="w-3 h-3 mr-1" />
                                  {strings.friendDetails.balanceYouOwe}{" "}
                                  {formatCurrency(
                                    userSplit?.amountOwed || 0,
                                    symbol,
                                  )}
                                </NeoBadge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{strings.friendDetails.noBills(friend.name)}</p>
                </div>
              )}
            </div>
          </NeoCard>

          {/* Settle Up Modal */}
          <NeoModal
            open={showSettleModal}
            onClose={() => {
              setShowSettleModal(false);
              setSettleError("");
            }}
            title={strings.friendDetails.modal.title}
          >
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-100 border-2 border-black rounded-md">
                <p className="text-sm text-gray-600 mb-1">
                  {balanceAmount > 0
                    ? strings.friendDetails.modal.balanceHintOwes(friend.name)
                    : strings.friendDetails.modal.balanceHintYouOwe(
                        friend.name,
                      )}
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(balanceAmount, symbol, {
                    absolute: true,
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {strings.friendDetails.modal.amountLabel}
                </label>
                <NeoInput
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  placeholder={strings.friendDetails.modal.amountPlaceholder}
                  min="0"
                  aria-invalid={!!settleError}
                />
              </div>
              {settleError && (
                <p className="text-sm text-red-600">{settleError}</p>
              )}

              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <NeoButton
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowSettleModal(false)}
                >
                  {strings.friendDetails.modal.cancel}
                </NeoButton>
                <NeoButton
                  variant="accent"
                  className="flex-1"
                  onClick={handleSettle}
                >
                  {strings.friendDetails.modal.confirm}
                </NeoButton>
              </div>
            </div>
          </NeoModal>
        </>
      )}
    </div>
  );
}
