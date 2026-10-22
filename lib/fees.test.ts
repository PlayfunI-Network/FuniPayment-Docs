import { calculateFee, DEFAULT_FEES, EXTRA_FEE_THRESHOLD, IBON_EXTRA_FEE } from "./fees";

test("預設手續費", () => {
  expect(calculateFee("bank_transfer", 500)).toBe(13);
  expect(calculateFee("store_barcode", 500)).toBe(25);
  expect(calculateFee("famiport", 2000)).toBe(35); // 全家不加收
  expect(calculateFee("balance", 500)).toBe(0);
});

test("7-11 與萊爾富：金額加手續費超過 1000 才加收 5 元", () => {
  expect(calculateFee("ibon", 970)).toBe(30); // 970+30 = 1000，不加
  expect(calculateFee("ibon", 971)).toBe(35);
  expect(calculateFee("hilife", 1500)).toBe(35);
});

test("常數與 bot 的預設值一樣", () => {
  expect(DEFAULT_FEES).toEqual({ bank_transfer: 13, store_barcode: 25, ibon: 30, famiport: 35, hilife: 30 });
  expect(IBON_EXTRA_FEE).toBe(5);
  expect(EXTRA_FEE_THRESHOLD).toBe(1000);
});

test("可以傳入商家自訂的手續費與加收金額", () => {
  const fees = { ...DEFAULT_FEES, ibon: 28 };
  expect(calculateFee("ibon", 900, fees)).toBe(28);
  expect(calculateFee("ibon", 990, fees, 8)).toBe(36);
  expect(calculateFee("balance", 990, fees, 8)).toBe(0);
});
