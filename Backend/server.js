const express = require("express");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(cors());

function readJSON(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

// HTTP + WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/api/catfood", (req, res) => res.json(readJSON("catfood.json")));

server.listen(3000, () => console.log("Backend + WS running on http://localhost:3000"));
