import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.SCOUTAI_STANDIN_PORT ?? "4173");

const sessionCookie = "scoutai_session=authenticated; Path=/; HttpOnly; SameSite=Lax";

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8", ...headers });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);

  if (url.pathname === "/login" && req.method === "GET") {
    const html = await readFile(path.join(publicDir, "login.html"), "utf8");
    return send(res, 200, html);
  }

  if (url.pathname === "/login" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    const params = new URLSearchParams(body);
    const user = params.get("username") ?? "";
    const password = params.get("password") ?? "";
    const expectedUser = process.env.SCOUTAI_USER ?? "";
    const expectedPassword = process.env.SCOUTAI_PASSWORD ?? "";

    if (user === expectedUser && password === expectedPassword) {
      res.writeHead(302, {
        Location: "/app",
        "Set-Cookie": sessionCookie,
      });
      return res.end();
    }

    res.writeHead(302, { Location: "/login?error=1" });
    return res.end();
  }

  if (url.pathname === "/app") {
    const cookie = req.headers.cookie ?? "";
    if (!cookie.includes("scoutai_session=authenticated")) {
      res.writeHead(302, { Location: "/login" });
      return res.end();
    }
    const html = await readFile(path.join(publicDir, "app.html"), "utf8");
    return send(res, 200, html);
  }

  if (url.pathname === "/") {
    res.writeHead(302, { Location: "/login" });
    return res.end();
  }

  send(res, 404, "<p>not found</p>");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[scoutai:standin] listening on http://127.0.0.1:${port}`);
});
