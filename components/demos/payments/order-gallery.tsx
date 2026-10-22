"use client";
// The order message of each payment method, one at a time behind tabs (not animated): what the
// bot posts once an order is created. Each method has its own demo story (amount and order id),
// so the fees and totals are the ones the bot would compute for it.
import { useState } from "react";
import { SnapshotMessage } from "@/components/demo";
import { DiscordWindow, Message } from "@/components/discord";
import { BOT_METHOD_LABELS } from "@/content/bot-ui.generated";
import { DEMO_CHANNELS, type SnapshotId } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { BOT, time } from "./kit";

const ORDERS = [
  { method: "bank_transfer", id: "builder/payment_create/bank_transfer/invoice=False", scenario: SCENARIOS.payBankTransfer },
  { method: "store_barcode", id: "builder/payment_create/store_barcode/invoice=False", scenario: SCENARIOS.fpStoreBarcode },
  { method: "ibon", id: "builder/payment_create/ibon/invoice=False", scenario: SCENARIOS.payIbon },
  { method: "famiport", id: "builder/payment_create/famiport/invoice=False", scenario: SCENARIOS.payFamiport },
  { method: "hilife", id: "builder/payment_create/hilife/invoice=False", scenario: SCENARIOS.payHilife },
] as const satisfies readonly { method: keyof typeof BOT_METHOD_LABELS.dropdown; id: SnapshotId; scenario: object }[];

export const GALLERY_ORDERS = ORDERS;

export function OrderGallery({ label = "各付款方式的訂單訊息" }: { label?: string }) {
  const [active, setActive] = useState(0);
  const order = ORDERS[active];
  return (
    <div className="not-prose my-6">
      <div role="tablist" aria-label={label} className="mb-3 flex flex-wrap gap-2">
        {ORDERS.map((o, i) => (
          <button
            key={o.method}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="order-gallery-panel"
            onClick={() => setActive(i)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              i === active
                ? "border-[var(--brand)] bg-[var(--brand)]/15 text-[var(--fg)]"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {BOT_METHOD_LABELS.dropdown[o.method]}
          </button>
        ))}
      </div>
      <div id="order-gallery-panel" role="tabpanel" aria-label={`${BOT_METHOD_LABELS.dropdown[order.method]}的訂單訊息`}>
        <DiscordWindow title={DEMO_CHANNELS.ticket.name} kind="channel">
          <Message author={BOT.name} avatar={BOT.avatar} bot time={time()}>
            <SnapshotMessage key={order.method} id={order.id} scenario={order.scenario} />
          </Message>
        </DiscordWindow>
      </div>
    </div>
  );
}
