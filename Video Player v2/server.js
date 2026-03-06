const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const BASE_DIR = path.join(__dirname, "src");

const server = http.createServer((req, res) => {
  let filePath = path.join(BASE_DIR, req.url === "/" ? "index.html" : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // Default to index.html for root
  if (req.url === "/") {
    filePath = path.join(BASE_DIR, "index.html");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("Not Found");
      } else {
        res.writeHead(500);
        res.end("Server Error");
      }
      return;
    }

    // Set content type
    const ext = path.extname(filePath);
    let contentType = "text/html";
    if (ext === ".css") contentType = "text/css";
    if (ext === ".js") contentType = "text/javascript";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🎬 YouTube Video Player running at http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop the server");
});
