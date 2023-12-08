import { Server } from 'socket.io';
import http from 'http';

const port = 3131;

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

const roomServers = {
  "room1":"localhost:3000",
  "room2":"localhost:4000",
  "room3":"localhost:5000",
};

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

  console.log('connection');
});
