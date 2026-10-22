// Shapes of content/bot-ui.generated.ts (written by scripts/sync-bot-ui.mjs from the bot's
// tests/snapshots/ui.json). Strings hold `{token}` placeholders that lib/scenario.ts fills.
import type { Method } from "./fees";

/** One embed, with the fields ui.json has (flags and type dropped). Colour is decimal. */
export type EmbedData = {
  title?: string;
  description?: string;
  color?: number;
  url?: string;
  author?: { name: string; icon_url?: string };
  fields?: { name: string; value: string; inline: boolean }[];
  footer?: { text: string; icon_url?: string };
  thumbnail?: { url: string };
  image?: { url: string };
  has_timestamp: boolean;
};

export type ButtonStyle = "primary" | "secondary" | "success" | "danger" | "link";

export type ComponentData =
  | { type: "button"; label: string; style: ButtonStyle; disabled: boolean; url: string | null }
  | {
      type: "select";
      placeholder: string;
      disabled: boolean;
      options: { label: string; value: string; description: string | null; default: boolean }[];
    };

/** What one message call shows (send, edit or followup), in the bot's order. */
export type SnapshotEntry = {
  content?: string;
  embeds: EmbedData[];
  components: ComponentData[];
  ephemeral: boolean;
};

export type MessageEntry = SnapshotEntry & {
  kind: "message";
  /** The ui.json call this came from, e.g. "response.send_message" (builders: "builder"). */
  via: string;
  /** Set when the screen exists for one payment method only (e.g. the store barcode order). */
  method?: Method;
  /** The flow's followup.send, when it has one. */
  followup?: SnapshotEntry & { via: string };
};

export type ModalEntry = {
  kind: "modal";
  title: string;
  fields: { id: string; label: string; required: boolean; maxLength: number }[];
};

/** The four status names a ticket channel can be renamed / moved for. */
export type ChannelStatus = "selecting" | "pending" | "complete" | "expired";

export type ChannelDefaultsEntry = {
  kind: "channel_defaults";
  /** Default rename template per status; null = the bot does not rename. */
  rename: Record<ChannelStatus, string | null>;
  /** The stored value meaning "do not rename" (settings_schema.DISABLED_RENAME). */
  disabledValue: string;
  maxLength: number;
};

export type BotUiEntry = MessageEntry | ModalEntry | ChannelDefaultsEntry;
