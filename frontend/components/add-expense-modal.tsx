"use client";

import { useEffect, useState } from "react";
import { DollarSign, FileText, Users, Tag, Check } from "lucide-react";
import {
  NeoModal,
  NeoButton,
  NeoInput,
  NeoSelect,
  NeoTextarea,
  NeoCard,
  NeoAvatar,
} from "@/components/neo-ui";
import { apiGet } from "@/lib/api";
import { ExpenseCategory, User } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: "food", label: "Food & sips" },
  { value: "transport", label: "Rides" },
  { value: "entertainment", label: "Fun stuff" },
  { value: "shopping", label: "Shopping spree" },
  { value: "utilities", label: "Bills" },
  { value: "rent", label: "Rent" },
  { value: "travel", label: "Trips" },
  { value: "healthcare", label: "Health" },
  { value: "other", label: "Misc" },
];

export function AddExpenseModal({ open, onClose }: AddExpenseModalProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);
  const [friends, setFriends] = useState<User[]>([]);
  const [errors, setErrors] = useState<{
    description?: string;
    amount?: string;
    friends?: string;
    paidBy?: string;
  }>({});

  useEffect(() => {
    if (user?._id) {
      setPaidBy(user._id);
    }
  }, [user?._id]);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await apiGet("/friends");
        setFriends(data || []);
      } catch (error) {
        toast({
          title: "Could not load the squad",
          description: getErrorMessage(error, "Try again."),
          variant: "destructive",
        });
      }
    };

    loadFriends();
  }, []);

  const handleClose = () => {
    setStep(1);
    setDescription("");
    setAmount("");
    setCategory("food");
    setSelectedFriends([]);
    setPaidBy(user?._id || "");
    setNotes("");
    setErrors({});
    onClose();
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const validateStep = (currentStep: number) => {
    const nextErrors: {
      description?: string;
      amount?: string;
      friends?: string;
      paidBy?: string;
    } = {};

    if (currentStep === 1) {
      if (!description.trim()) {
        nextErrors.description = "Give it a quick label";
      }
      if (!amount || Number(amount) <= 0) {
        nextErrors.amount = "Amount must be greater than 0";
      }
    }

    if (currentStep === 2) {
      if (selectedFriends.length === 0) {
        nextErrors.friends = "Pick at least one friend";
      }
      if (!paidBy) {
        nextErrors.paidBy = "Who paid? Pick one";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;
    // Mock submit - in real app this would call an API
    console.log({
      description,
      amount: parseFloat(amount),
      category,
      splitType,
      selectedFriends,
      paidBy,
      notes,
    });
    toast({
      title: "Bill added",
      description: "Ready to split it up.",
    });
    handleClose();
  };

  const canProceed =
    step === 1
      ? description && amount && parseFloat(amount) > 0
      : selectedFriends.length > 0;

  return (
    <NeoModal open={open} onClose={handleClose} title="Add a bill">
      <div className="space-y-4">
        {step === 1 && (
          <>
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                What is this for?
              </label>
              <NeoInput
                placeholder="What is this about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Amount
              </label>
              <NeoInput
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                aria-invalid={!!errors.amount}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <NeoSelect
                options={categories}
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <NeoTextarea
                placeholder="Any extra spice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Select Friends */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Split with
              </label>
              {errors.friends && (
                <p className="text-sm text-red-600">{errors.friends}</p>
              )}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">
                  CHOOSE FRIENDS
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {friends.map((friend) => (
                    <button
                      key={friend._id}
                      onClick={() => {
                        toggleFriend(friend._id);
                      }}
                      className={`w-full p-3 border-2 border-black rounded-md flex items-center gap-3 transition-all ${
                        selectedFriends.includes(friend._id)
                          ? "bg-[#B8FF9F] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      <NeoAvatar name={friend.name} size="sm" />
                      <span className="font-medium text-sm flex-1 text-left">
                        {friend.name}
                      </span>
                      {selectedFriends.includes(friend._id) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Paid By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Paid by</label>
              <NeoSelect
                options={[
                  ...(user?._id ? [{ value: user._id, label: "You" }] : []),
                  ...friends
                    .filter((f) => selectedFriends.includes(f._id))
                    .map((f) => ({ value: f._id, label: f.name })),
                ]}
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                aria-invalid={!!errors.paidBy}
              />
              {errors.paidBy && (
                <p className="text-sm text-red-600">{errors.paidBy}</p>
              )}
            </div>

            {/* Split Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Split style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSplitType("equal")}
                  className={`flex-1 p-3 border-2 border-black rounded-md font-medium transition-all ${
                    splitType === "equal"
                      ? "bg-[#A6FAFF] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Split evenly
                </button>
                <button
                  onClick={() => setSplitType("custom")}
                  className={`flex-1 p-3 border-2 border-black rounded-md font-medium transition-all ${
                    splitType === "custom"
                      ? "bg-[#A6FAFF] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Custom split
                </button>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t-2 border-black">
          {step > 1 && (
            <NeoButton
              variant="ghost"
              className="flex-1"
              onClick={() => setStep(step - 1)}
            >
              Back
            </NeoButton>
          )}
          <NeoButton variant="ghost" className="flex-1" onClick={handleClose}>
            Nah
          </NeoButton>
          {step === 1 ? (
            <NeoButton
              className="flex-1"
              onClick={() => {
                if (!validateStep(1)) return;
                setStep(2);
              }}
              disabled={!canProceed}
            >
              Next
            </NeoButton>
          ) : (
            <NeoButton
              variant="accent"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!canProceed}
            >
              Save bill
            </NeoButton>
          )}
        </div>
      </div>
    </NeoModal>
  );
}
