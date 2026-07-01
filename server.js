const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "docs");
const port = Number(process.env.PORT || 10000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8"
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const candidate = path.normalize(path.join(root, clean || "index.html"));
  return candidate.startsWith(root) ? candidate : path.join(root, "index.html");
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(path.join(root, "index.html")));
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": types[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let filePath = safePath(req.url || "/");
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  sendFile(res, filePath);
});

server.listen(port, () => {
  console.log(`Alborz NPEG site is running on port ${port}`);
});
