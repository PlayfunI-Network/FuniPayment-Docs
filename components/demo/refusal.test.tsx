// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { BOT_UI } from "@/content/bot-ui.generated";
import { Refusal } from "./refusal";

describe("Refusal", () => {
  it("draws an ephemeral refusal in a channel, under the command line", () => {
    const { container } = render(<Refusal id="server/checks/wrong_channel" command="balance show" label="x" />);
    expect(container.textContent).toContain("使用了");
    expect(container.textContent).toContain("/balance show");
    expect(container.textContent).toContain("只有你看得到這則訊息");
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("x");
  });

  it("draws the DM with the bot instead of a channel", () => {
    expect(BOT_UI["server/checks/dm"].ephemeral).toBe(true);
    const { container } = render(<Refusal id="server/checks/dm" command="payment review" dm label="x" />);
    expect(container.textContent).toContain("您無法在私人訊息使用此指令");
    expect(container.textContent).not.toContain("傳送訊息到 #");
  });

  it("fills the snapshot from the story SNAPSHOT_SCENARIOS names, unless told otherwise", () => {
    // flow/payment_create_command/method_disabled names the method: payFamiport's by default.
    const byDefault = render(<Refusal id="flow/payment_create_command/method_disabled" command="payment create" label="x" />);
    expect(byDefault.container.textContent).toContain("全家 FamiPort 代碼繳費");
    byDefault.unmount();
    const other = render(
      <Refusal id="flow/payment_create_command/method_disabled" command="payment create" scenario="payIbon" label="x" />,
    );
    expect(other.container.textContent).toContain("7-11 ibon 代碼繳費");
  });
});
