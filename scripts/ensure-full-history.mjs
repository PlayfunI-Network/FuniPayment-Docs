// Before next build: pages get their last-updated dates from git, which needs the whole history.
// A build host may clone shallowly, so try to fetch the rest. If that fails the build still goes
// on, and lib/last-modified leaves the dates out instead of showing wrong ones.
import { execFileSync } from "node:child_process";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

try {
  if (git("rev-parse", "--is-shallow-repository") === "true") {
    git("fetch", "--unshallow");
    console.log("ensure-full-history：已取得完整 git 歷史");
  }
} catch {
  console.warn("ensure-full-history：無法取得完整 git 歷史，這次建置的頁面不會有最後更新日期");
}
