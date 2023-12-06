import { Server } from 'socket.io';
<<<<<<< HEAD
import { io as socketClient } from 'socket.io-client';
||||||| parent of 2e8c283 (Create object transfer func)
import { io as socketClient, Socket } from "socket.io-client"; 
=======
>>>>>>> 2e8c283 (Create object transfer func)

<<<<<<< HEAD
import http from 'http';
import { startGame } from './game.js';
||||||| parent of 2e8c283 (Create object transfer func)
import { updateReplicas, startGame } from "./game.js";
=======
import { startGame } from "./game.js";
>>>>>>> 2e8c283 (Create object transfer func)

import registerClientHandlers from './clientHandler.js';
import registerServerHandlers from './serverHandler.js';

// A simple http server to ping:

const server = http.createServer((req, res) => {
  console.log('ping')
  res.writeHead(200);
  res.end('ok');
});
server.listen(process.env.PORT);

<<<<<<< HEAD
const { NAME } = process.env;
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

const serverSockets = neighbourList.map(
  (address) => socketClient(address, { auth: { type: 'room' } }),
);

const io = new Server(server, {
||||||| parent of 2e8c283 (Create object transfer func)
const NAME = process.env.NAME;
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

/**
 * @type {Socket[]}
 */
const serverSockets = neighbourList.map(
  address => socketClient(address, { auth: { type: "room" } })
);

const io = new Server(server, {
=======
const server_io = new Server(serverServer, {
>>>>>>> 2e8c283 (Create object transfer func)
  cors: {
    origin: '*',
  },
});

const USER = 'user';
const ROOM = 'room';

// Connections from clients
io.on('connection', (socket) => {
  const { auth } = socket.handshake;
  if (auth.type === USER) {
    registerClientHandlers(io, socket);
  }
  if (auth.type === ROOM) {
    registerServerHandlers(io, socket);
  }
});

// Start the game
startGame(client_io, serverSockets);

console.log(`${process.env.NAME}, SERVER_PORT = ${process.env.SERVER_PORT}, CLIENT_PORT = ${process.env.CLIENT_PORT}`)

// Ping neighbours after 1 second
setTimeout(() => neighbourList.map(async (address) => {
  try {
    const res = await fetch(address)
    console.log('neighbour', address, await res.text())
  } catch (e) {
    console.error('neighbour', address, e)
  }
}), 1000)
