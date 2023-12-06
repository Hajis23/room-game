import {
  setCurrentPlayerInput,
  removePrimaryObject,
  connectPlayer,
} from './game.js';

export default function (io, socket) {
  function input(data) {
    const { id } = socket.handshake.auth;

    setTimeout(() => { // Simulate latency
      setCurrentPlayerInput(id, data);
    }, 0);
  }

  function disconnect(reason) {
    console.log('client disconnected', socket.id, reason);

    const { id } = socket.handshake.auth;
    removePrimaryObject(id);
  }

  const { auth } = socket.handshake;
  console.log('a client connected', socket.id);

  connectPlayer(auth.id, socket);

  socket.on('disconnect', disconnect)
  socket.on('input', input);
}
