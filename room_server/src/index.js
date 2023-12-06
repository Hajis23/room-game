const { Server } = require('socket.io');
const { io: socketClient, Socket } = require("socket.io-client"); 
const game = require('./game');

const registerClientHandlers = require("./clientHandler");

// A simple http server to ping:
const http = require('http');
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
  console.log('a server connected', socket.id);

  socket.on("update", (payload) => {
    game.updateReplicas(payload)
  })

  socket.on("disconnect", (reason) => {
    console.log("server disconnected", socket.id, reason);
  })
});

// Start the game
game.startGame(client_io, serverSockets);

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
