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

io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    console.log('disconnect');
  });

  socket.on('check', (username, callback) => {
    if (users.includes(username)) {
      console.log("invalid");
      callback({ invalid: true });
    } else {
      console.log("valid");
      users.push(username);
      callback({ invalid: false });
    }
  });

  console.log('connection');
});
