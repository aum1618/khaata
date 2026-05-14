"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "currencySymbol";
const DEFAULT_SYMBOL = "Rs";

export const currencyOptions = [
  { value: "$", label: "USD ($)" },
  { value: "€", label: "EUR (€)" },
  { value: "£", label: "GBP (£)" },
  { value: "Rs", label: "PKR (₨)" },
];

export const getCurrencySymbol = () => {
  if (typeof window === "undefined") return DEFAULT_SYMBOL;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_SYMBOL;
};

export const setCurrencySymbol = (symbol: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, symbol);
  window.dispatchEvent(new Event("currency-change"));
};

export const useCurrency = () => {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);

  useEffect(() => {
    setSymbol(getCurrencySymbol());
  }, []);

  useEffect(() => {
    const handleChange = () => setSymbol(getCurrencySymbol());
    window.addEventListener("storage", handleChange);
    window.addEventListener("currency-change", handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("currency-change", handleChange);
    };
  }, []);

  const updateSymbol = useCallback((nextSymbol: string) => {
    setCurrencySymbol(nextSymbol);
    setSymbol(nextSymbol);
  }, []);

  return useMemo(
    () => ({ symbol, setSymbol: updateSymbol }),
    [symbol, updateSymbol],
  );
};

export const formatCurrency = (
  amount: number,
  symbol: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    absolute?: boolean;
    sign?: boolean;
  },
) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    absolute = false,
    sign = false,
  } = options || {};

  const value = absolute ? Math.abs(amount) : amount;
  const resolved = Number(value).toFixed(
    Math.max(minimumFractionDigits, maximumFractionDigits),
  );
  const prefix = sign ? (amount > 0 ? "+" : amount < 0 ? "-" : "") : "";

  return `${prefix}${symbol}${resolved}`;
};
