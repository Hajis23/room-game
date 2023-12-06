import {
  setCurrentPlayerInput,
  removePrimaryObject,
  connectPlayer,
} from './game.js';
import logger from './logger.js';

export default function (io, socket) {
  function input(data) {
    const { id } = socket.handshake.auth;

    setTimeout(() => { // Simulate latency
      setCurrentPlayerInput(id, data);
    }, 0);
  }

  function disconnect(reason) {
    const { id } = socket.handshake.auth;
    logger.tag(id).info('disconnected', reason);
    removePrimaryObject(id);
  }

  const { auth } = socket.handshake;

  logger.tag(auth.id).info('connected');

  connectPlayer(auth.id, socket);

  socket.on('disconnect', disconnect)
  socket.on('input', input);
}
