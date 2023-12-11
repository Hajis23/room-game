import { Server } from 'socket.io';

import http from 'http';
import { startGame } from './game.js';

import registerClientHandlers from './clientHandler.js';
import registerServerHandlers from './serverHandler.js';
import { getNeighbours } from './coordinatorHandler.js';
import logger from './logger.js';
import { setNeighbours } from './serverSocket.js';

// A simple http server to ping:

const server = http.createServer((req, res) => {
  logger.info('ping')
  res.writeHead(200);
  res.end('ok');
});
server.listen(process.env.PORT);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const USER = 'user';
const ROOM = 'room';

console.log("fetching neighbours...")
const neighbours = await getNeighbours(process.env.ROOM_ID);
console.log("neighbours:",neighbours)
setNeighbours(neighbours);


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
startGame(io);

logger.info(`${process.env.NAME}, PORT = ${process.env.PORT}`)
