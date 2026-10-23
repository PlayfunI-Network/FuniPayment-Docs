import { COMMANDS } from "@/content/bot-ui.generated";
import { commandOption, optionPill, slashCommand } from "./commands";

describe("slashCommand", () => {
  it("finds a command and a subcommand by its full name", () => {
    expect(slashCommand("fp")).toMatchObject({ name: "fp", description: COMMANDS.fp.description });
    const create = slashCommand("payment create");
    expect(create.name).toBe("payment create");
    expect(create.description).toBe(COMMANDS.payment.subcommands.find((s) => s.name === "create")?.description);
    expect(slashCommand("balance history").options.map((o) => o.name)).toContain("mode");
  });

  it("throws on a command commands.json does not have", () => {
    expect(() => slashCommand("nope")).toThrow("/nope");
    expect(() => slashCommand("payment nope")).toThrow("/payment nope");
  });
});

describe("optionPill", () => {
  it("shows the option's zh-TW name and the value as typed", () => {
    const fp = slashCommand("fp");
    expect(optionPill(fp, "amount", 500)).toEqual({ name: commandOption(fp, "amount").nameZh, value: "500" });
  });

  it("shows a choice's label for its value", () => {
    const create = slashCommand("payment create");
    const method = commandOption(create, "method");
    const bank = method.choices?.find((c) => c.value === "bank_transfer");
    expect(optionPill(create, "method", "bank_transfer")).toEqual({ name: method.nameZh, value: bank?.label });
  });

  it("throws on an option or a choice the command does not have", () => {
    const create = slashCommand("payment create");
    expect(() => optionPill(create, "nope", 1)).toThrow("沒有參數 nope");
    expect(() => optionPill(create, "method", "nope")).toThrow("沒有選項 nope");
  });
});
