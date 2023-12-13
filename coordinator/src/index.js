import { Server } from 'socket.io';
import http from 'http';

const port = process.env.PORT || 3131;

const server = http.createServer((req, res) => {
  console.log('ping')
  res.writeHead(200);
  res.end('ok');
});
server.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const users = [];
const socketIdToUser = {};

let roomServers = {};
let offlineRoomServers = JSON.parse(process.env.SERVERS);

const roomNeighbours = JSON.parse(process.env.ROOM_NEIGHBOURS);

const startingRoomId = process.env.STARTING_ROOM_ID;

const getStartingRoomServer = () => {
  return Object.values(roomServers).find(({ roomId }) => roomId === startingRoomId);
}

const deleteUserBySocketId = (socketId)  => {
  if (socketIdToUser[socketId]){
    const id = users.indexOf(socketIdToUser[socketId]);
    users.splice(id, 1);
    delete socketIdToUser[socketId];
  }
}

const sendHeartbeat = () => {
  io.to("room_servers").emit("heartbeat", { 
    roomServers: Object.fromEntries(Object.entries(roomServers).map(([, { serverAddress, roomId, serverPort }]) => [roomId, { address: serverAddress, port: serverPort }])), // { roomId: { address, port } }
    roomNeighbours,
  });
}

io.on('connection', (socket) => {
  const isRoomServer = socket.handshake.auth.type === "room";

  if (isRoomServer) {
    // This is where we send heartbeats
    socket.join("room_servers");

    const roomId = offlineRoomServers.pop();
    if (!roomId) {
      console.error("no more rooms left");
      return;
    }

    const serverPort = socket.handshake.auth.port;
    const serverAddress = socket.handshake.auth.address;

    roomServers[socket.id] = { serverAddress, roomId, serverPort };
    console.log('connection', socket.id, roomServers, offlineRoomServers);
    console.log("registered", serverAddress, "as", roomId);
  
    socket.emit("assignment", roomId);

    sendHeartbeat();
  }

  socket.on('disconnect', (reason) => {
    if (isRoomServer) {
      console.log('disconnect', socket.id, roomServers, offlineRoomServers);
      const roomId = roomServers[socket.id].roomId;
      delete roomServers[socket.id];
      offlineRoomServers.push(roomId);
      sendHeartbeat();
    } else {
      deleteUserBySocketId(socket.id);
    }
  });

  socket.on('logout', () => {
    deleteUserBySocketId(socket.id);
  });

  socket.on('check', (username, callback) => {
    const startingRoomServer = getStartingRoomServer();
  
    if (users.includes(username)) {
      callback({ invalid: true , error: "Username is already taken"});
    } else if (!startingRoomServer) {
      callback({ invalid: true, error: "Cannot connect to starting room!"});
    } else {
      users.push(username);
      socketIdToUser[socket.id] = username;
      callback({ invalid: false, roomServer: startingRoomServer.serverAddress, roomId: startingRoomServer.roomId });
    }
  });
});
