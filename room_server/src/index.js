import { Server } from 'socket.io';

import http from 'http';
import { startGame } from './game.js';

import registerClientHandlers from './clientHandler.js';
import registerServerHandlers from './serverHandler.js';
import logger from './logger.js';

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
