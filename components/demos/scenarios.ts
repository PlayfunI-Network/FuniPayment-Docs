// The demo stories every page's demo draws from. A phase 2 demo reuses one of these when its
// story fits (the same shop, people, amount and order id across pages), and adds its own only
// when it needs another amount or method.
import { DEMO_PEOPLE, type Scenario } from "@/lib/scenario";

export const SCENARIOS = {
  /**
   * 星光遊戲社 bills the customer 500 with /fp; the customer pays at a store with the barcode
   * (+25 fee, total 525: the only total public/demo/barcodes.png encodes). The order id has the
   * 12 digits of a SmilePay 付款編號.
   */
  fpStoreBarcode: {
    shop: DEMO_PEOPLE.shop.name,
    buyer: DEMO_PEOPLE.buyer.name,
    admin: DEMO_PEOPLE.admin.name,
    amount: 500,
    method: "store_barcode",
    orderId: "241021387465",
  },
} as const satisfies Record<string, Scenario>;
