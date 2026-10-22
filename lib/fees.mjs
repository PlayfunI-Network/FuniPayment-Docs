// The bot's fee rule (app/services/fees.py) with its default fees (app/db/settings_schema.py
// PaymentConfig). Plain JS with JSDoc types so node scripts (sync-bot-ui) and the site share it;
// TypeScript imports it through lib/fees.ts. `npm run sync:bot` fails if the bot's defaults change.

/** @typedef {"bank_transfer" | "store_barcode" | "ibon" | "famiport" | "hilife" | "balance"} Method */
/** @typedef {Exclude<Method, "balance">} SmilePayMethod */

/** @type {Readonly<Record<SmilePayMethod, number>>} */
export const DEFAULT_FEES = Object.freeze({ bank_transfer: 13, store_barcode: 25, ibon: 30, famiport: 35, hilife: 30 });

/** PaymentConfig.ibon_extra_fee: added for 7-11 ibon and HiLife over the threshold. */
export const IBON_EXTRA_FEE = 5;

/** fees.EXTRA_FEE_THRESHOLD: the extra fee applies when amount + fee is over this. */
export const EXTRA_FEE_THRESHOLD = 1000;

/** fees.EXTRA_FEE_METHODS */
export const EXTRA_FEE_METHODS = Object.freeze(/** @type {const} */ (["ibon", "hilife"]));

/** Every method in the bot's dropdown order (balance last). @type {readonly Method[]} */
export const METHODS = Object.freeze(["bank_transfer", "store_barcode", "ibon", "famiport", "hilife", "balance"]);

/**
 * services.fees.calculate_fee. Paying with balance has no fee.
 * @param {Method} method
 * @param {number} amount the order amount, without the fee
 * @param {Readonly<Record<SmilePayMethod, number>>} [fees]
 * @param {number} [extra] the extra fee for ibon / hilife
 * @returns {number}
 */
export function calculateFee(method, amount, fees = DEFAULT_FEES, extra = IBON_EXTRA_FEE) {
  if (method === "balance") return 0;
  let fee = fees[method];
  if ((method === "ibon" || method === "hilife") && amount + fee > EXTRA_FEE_THRESHOLD) fee += extra;
  return fee;
}
