"use client";
// A small calculator on /reference/fees: an order amount and a payment method in, the fee and
// what the customer pays out, with the bot's default fees (calculateFee is the bot's rule,
// lib/fees.mjs). The method names are the /fp menu's (BOT_METHOD_LABELS.dropdown).
import { useId, useState } from "react";
import { BOT_METHOD_LABELS } from "@/content/bot-ui.generated";
import { calculateFee, DEFAULT_FEES, type SmilePayMethod } from "@/lib/fees";

const METHODS = Object.keys(DEFAULT_FEES) as SmilePayMethod[];

/** The fee and the total for an amount typed as text; null while it is not a whole number above 0. */
export function quote(method: SmilePayMethod, text: string): { fee: number; total: number } | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const amount = Number(text.trim());
  if (amount <= 0 || !Number.isSafeInteger(amount)) return null;
  const fee = calculateFee(method, amount);
  return { fee, total: amount + fee };
}

export function FeeCalculator() {
  const id = useId();
  const [amount, setAmount] = useState("980");
  const [method, setMethod] = useState<SmilePayMethod>("ibon");
  const result = quote(method, amount);
  const field = "w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-base";
  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm" htmlFor={`${id}-amount`}>
          訂單金額（元）
          <input
            id={`${id}-amount`}
            className={field}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm" htmlFor={`${id}-method`}>
          付款方式
          <select
            id={`${id}-method`}
            className={field}
            value={method}
            onChange={(e) => setMethod(e.target.value as SmilePayMethod)}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {BOT_METHOD_LABELS.dropdown[m]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <output htmlFor={`${id}-amount ${id}-method`} aria-live="polite" className="mt-4 block text-sm">
        {result ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
            <dt className="text-fd-muted-foreground">手續費</dt>
            <dd className="tabular-nums">{result.fee} 元</dd>
            <dt className="text-fd-muted-foreground">顧客要付</dt>
            <dd className="text-base font-semibold tabular-nums">{result.total} 元</dd>
          </dl>
        ) : (
          <span className="text-fd-muted-foreground">金額請填大於 0 的整數。</span>
        )}
      </output>
      <p className="mt-3 text-xs text-fd-muted-foreground">用的是預設手續費。商家在後台改過手續費的話，以後台為準。</p>
    </div>
  );
}
