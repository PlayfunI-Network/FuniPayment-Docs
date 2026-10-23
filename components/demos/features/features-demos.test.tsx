// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import type { DemoStep } from "@/components/demo";
import { BOT_UI } from "@/content/bot-ui.generated";
import type { MessageEntry } from "@/lib/bot-ui-types";
import { DEMO_CHANNELS } from "@/lib/scenario";
import * as publish from "./auto-publish-demo";
import * as reply from "./auto-reply-demo";
import { DashboardCommandReplies, REPLIES } from "./dashboard-command-replies";
import * as vc from "./dynamic-vc-demo";
import { VcRemovedDm } from "./vc-removed-dm";

type Steps = (DemoStep & { screen: unknown })[];
type Any = ComponentType<{ screen: never; layout: never }>;
const DEMOS: [string, Any, Record<string, unknown>, Steps, Steps][] = [
  ["auto publish", publish.AutoPublishScreen as Any, publish.LAYOUTS, publish.WIDE_STEPS, publish.NARROW_STEPS],
  ["dynamic vc rename", vc.DynamicVcScreen as Any, vc.LAYOUTS, vc.WIDE_STEPS, vc.NARROW_STEPS],
  ["auto reply", reply.AutoReplyScreen as Any, reply.LAYOUTS, reply.WIDE_STEPS, reply.NARROW_STEPS],
];

describe.each(DEMOS)("%s demo", (_, Screen, layouts, wide, narrow) => {
  it.each([
    ["wide", wide],
    ["narrow", narrow],
  ])("%s timeline runs 6 to 15 seconds, in order, aiming inside the screen", (__, steps) => {
    expect(steps[steps.length - 1].at).toBeGreaterThanOrEqual(6000);
    expect(steps[steps.length - 1].at).toBeLessThanOrEqual(15000);
    steps.forEach((s, i) => {
      if (i > 0) expect(s.at).toBeGreaterThan(steps[i - 1].at);
      for (const v of [s.cursor?.x, s.cursor?.y, s.shot?.focus?.x, s.shot?.focus?.y]) {
        if (v === undefined) continue;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    });
    // Reduced motion shows only the last step: it has to be the finished story.
    expect(steps[steps.length - 1].screen).toEqual(steps[steps.length - 2].screen);
  });

  it("draws every screen of the story from the snapshots", () => {
    for (const layout of Object.values(layouts)) {
      for (const step of wide) {
        const { unmount } = render(<Screen screen={step.screen as never} layout={layout as never} />);
        unmount();
      }
    }
  });
});

describe("snapshot assumptions", () => {
  it("the /dynamic-vc-rename reply names the template the demo types, and the voice channel the snapshots name", () => {
    expect(BOT_UI["server/direct_rename/ok"].content).toContain(`**__${vc.TEMPLATE}__**`);
    expect(vc.VOICE.after).toBe(DEMO_CHANNELS.voice.name);
  });

  it("the auto reply's DM text contains a trigger word", () => {
    // app/i18n/server.py AUTO_REPLY_TRIGGERS: 在嗎 is one of them.
    expect(reply.TYPED).toContain("在嗎");
    expect(BOT_UI["server/auto_reply/dm_trigger"].content).toBe(BOT_UI["server/auto_reply/server_mention"].content);
  });

  it("/auto-publish answers in the channel for everyone to see", () => {
    expect(BOT_UI["server/auto_publish/add_ok"].ephemeral).toBe(false);
  });
});

describe("/dashboard and /settings replies", () => {
  it("shows every reply behind its tab, with the 只有你看得到 line", () => {
    render(<DashboardCommandReplies />);
    for (const r of REPLIES) {
      fireEvent.click(screen.getByRole("tab", { name: r.tab }));
      const panel = screen.getByRole("tabpanel");
      expect(panel.textContent).toContain((BOT_UI[r.id] as MessageEntry).embeds[0].title);
      expect(panel.textContent).toContain("只有你看得到這則訊息");
    }
  });

  it("the not-set-up /dashboard reply has 開始設定 before 開啟後台", () => {
    const labels = BOT_UI["guide/dashboard/not_set_up_web"].components.map((c) => c.type === "button" && c.label);
    expect(labels).toEqual(["開始設定", "開啟後台"]);
  });
});

it("the removed-voice-channel DM draws", () => {
  const { container } = render(<VcRemovedDm />);
  expect(container.textContent).toContain("我們已暫時移除該頻道的動態命名功能");
});
