"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, User, ChevronRight } from "lucide-react";
import {
  NeoCard,
  NeoButton,
  NeoInput,
  NeoTextarea,
  NeoSelect,
} from "@/components/neo-ui";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { Expense, User as ApiUser } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, useCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

type SplitMethod = "equal" | "unequal" | "shares" | "percentage";

function AddExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user } = useAuth();
  const { symbol } = useCurrency();
  const [step, setStep] = useState(1);

  // Step 1: Details
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Step 2: Participants
  const [friends, setFriends] = useState<ApiUser[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [paidBy, setPaidBy] = useState<string>("");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    participants?: string;
    split?: string;
    paidBy?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const friendData = await apiGet("/friends");
        setFriends(friendData || []);
        if (user?._id) {
          setPaidBy(user._id);
        }

        if (editId) {
          const expenses = await apiGet("/expenses/user");
          const expenseToEdit = (expenses || []).find(
            (e: Expense) => e._id === editId,
          );
          if (expenseToEdit) {
            setTitle(expenseToEdit.title || "");
            setAmount(expenseToEdit.amount.toString());
            setNotes(expenseToEdit.description || "");
            setPaidBy(expenseToEdit.paidBy._id);
            setSplitMethod(expenseToEdit.splitType);
            const participantIds = expenseToEdit.participants
              .map((p) => p._id)
              .filter((id) => id !== user?._id);
            setSelectedParticipants(participantIds);

            if (expenseToEdit.splitType !== "equal") {
              const mapped: Record<string, string> = {};
              expenseToEdit.splits.forEach((split) => {
                if (expenseToEdit.splitType === "unequal") {
                  mapped[split.user._id] = split.amountOwed.toString();
                }
                if (expenseToEdit.splitType === "percentage") {
                  mapped[split.user._id] = split.percentage?.toString() || "";
                }
                if (expenseToEdit.splitType === "shares") {
                  mapped[split.user._id] = split.shares?.toString() || "";
                }
              });
              setSplitValues(mapped);
            }
          }
        }
      } catch (error) {
        toast({
          title: "Could not load the bill",
          description: getErrorMessage(error, "Try again."),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [editId, user?._id]);

  const participantsWithUser = useMemo(() => {
    if (!user) return [];
    return [user, ...friends].filter(
      (f) => selectedParticipants.includes(f._id) || f._id === user._id,
    );
  }, [friends, selectedParticipants, user]);

  const splitTotals = useMemo(() => {
    const values = participantsWithUser.map((participant) =>
      Number(splitValues[participant._id] || 0),
    );
    const total = values.reduce((sum, value) => sum + value, 0);
    const amountTotal = Number(amount || 0);
    return {
      percentageTotal: total,
      percentageRemaining: Math.max(0, 100 - total),
      unequalRemaining: amountTotal - total,
    };
  }, [participantsWithUser, splitValues, amount]);

  const validateStep = (currentStep: number) => {
    const nextErrors: {
      title?: string;
      amount?: string;
      participants?: string;
      split?: string;
      paidBy?: string;
    } = {};

    if (currentStep === 1) {
      if (!title.trim()) {
        nextErrors.title = "Give it a title";
      }
      if (!amount || Number(amount) <= 0) {
        nextErrors.amount = "Amount must be greater than 0";
      }
    }

    if (currentStep === 2) {
      if (selectedParticipants.length === 0) {
        nextErrors.participants = "Pick at least one friend";
      }
    }

    if (currentStep === 3) {
      if (!paidBy) {
        nextErrors.paidBy = "Who paid? Pick one";
      }

      if (splitMethod !== "equal") {
        const values = participantsWithUser.map((p) =>
          Number(splitValues[p._id] || 0),
        );
        const hasInvalid = values.some((v) => !v || v <= 0);
        if (hasInvalid) {
          nextErrors.split = "Give everyone a value";
        } else if (splitMethod === "percentage") {
          const total = values.reduce((sum, v) => sum + v, 0);
          if (Math.round(total) !== 100) {
            nextErrors.split = "Percentages must total 100";
          }
        } else if (splitMethod === "unequal") {
          const total = values.reduce((sum, v) => sum + v, 0);
          if (Math.abs(total - Number(amount)) > 0.01) {
            nextErrors.split = "Unequal amounts must match the total";
          }
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(3, s + 1));
  };
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const buildSplits = () => {
    if (splitMethod === "equal") return [];

    return participantsWithUser.map((participant) => {
      const value = Number(splitValues[participant._id] || 0);
      if (splitMethod === "unequal") {
        return { user: participant._id, amountOwed: value };
      }
      if (splitMethod === "percentage") {
        return { user: participant._id, percentage: value };
      }
      return { user: participant._id, shares: value };
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    if (!validateStep(3)) return;

    if (!user?._id) return;

    try {
      const participantIds = [user._id, ...selectedParticipants];
      const payload = {
        title: title.trim(),
        description: notes.trim(),
        amount: Number(amount),
        paidBy,
        participants: participantIds,
        splitType: splitMethod,
        splits: buildSplits(),
      };

      if (editId) {
        await apiPut(`/expenses/${editId}`, payload);
      } else {
        await apiPost("/expenses", payload);
      }

      toast({
        title: editId ? "Bill updated" : "Bill created",
        description: "Saved and ready.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Could not save bill",
        description: getErrorMessage(error, "Try again."),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    const confirmed = window.confirm("Delete this bill?");
    if (!confirmed) return;
    try {
      await apiDelete(`/expenses/${editId}`);
      toast({
        title: "Bill deleted",
        description: "That bill is gone.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Could not delete bill",
        description: getErrorMessage(error, "Try again."),
        variant: "destructive",
      });
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          title="back"
          onClick={() =>
            step === 1 ? router.push("/dashboard") : handleBack()
          }
          className="p-2 border-2 border-black rounded-full hover:bg-[#A6FAFF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {editId ? "Edit bill" : "Add a bill"}
        </h1>
      </div>

      <div className="mb-6 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-3 border-2 border-black rounded-full ${
              step >= i ? "bg-[#B8FF9F]" : "bg-white"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <NeoCard className="p-6 space-y-6">
            <h2 className="text-xl font-bold border-b-2 border-black pb-2">
              Step 1: The basics
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">What is this?</label>
                <NeoInput
                  placeholder="e.g. Dinner, groceries..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">
                    {symbol}
                  </span>
                  <NeoInput
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0"
                    aria-invalid={!!errors.amount}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-2">
                  Notes (optional)
                </label>
                <NeoTextarea
                  placeholder="Any extra context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <NeoButton
              type="button"
              onClick={handleNext}
              className="w-full"
              variant="primary"
              disabled={!title || !amount}
            >
              Next <ChevronRight className="w-5 h-5" />
            </NeoButton>
          </NeoCard>
        )}

        {step === 2 && (
          <NeoCard className="p-6 space-y-6">
            <h2 className="text-xl font-bold border-b-2 border-black pb-2">
              Step 2: With who?
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Pick friends</label>
                {errors.participants && (
                  <p className="text-sm text-red-600 mb-2">
                    {errors.participants}
                  </p>
                )}
                {loading && (
                  <div className="p-4 text-sm text-gray-500">Loading...</div>
                )}
                {!loading && friends.length === 0 && (
                  <div className="p-4 text-sm text-gray-500">
                    No squad yet.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                  {friends.map((friend) => (
                    <label
                      key={friend._id}
                      onClick={() => toggleParticipant(friend._id)}
                      className={`flex items-center gap-3 p-3 border-2 border-black rounded-md cursor-pointer transition-all ${
                        selectedParticipants.includes(friend._id)
                          ? "bg-[#FFA6F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-black bg-[#A6FAFF] flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">
                          {friend.name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <NeoButton
                type="button"
                onClick={handleBack}
                variant="ghost"
                className="flex-1"
              >
                Back
              </NeoButton>
              <NeoButton
                type="button"
                onClick={handleNext}
                className="flex-1"
                variant="primary"
                disabled={selectedParticipants.length === 0}
              >
                Next <ChevronRight className="w-5 h-5" />
              </NeoButton>
            </div>
          </NeoCard>
        )}

        {step === 3 && (
          <NeoCard className="p-6 space-y-6">
            <h2 className="text-xl font-bold border-b-2 border-black pb-2">
              Step 3: Split style
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Who paid?</label>
                <NeoSelect
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  options={[
                    { value: user?._id || "", label: "You" },
                    ...participantsWithUser
                      .filter((p) => p._id !== user?._id)
                      .map((p) => ({ value: p._id, label: p.name })),
                  ]}
                  aria-invalid={!!errors.paidBy}
                />
                {errors.paidBy && (
                  <p className="text-sm text-red-600">{errors.paidBy}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2">How do we split?</label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      "equal",
                      "unequal",
                      "shares",
                      "percentage",
                    ] as SplitMethod[]
                  ).map((method) => (
                    <label
                      key={method}
                      className={`flex flex-col items-center justify-center p-3 border-2 border-black rounded-md cursor-pointer transition-all ${
                        splitMethod === method
                          ? "bg-[#B8FF9F] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="splitMethod"
                        value={method}
                        checked={splitMethod === method}
                        onChange={() => setSplitMethod(method)}
                        className="hidden"
                      />
                      <span className="font-medium capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {splitMethod === "equal" && (
                <div className="p-4 border-2 border-black bg-gray-50 rounded-md">
                  <p className="text-sm font-medium mb-2">Each person pays:</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      parseFloat(amount || "0") / participantsWithUser.length,
                      symbol,
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {participantsWithUser.length} people splitting equally
                  </p>
                </div>
              )}

              {splitMethod === "unequal" && (
                <div className="p-4 border-2 border-black bg-gray-50 rounded-md space-y-3">
                  <div className="text-sm font-medium flex items-center justify-between">
                    <span>Remaining</span>
                    <span>
                      {formatCurrency(splitTotals.unequalRemaining, symbol, {
                        absolute: false,
                      })}
                    </span>
                  </div>
                  {participantsWithUser.map((p) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <div className="flex-1 font-medium">{p.name}</div>
                      <div className="w-1/2 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">
                          {symbol}
                        </span>
                        <NeoInput
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          value={splitValues[p._id] || ""}
                          onChange={(e) =>
                            setSplitValues({
                              ...splitValues,
                              [p._id]: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {splitMethod === "percentage" && (
                <div className="p-4 border-2 border-black bg-gray-50 rounded-md space-y-3">
                  <div className="text-sm font-medium flex items-center justify-between">
                    <span>Remaining</span>
                    <span>{splitTotals.percentageRemaining}%</span>
                  </div>
                  {participantsWithUser.map((p) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <div className="flex-1 font-medium">{p.name}</div>
                      <div className="w-1/2 relative">
                        <NeoInput
                          type="number"
                          step="1"
                          placeholder="0"
                          value={splitValues[p._id] || ""}
                          onChange={(e) =>
                            setSplitValues({
                              ...splitValues,
                              [p._id]: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {splitMethod === "shares" && (
                <div className="p-4 border-2 border-black bg-gray-50 rounded-md space-y-3">
                  {participantsWithUser.map((p) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <div className="flex-1 font-medium">{p.name}</div>
                      <div className="w-1/2 relative">
                        <NeoInput
                          type="number"
                          step="1"
                          placeholder="0"
                          value={splitValues[p._id] || ""}
                          onChange={(e) =>
                            setSplitValues({
                              ...splitValues,
                              [p._id]: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.split && (
                <p className="text-sm text-red-600">{errors.split}</p>
              )}
            </div>

            <div className="flex gap-4">
              {editId && (
                <NeoButton
                  type="button"
                  onClick={handleDelete}
                  variant="destructive"
                  className="flex-1"
                >
                  Delete bill
                </NeoButton>
              )}
              <NeoButton
                type="button"
                onClick={handleBack}
                variant="ghost"
                className="flex-1"
              >
                Back
              </NeoButton>
              <NeoButton type="submit" className="flex-1" variant="primary">
                {editId ? "Update bill" : "Create bill"}
              </NeoButton>
            </div>
          </NeoCard>
        )}
      </form>
    </div>
  );
}

export default function AddExpensePage() {
  return (
    <Suspense>
      <AddExpenseForm />
    </Suspense>
  );
}
