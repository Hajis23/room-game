import {
  setCurrentPlayerInput,
  removePrimaryObject,
  createPlayer,
} from './game.js';

export default function (io, socket) {
  function input(data) {
    const { id } = socket.handshake.auth;

    setTimeout(() => { // Simulate latency
      console.log("getting input from client", id)
      setCurrentPlayerInput(id, data);
    }, 0);
  }

  function disconnect(reason) {
    console.log('client disconnected', socket.id, reason);

    const { id } = socket.handshake.auth;
    removePrimaryObject(id);
  }

  const { auth } = socket.handshake;
  console.log('a user connected', socket.id);

  createPlayer(auth.id, socket);

  socket.on('disconnect', disconnect)
  socket.on('input', input);
}
