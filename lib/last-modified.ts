// When each docs page last changed, from git: read at build time only (the site is static).
import { execFileSync } from "node:child_process";

const DATE_MARK = "@@";

/** `git log --format=@@%cI --name-only`, newest first -> each file's newest date. */
export function parseGitLog(output: string): Map<string, string> {
  const dates = new Map<string, string>();
  let date = "";
  for (const raw of output.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    if (line.startsWith(DATE_MARK)) date = line.slice(DATE_MARK.length);
    else if (!dates.has(line)) dates.set(line, date);
  }
  return dates;
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
}

/**
 * Empty when the dates cannot be trusted: no git, or a shallow clone, where a file untouched since
 * the clone's cut-off would get the cut-off commit's date. No date is better than a wrong one.
 */
function readDates(): Map<string, string> {
  try {
    if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
      console.warn("last-modified：這是 shallow clone，頁面不輸出最後更新日期");
      return new Map();
    }
    return parseGitLog(git(["log", `--format=${DATE_MARK}%cI`, "--name-only", "--relative=content/docs", "--", "content/docs"]));
  } catch {
    console.warn("last-modified：讀不到 git 紀錄，頁面不輸出最後更新日期");
    return new Map();
  }
}

let cache: Map<string, string> | undefined;

/** The ISO date of a page's last commit; `path` is relative to content/docs. */
export function lastModifiedOf(path: string): string | undefined {
  cache ??= readDates();
  return cache.get(path.replace(/\\/g, "/"));
}
