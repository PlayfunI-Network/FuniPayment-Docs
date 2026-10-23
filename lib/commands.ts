// The slash commands as a zh-TW Discord client shows them, from COMMANDS (commands.json): a
// command or subcommand by its full name ("fp", "payment create"), and an option as the
// name | value pill the chat input shows once it is filled.
import { COMMANDS } from "@/content/bot-ui.generated";
import type { CommandOption } from "./bot-ui-types";

/** A command a user types: its full name, description and options. */
export type SlashCommand = { name: string; description: string; options: readonly CommandOption[] };

/** A filled option in the chat input: the option's zh-TW name and the value shown after it. */
export type OptionPill = { name: string; value: string };

/** `name` is the command ("fp", "top-up") or the command and its subcommand ("payment create"). */
export function slashCommand(name: string): SlashCommand {
  const [top, sub] = name.split(" ");
  const command = (COMMANDS as Record<string, (typeof COMMANDS)[keyof typeof COMMANDS]>)[top];
  if (!command) throw new Error(`commands.json 沒有 /${top}`);
  if (sub === undefined) return { name: command.name, description: command.description, options: command.options };
  const found = (command.subcommands as readonly { name: string; description: string; options: readonly CommandOption[] }[]).find(
    (s) => s.name === sub,
  );
  if (!found) throw new Error(`commands.json 沒有 /${top} ${sub}`);
  return { name: `${command.name} ${found.name}`, description: found.description, options: found.options };
}

/** The option `option` of `command`; throws when the command has no such option. */
export function commandOption(command: SlashCommand, option: string): CommandOption {
  const found = command.options.find((o) => o.name === option);
  if (!found) throw new Error(`/${command.name} 沒有參數 ${option}`);
  return found;
}

/**
 * The pill for `option` filled with `value`. For an option with choices, pass the choice's value
 * (e.g. "bank_transfer", 1): the pill shows its label, as Discord does.
 */
export function optionPill(command: SlashCommand, option: string, value: string | number): OptionPill {
  const o = commandOption(command, option);
  if (!o.choices) return { name: o.nameZh, value: String(value) };
  const choice = o.choices.find((c) => c.value === value);
  if (!choice) throw new Error(`/${command.name} ${option} 沒有選項 ${value}`);
  return { name: o.nameZh, value: choice.label };
}
