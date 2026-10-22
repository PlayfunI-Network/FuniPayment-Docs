// Draws a bot message straight from content/bot-ui.generated.ts (the bot's ui.json), filled
// for a demo scenario. Demos decide when a message appears; the words, field order, colours,
// buttons and menus always come from the snapshot.
import type { ReactNode } from "react";
import {
  ActionRow,
  DiscordButton,
  DiscordMarkdown,
  Embed,
  Ephemeral,
  SelectMenu,
  type EmbedField,
} from "@/components/discord";
import type { ComponentData, EmbedData, SnapshotEntry } from "@/lib/bot-ui-types";
import { DEMO_NOW, discordTime, fillSnapshot, type Scenario, type SnapshotId } from "@/lib/scenario";

/** A field value the bot wraps in ``` is a code block; anything else is markdown. */
function toField(f: { name: string; value: string; inline: boolean }): EmbedField {
  const code = f.value.match(/^```\n?([\s\S]*?)```$/);
  if (!code && f.value.includes("```")) throw new Error(`欄位「${f.name}」混了程式碼區塊和文字，Embed 還畫不出來`);
  return code ? { name: f.name, value: code[1], code: true, inline: f.inline } : { name: f.name, value: f.value, inline: f.inline };
}

function SnapshotEmbedView({ embed, now }: { embed: EmbedData; now: Date }) {
  return (
    <Embed
      color={embed.color ?? 0x1e1f22}
      author={embed.author && { name: embed.author.name, icon: embed.author.icon_url }}
      title={embed.title}
      titleLink={!!embed.url}
      description={embed.description}
      fields={embed.fields?.map(toField)}
      thumbnail={embed.thumbnail?.url}
      image={
        embed.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={embed.image.url} alt="" draggable={false} className="block h-auto max-h-[300px] w-auto max-w-full" />
        )
      }
      footer={embed.footer?.text}
      // "" (not undefined) so a footer without an icon does not get Embed's default icon.
      footerIcon={embed.footer?.icon_url ?? ""}
      timestamp={embed.has_timestamp ? discordTime(now) : undefined}
    />
  );
}

/** discord.py lays out a view's items in order: up to 5 buttons per row, a select on its own row. */
function rows(components: ComponentData[]): ComponentData[][] {
  const out: ComponentData[][] = [];
  for (const c of components) {
    const last = out[out.length - 1];
    if (c.type === "button" && last && last[0].type === "button" && last.length < 5) last.push(c);
    else out.push([c]);
  }
  return out;
}

/** The select menu opened, upward or downward, with the option `active` (by value) pointed at. */
export type MenuState = { open: "up" | "down"; active?: string };

function Components({
  components,
  selected,
  menu,
}: {
  components: ComponentData[];
  selected?: string;
  menu?: MenuState;
}) {
  return rows(components).map((row, i) => {
    const first = row[0];
    if (first.type === "select") {
      if (first.options.some((o) => o.description)) throw new Error("選單選項的說明文字還畫不出來");
      for (const value of [selected, menu?.active]) {
        if (value && !first.options.some((o) => o.value === value)) throw new Error(`選單沒有選項 ${value}`);
      }
      return (
        <SelectMenu
          key={i}
          placeholder={first.placeholder}
          open={!!menu}
          up={menu?.open === "up"}
          options={first.options.map((o) => ({
            label: o.label,
            selected: selected ? o.value === selected : o.default,
            active: o.value === menu?.active,
          }))}
        />
      );
    }
    return (
      <ActionRow key={i}>
        {row.map((b, j) =>
          b.type === "button" ? <DiscordButton key={j} label={b.label} style={b.style} disabled={b.disabled} /> : null,
        )}
      </ActionRow>
    );
  });
}

function pick(id: SnapshotId, scenario: Scenario, now: Date, at: "send" | "followup"): SnapshotEntry {
  const entry = fillSnapshot(id, scenario, now);
  if (at === "send") return entry;
  if (!entry.followup) throw new Error(`${id} 沒有 followup 訊息`);
  return entry.followup;
}

/**
 * The message's content: text, embeds, then the button rows and select menus, with the
 * 「只有你看得到這則訊息」 line when the bot sent it ephemeral. Put it inside a `Message`.
 * `selected` shows that option (by value, e.g. "store_barcode") chosen in the select menu;
 * `menu` shows the menu open.
 */
export function SnapshotMessage({
  id,
  scenario,
  at = "send",
  selected,
  menu,
  now = DEMO_NOW,
}: {
  id: SnapshotId;
  scenario: Scenario;
  at?: "send" | "followup";
  selected?: string;
  menu?: MenuState;
  now?: Date;
}) {
  const msg = pick(id, scenario, now, at);
  const body: ReactNode = (
    <>
      {msg.content != null && (
        <div>
          <DiscordMarkdown text={msg.content} />
        </div>
      )}
      {msg.embeds.map((e, i) => (
        <SnapshotEmbedView key={i} embed={e} now={now} />
      ))}
      <Components components={msg.components} selected={selected} menu={menu} />
    </>
  );
  return <div className="flex min-w-0 flex-col gap-1">{msg.ephemeral ? <Ephemeral>{body}</Ephemeral> : body}</div>;
}

/** Only the embed (the first one unless `index` says otherwise), without buttons or menus. */
export function SnapshotEmbed({
  id,
  scenario,
  index = 0,
  at = "send",
  now = DEMO_NOW,
}: {
  id: SnapshotId;
  scenario: Scenario;
  index?: number;
  at?: "send" | "followup";
  now?: Date;
}) {
  const embed = pick(id, scenario, now, at).embeds[index];
  if (!embed) throw new Error(`${id} 沒有第 ${index + 1} 個 embed`);
  return <SnapshotEmbedView embed={embed} now={now} />;
}
