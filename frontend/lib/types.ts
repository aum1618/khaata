export type ExpenseCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "utilities"
  | "rent"
  | "travel"
  | "healthcare"
  | "other";

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: "admin" | "user";
  isActive?: boolean;
}

export interface FriendBalance {
  friend: User;
  balance: number; // positive = they owe you, negative = you owe them
}

export interface ExpenseSplit {
  user: User;
  amountOwed: number;
  percentage?: number;
  shares?: number;
}

export interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  paidBy: User;
  participants: User[];
  splitType: "equal" | "unequal" | "percentage" | "shares";
  splits: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}
