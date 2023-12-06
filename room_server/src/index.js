import { Server } from 'socket.io';
import { io as socketClient, Socket } from "socket.io-client"; 

import { updateReplicas, startGame } from "./game.js";

import registerClientHandlers from "./clientHandler.js";
import registerServerHandlers from "./serverHandler.js";

// A simple http server to ping:
import http from 'http';

const server = http.createServer((req, res) => {
  console.log("ping")
  res.writeHead(200);
  res.end('ok');
});
server.listen(process.env.PORT);

const NAME = process.env.NAME;
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

/**
 * @type {Socket[]}
 */
const serverSockets = neighbourList.map(
  address => socketClient(address, { auth: { type: "room" } })
);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const USER = "user";
const ROOM = "room";

// Connections from clients
io.on('connection', (socket) => {
  const auth = socket.handshake.auth;
  if (auth.type == USER) {
    registerClientHandlers(io, socket);
  }
  if (auth.type == ROOM) {
    registerServerHandlers(io, socket);
  }
});


// Start the game
startGame(io, serverSockets);
console.log(`${NAME}, PORT = ${process.env.PORT}`)

// Ping neighbours after 1 second
setTimeout(() => neighbourList.map(async (address) => {
  try {
    const res = await fetch(address)
    console.log("neighbour", address, await res.text())
  } catch (e) {
    console.error("neighbour", address, e)
  }
}), 1000)
