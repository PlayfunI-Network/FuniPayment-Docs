"use client";
// The order message of each payment method, one at a time behind tabs (not animated): what the
// bot posts once an order is created. Each method has its own demo story (amount and order id),
// so the fees and totals are the ones the bot would compute for it.
import { MessageWindow, SnapshotMessage, SnapshotTabs } from "@/components/demo";
import { BOT_METHOD_LABELS } from "@/content/bot-ui.generated";
import { DEMO_CHANNELS, type SnapshotId } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const ORDERS = [
  { method: "bank_transfer", id: "builder/payment_create/bank_transfer/invoice=False", scenario: SCENARIOS.payBankTransfer },
  { method: "store_barcode", id: "builder/payment_create/store_barcode/invoice=False", scenario: SCENARIOS.fpStoreBarcode },
  { method: "ibon", id: "builder/payment_create/ibon/invoice=False", scenario: SCENARIOS.payIbon },
  { method: "famiport", id: "builder/payment_create/famiport/invoice=False", scenario: SCENARIOS.payFamiport },
  { method: "hilife", id: "builder/payment_create/hilife/invoice=False", scenario: SCENARIOS.payHilife },
] as const satisfies readonly { method: keyof typeof BOT_METHOD_LABELS.dropdown; id: SnapshotId; scenario: object }[];

export const GALLERY_ORDERS = ORDERS;

export function OrderGallery({ label = "各付款方式的訂單訊息" }: { label?: string }) {
  return (
    <SnapshotTabs
      label={label}
      tabs={ORDERS.map((o) => ({
        tab: BOT_METHOD_LABELS.dropdown[o.method],
        label: `${BOT_METHOD_LABELS.dropdown[o.method]}的訂單訊息`,
        content: (
          <MessageWindow channel={DEMO_CHANNELS.ticket.name}>
            <SnapshotMessage id={o.id} scenario={o.scenario} />
          </MessageWindow>
        ),
      }))}
    />
  );
}
