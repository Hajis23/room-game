import { Server } from 'socket.io';
import { io as socketClient, Socket } from "socket.io-client"; 

import { updateReplicas, startGame } from "./game.js";

import registerClientHandlers from "./clientHandler.js";
import registerServerHandlers from "./serverHandler.js";

// A simple http server to ping:
import http from 'http';

const clientServer = http.createServer((req, res) => {
  console.log("client server pinged")
  res.writeHead(200);
  res.end('ok');
});
clientServer.listen(process.env.CLIENT_PORT);

const serverServer = http.createServer((req, res) => {
  console.log("server server pinged")
  res.writeHead(200);
  res.end('ok');
})
serverServer.listen(process.env.SERVER_PORT);

const NAME = process.env.NAME;
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

/**
 * @type {Socket[]}
 */
const serverSockets = neighbourList.map(address => socketClient(address));

const server_io = new Server(serverServer, {
  cors: {
    origin: '*',
  },
});

const client_io = new Server(clientServer, {
  cors: {
    origin: '*',
  },
});

// Connections from clients
client_io.on('connection', (socket) => {
  registerClientHandlers(client_io, socket);
});


// Connections from other servers
server_io.on('connection', (socket) => {
  registerServerHandlers(server_io, socket);
});

// Start the game
startGame(client_io, serverSockets);

console.log(`${NAME}, SERVER_PORT = ${process.env.SERVER_PORT}, CLIENT_PORT = ${process.env.CLIENT_PORT}`)

// Ping neighbours after 1 second
setTimeout(() => neighbourList.map(async (address) => {
  try {
    const res = await fetch(address)
    console.log("neighbour", address, await res.text())
  } catch (e) {
    console.error("neighbour", address, e)
  }
}), 1000)
