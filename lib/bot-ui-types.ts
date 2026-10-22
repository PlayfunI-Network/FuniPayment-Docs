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
  /**
   * How the bot sends it, which tells a demo where the message appears:
   * "response.send_message" / "followup.send" (a reply to the command; `ephemeral` says if only
   * the user sees it), "response.edit_message" / "edit_original_response" / "message.edit" (the
   * earlier message changes), "client.send_dm_to_user" / "Client.send_dm_to_user" (a DM to a
   * member), "client.send_to_log_channel" / "Client.send_to_log_channel" (the server's log
   * channel), "client.send_to_dm_and_log" (the buyer's DM and the log channel),
   * "client.notify_owner" (a DM to the server owner), "reply" (a reply, call not recorded),
   * "builder" (an embed builder: where it goes depends on the flow that uses it).
   */
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

// ---- Slash commands (tests/snapshots/commands.json) ----

/** Discord's application command option types, by name. */
export type CommandOptionType =
  | "string"
  | "integer"
  | "boolean"
  | "user"
  | "channel"
  | "role"
  | "mentionable"
  | "number"
  | "attachment";

/** Names and descriptions are what a zh-TW Discord client shows (the zh-TW localization, else the default). */
export type CommandOption = {
  name: string;
  nameZh: string;
  description: string;
  required: boolean;
  type: CommandOptionType;
  /** Choice labels as zh-TW Discord shows them, with the value the bot receives. */
  choices?: { label: string; value: string | number }[];
  channelTypes?: number[];
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  autocomplete?: boolean;
};

export type Subcommand = { name: string; nameZh: string; description: string; options: CommandOption[] };

export type CommandData = {
  /** The command name users type (English; none of the bot's commands has a zh-TW name today). */
  name: string;
  nameZh: string;
  description: string;
  /** A permission bit field as Discord stores it (e.g. 32 = 管理伺服器), or null for everyone. */
  defaultMemberPermissions: number | null;
  dmPermission: boolean;
  contexts: number[] | null;
  /** Options of a command without subcommands. */
  options: CommandOption[];
  subcommands: Subcommand[];
};
