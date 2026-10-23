// The command list on /reference/commands, built from COMMANDS (the bot's commands.json): every
// command and subcommand with its description and options as a zh-TW Discord client shows them.
// Only who may use each one and the page that explains it are written here (WHO, from
// app/bot/checks.py and the cogs' decorators); the test fails when commands.json gains or loses
// a command, so this list cannot fall behind.
import { COMMANDS } from "@/content/bot-ui.generated";
import type { CommandData, CommandOption } from "@/lib/bot-ui-types";

/** Who may use a command, and the page about it, by full command name ("payment create"). */
export const WHO: Record<string, { who: string; page: string }> = {
  "auto-publish": { who: "有「管理頻道」權限的人", page: "/features/auto-publish" },
  "balance show": { who: "所有人；查別人限點數管理員身分組", page: "/balance/balance-show" },
  "balance transfer": { who: "所有人", page: "/balance/balance-transfer" },
  "balance add": { who: "點數管理員身分組", page: "/balance/balance-add-set" },
  "balance set": { who: "點數管理員身分組", page: "/balance/balance-add-set" },
  "balance history": { who: "所有人；查別人限點數管理員身分組", page: "/balance/balance-history" },
  dashboard: { who: "有「管理伺服器」權限的人", page: "/features/dashboard-command" },
  "dynamic-vc-rename": { who: "有「管理頻道」權限的人", page: "/features/dynamic-vc-rename" },
  fp: { who: "管理員身分組", page: "/payments/fp" },
  "payment create": { who: "所有人；後台限定身分組時，只有那些身分組和管理員", page: "/payments/payment-create" },
  "payment review": { who: "所有人；查別人的訂單限管理員身分組", page: "/payments/payment-review" },
  "payment history": { who: "所有人；查別人限管理員身分組", page: "/payments/payment-history" },
  "payment recheck": { who: "管理員身分組", page: "/payments/payment-recheck" },
  settings: { who: "所有人", page: "/features/dashboard-command" },
  "top-up": { who: "所有人", page: "/balance/top-up" },
};

export type CommandRow = { name: string; description: string; options: readonly CommandOption[] };

/** Every command a user can type, subcommands spelled out, in commands.json order. */
export function commandRows(): CommandRow[] {
  return (Object.values(COMMANDS) as CommandData[]).flatMap((c) =>
    c.subcommands.length > 0
      ? c.subcommands.map((s) => ({ name: `${c.name} ${s.name}`, description: s.description, options: s.options }))
      : [{ name: c.name, description: c.description, options: c.options }],
  );
}

function Options({ options }: { options: readonly CommandOption[] }) {
  if (options.length === 0) return <span className="text-fd-muted-foreground">沒有</span>;
  return (
    <>
      {options.map((o, i) => (
        <span key={o.name}>
          {i > 0 && "、"}
          {o.nameZh}
          {!o.required && <span className="text-fd-muted-foreground">（選填）</span>}
        </span>
      ))}
    </>
  );
}

export function CommandTable() {
  return (
    // Scrolls sideways on a phone instead of squeezing the columns to a character each.
    <div className="overflow-x-auto">
    <table className="min-w-[640px]">
      <thead>
        <tr>
          <th>指令</th>
          <th>Discord 上的說明</th>
          <th>參數</th>
          <th>誰可以用</th>
        </tr>
      </thead>
      <tbody>
        {commandRows().map((row) => {
          const who = WHO[row.name];
          return (
            <tr key={row.name}>
              <td className="whitespace-nowrap">
                <a href={who.page}>
                  <code>/{row.name}</code>
                </a>
              </td>
              <td>{row.description}</td>
              <td>
                <Options options={row.options} />
              </td>
              <td>{who.who}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
