const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { io } = require("socket.io-client"); 

const NAME = process.env.NAME;
const PORT = process.env.HTTP_PORT;
const PORT2 = process.env.SOCK_PORT;
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

const app = express();
const httpServer = createServer(app);
const client_io = new Server(httpServer);
const server_io = new Server(PORT2);

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

  socket.on("request_relocation", (data, respond) => {
    if(localState.includes(data))
      respond(moveData(data));
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  })
});


// Connections from other servers
server_io.on('connection', (socket) => {
  console.log('a server connected', socket.id);

  socket.on('share_local', (name, local) => {
    neighbourStates[name] = local;
    console.log(name,"shared local:", local)
  });

  socket.on('take_state', (name, state) => {
    localState = [...localState, state];
    console.log("received",state,"from",name);
  });

  socket.on("disconnect", () => {
    console.log("server disconnected", socket.id);
  })
});


// Serve webpage
app.get('/', (req, res) => res.sendFile(join(__dirname, 'index.html')));
httpServer.listen(PORT, () => {
  console.log(`server ${NAME} running at http://localhost:${PORT}`);
  console.log(`other servers: ${neighbourList}`);
});

// Periodically share local state with other servers
setInterval(() => serverSockets.forEach(s => s.emit("share_local", NAME, localState)), 1000);

// Broadcast state to all clients
setInterval(() => client_io.emit("updated_state", getCombinedState()), 1000);
