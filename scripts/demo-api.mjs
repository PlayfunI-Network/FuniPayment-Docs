// A proxy in front of the bot repo's fake dashboard API that swaps in 星光遊戲社's invented data
// (scripts/demo-data.mjs rewrite) for the dashboard screenshots. Copied from
// funipay_site/scripts/demo-api.mjs; the rewrites themselves moved to demo-data.mjs.
// Run: node <bot>/web/e2e/fake-api.mjs 8399, then `node scripts/demo-api.mjs 8398 8399`, and point
// the dashboard's FUNIPAY_API_URL at :8398. npm run capture does all of this.
import { createServer, request } from "node:http";
import { findBanned, rewrite } from "./demo-data.mjs";

const [port = 8398, upstream = 8399] = process.argv.slice(2).map(Number);

createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const proxied = request(
      { host: "127.0.0.1", port: upstream, path: req.url, method: req.method, headers: { ...req.headers, host: `127.0.0.1:${upstream}` } },
      (up) => {
        const parts = [];
        up.on("data", (c) => parts.push(c));
        up.on("end", () => {
          let body = Buffer.concat(parts);
          const isJson = (up.headers["content-type"] ?? "").includes("json") && up.statusCode === 200 && req.method === "GET";
          if (isJson) {
            const text = JSON.stringify(rewrite(url.pathname, JSON.parse(body.toString("utf8"))));
            const left = findBanned(text);
            if (left.length) console.error(`demo-api: ${url.pathname} 還有「${left.join("」「")}」`);
            body = Buffer.from(text);
          }
          const headers = { ...up.headers };
          delete headers["content-length"];
          delete headers["transfer-encoding"];
          res.writeHead(up.statusCode ?? 502, { ...headers, "content-length": body.length });
          res.end(body);
        });
      },
    );
    proxied.on("error", () => {
      res.writeHead(502);
      res.end();
    });
    proxied.end(Buffer.concat(chunks));
  });
}).listen(port, "127.0.0.1");
