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

const deleteUserBySocketId = (socketId)  => {
  if(socketIdToUser[socketId]){
    const id = users.indexOf(socketIdToUser[socketId]);
    users.splice(id, 1);
    delete socketIdToUser[socketId];
  }
}

io.on('connection', (socket) => {
  
  socket.on('disconnect', (reason) => {
    console.log('disconnect');
    deleteUserBySocketId(socket.id);
  });

  socket.on('logout', () => {
    deleteUserBySocketId(socket.id);
  });

  socket.on('check', (username, callback) => {
    if (users.includes(username)) {
      console.log("invalid");
      callback({ invalid: true });
    } else {
      console.log("valid");
      users.push(username);
      socketIdToUser[socket.id] = username;
      callback({ invalid: false });
    }
  });

  socket.on('get_room_servers', (respond) => {
    respond(roomServers);
  });

  socket.on('get_room_neighbours', (roomId, respond) => {
    respond(roomNeighbours[roomId] ? roomNeighbours[roomId] : []);
  });

  socket.on('register_room_server', (serverAddress, respond) => {
    const roomId = offlineRoomServers.pop();
    roomServers[roomId] = serverAddress;
    console.log("registered", serverAddress, "as", roomId);
    respond(roomId);
  });
  
  socket.on('get_room_server_address', (roomId, respond) => {
    if (roomServers[roomId]){
      respond(roomServers[roomId]);
    }else{
      respond("");
    }
  })

  console.log('connection');
});
