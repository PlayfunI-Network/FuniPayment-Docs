// Dev-only showcase of the Discord kit (exists under `next dev` only, see next.config.mjs).
// The kit sections use placeholder texts for checking the layout; the 「bot 原文」 section draws
// the bot's real messages from content/bot-ui.generated.ts (npm run sync:bot).
import type { ReactNode } from "react";
import {
  ActionRow,
  Attachment,
  ChannelList,
  DiscordButton,
  DiscordMarkdown,
  DiscordWindow,
  DmWindow,
  Embed,
  Ephemeral,
  Message,
  Modal,
  SelectMenu,
  SlashPicker,
  VoiceChannel,
} from "@/components/discord";
import { SnapshotMessage } from "@/components/demo";
import { BOT_UI } from "@/content/bot-ui.generated";
import { DEMO_BUYER_INFO, DEMO_NOW, DEMO_PEOPLE, DEMO_SCENARIO, discordTime } from "@/lib/scenario";

export const metadata = { title: "Discord 元件（開發用）", robots: { index: false } };

const BOT = "/brand/funi-icon.png";
const MERCHANT = { initial: "商", color: "#5865f2" };
const CUSTOMER = { initial: "顧", color: "#3ba55c" };

/** A fake Code 39-looking barcode as an SVG data URL (the real one comes from the bot later). */
function barcodeSrc(): string {
  const widths = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1];
  let x = 20;
  const bars = widths
    .map((w, i) => {
      const bar = i % 2 === 0 ? `<rect x="${x}" y="16" width="${w * 3}" height="70" fill="#000"/>` : "";
      x += w * 3;
      return bar;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${x + 20}" height="110"><rect width="100%" height="100%" fill="#fff"/>${bars}<text x="50%" y="104" font-family="monospace" font-size="12" text-anchor="middle">ABC1234567</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DiscordShowcase() {
  return (
    <main className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-10 px-4 py-10">
      <h1 className="text-2xl font-bold">Discord 元件（開發用）</h1>

      <Section title="頻道視窗：訊息、embed、按鈕、選單、斜線指令">
        <DiscordWindow title="付款通知" kind="channel">
          <Message author="商家" avatar={MERCHANT} time="今天 下午 2:14" nameColor="#f0b232">
            <DiscordMarkdown text="一般文字訊息，含 **粗體**、__底線__、*斜體*、[連結](https://example.com) 和 <@顧客> 提及。" />
          </Message>
          <Message
            author="FunI 付款系統"
            avatar={BOT}
            bot
            time="今天 下午 2:15"
            interaction={{ user: "商家", avatar: MERCHANT, command: "fp" }}
          >
            <Embed
              color={0x00b7ff}
              author={{ name: "星光遊戲社", icon: { initial: "星", color: "#eb459e" } }}
              title="範例 embed 標題"
              description={"第一行說明文字，**粗體** 與 <t:3 分鐘前:R>\n第二行說明文字"}
              fields={[
                { name: "欄位一", value: "NT$ 500", inline: true },
                { name: "欄位二", value: "NT$ 15", inline: true },
                { name: "欄位三", value: "NT$ 515", inline: true },
                { name: "代碼欄位", value: "ABCD1234567890", code: true, emphasis: true },
              ]}
              thumbnail={BOT}
              footer="Powered by PlayfunI Network"
              footerIcon="/brand/playfuni-icon.png"
              timestamp="今天 下午 2:15"
            />
            <ActionRow>
              <DiscordButton label="主要按鈕" style="primary" />
              <DiscordButton label="次要按鈕" style="secondary" />
              <DiscordButton label="成功" style="success" />
              <DiscordButton label="危險" style="danger" />
              <DiscordButton label="連結按鈕" style="link" />
              <DiscordButton label="按下中" style="primary" active />
            </ActionRow>
            <SelectMenu placeholder="請選擇一個選項" options={[{ label: "選項一" }, { label: "選項二" }]} />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time="今天 下午 2:16">
            <Ephemeral>
              <Embed color={0x0fae22} title="只有你看得到的回覆" description="說明文字" />
            </Ephemeral>
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time="今天 下午 2:17">
            <SelectMenu
              placeholder="請選擇一個選項"
              open
              options={[{ label: "選項一" }, { label: "選項二", selected: true }, { label: "選項三" }]}
            />
          </Message>
          <SlashPicker command="fp" description="指令說明文字" appName="FunI 付款系統" />
          <SlashPicker command="fp" description="指令說明文字" appName="FunI 付款系統" option={{ name: "金額", value: "500" }} />
        </DiscordWindow>
      </Section>

      <Section title="bot 原文（ui.json 第一批 key，示範情境 500 元・四大超商條碼）">
        <DiscordWindow title="訂單-a1024" kind="channel">
          <Message
            author="FunI 付款系統"
            avatar={BOT}
            bot
            time={discordTime(DEMO_NOW)}
            interaction={{ user: DEMO_PEOPLE.admin.name, avatar: DEMO_PEOPLE.admin.avatar, command: "fp" }}
          >
            <SnapshotMessage id="flow/fp_command/ok" scenario={DEMO_SCENARIO} />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="flow/fp_command/ok" scenario={DEMO_SCENARIO} selected="store_barcode" />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="flow/fp_method_confirm" scenario={DEMO_SCENARIO} />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="builder/consumer_info/filled=False/cancel_first=False" scenario={DEMO_SCENARIO} />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="builder/consumer_info/filled=True/cancel_first=False" scenario={DEMO_SCENARIO} />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={DEMO_SCENARIO} />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="builder/payment_complete" scenario={DEMO_SCENARIO} />
          </Message>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="guide/welcome/channel_web" scenario={DEMO_SCENARIO} />
          </Message>
        </DiscordWindow>
        <DmWindow peer="FunI 付款系統" avatar={BOT}>
          <Message author="FunI 付款系統" avatar={BOT} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="guide/welcome/dm_web" scenario={DEMO_SCENARIO} />
          </Message>
        </DmWindow>
        <div className="flex min-w-0 justify-center rounded-lg bg-black/70 p-4 sm:p-10">
          <Modal
            title={BOT_UI["modal/consumer_info"].title}
            fields={BOT_UI["modal/consumer_info"].fields.map((f) => ({
              label: f.label,
              required: f.required,
              value: { name: DEMO_BUYER_INFO.name, mail: DEMO_BUYER_INFO.email, phone: DEMO_BUYER_INFO.phone }[f.id],
            }))}
          />
        </div>
      </Section>

      <Section title="私訊視窗與附件">
        <DmWindow peer="顧客" avatar={CUSTOMER}>
          <Message author="FunI 付款系統" avatar={BOT} bot time="今天 下午 2:20">
            <Embed color={0x2b3f5e} title="範例私訊 embed" description="說明文字" footer="Powered by PlayfunI Network" />
            <Attachment src={barcodeSrc()} alt="繳費條碼" width={230} height={110} />
          </Message>
        </DmWindow>
      </Section>

      <Section title="Modal">
        <div className="flex min-w-0 justify-center rounded-lg bg-black/70 p-4 sm:p-10">
          <Modal
            title="範例表單標題"
            fields={[
              { label: "欄位一", value: "已經填好的值", required: true },
              { label: "欄位二", placeholder: "提示文字", required: true },
              { label: "欄位三" },
            ]}
          />
        </div>
      </Section>

      <Section title="頻道列表與語音頻道">
        <div className="flex flex-wrap items-start gap-6">
          <ChannelList
            categories={[
              { name: "文字頻道", channels: [{ name: "一般" }, { name: "付款通知", highlight: true }] },
              { name: "已完成", channels: [{ name: "訂單-0001" }, { name: "很長很長很長很長很長的頻道名稱會被截斷" }] },
            ]}
          />
          <div className="flex flex-col gap-3">
            <VoiceChannel name="線上人數：12" />
            <VoiceChannel name="選取中的語音頻道" highlight />
          </div>
        </div>
      </Section>
    </main>
  );
}
