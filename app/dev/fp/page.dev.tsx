// Dev-only: every screen of the /fp demo at canvas size, unscaled, in both layouts, for measuring
// where the camera and cursor aim (components/demos/payments/fp-demo.tsx, Layout.at).
import { FpScreens } from "./screens";

export const metadata = { title: "/fp demo 畫面（開發用）", robots: { index: false } };

export default function Page() {
  return <FpScreens />;
}
