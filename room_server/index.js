const { Server } = require('socket.io');
const { io } = require("socket.io-client"); 
const startGame = require('./src/game');

// A simple http server to ping:
const http = require('http');
const server = http.createServer((req, res) => {
  console.log("pinged")
  res.writeHead(200);
  res.end('ok');
});

server.listen(process.env.CLIENT_PORT);

const NAME = process.env.NAME;
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

const server_io = new Server(process.env.SERVER_PORT);
const client_io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let localState = [NAME];
let neighbourStates = {};
let serverSockets = neighbourList.map(name => io(`ws://${name}`));

function getCombinedState(){
  const snapshot = Object.keys(neighbourStates).map(name => neighbourStates[name]);
  return [...localState, ...snapshot];
}

function removeFromState(data){
  localState = localState.filter(x => x !== data);
}

function moveData(data){
  const serverId = Math.floor(Math.random()*neighbourList.length);
  serverSockets[serverId].emit("take_state", NAME, data);
  removeFromState(data);
  return neighbourList[serverId];
}

// Connections from clients
client_io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on("modify_state", (data) => {
    localState = [...localState, data]
    console.log("modified state:", localState);
  });

  socket.on("delete_state", (data) => {
    removeFromState(data);
    console.log("modified state:", localState);
  });
  
  socket.on("input", (data) => {
    console.log("input:", data);
  });

  socket.on("request_relocation", (data, respond) => {
    if(localState.includes(data))
      respond(moveData(data));
  });

  socket.on("disconnect", () => {
    console.log("client disconnectedasd", socket.id);
  })
});


// Connections from other servers
server_io.on('connection', (socket) => {
  console.log('a server connected', socket.id);

  socket.on('share_local', (name, local) => {
    neighbourStates[name] = local;
    // console.log(name,"shared local:", local)
  });

  socket.on('take_state', (name, state) => {
    localState = [...localState, state];
    console.log("received",state,"from",name);
  });

  socket.on("disconnect", () => {
    console.log("server disconnected", socket.id);
  })
});



// Periodically share local state with other servers
setInterval(() => serverSockets.forEach(s => s.emit("share_local", NAME, localState)), 1000);

// Broadcast state to all clients
setInterval(() => client_io.emit("updated_state", getCombinedState()), 1000);


// Start the game
startGame(client_io);

console.log(`Server ${NAME} listening on port ${process.env.SERVER_PORT} and ${process.env.CLIENT_PORT}`)
