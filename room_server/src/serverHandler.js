import {
  updateReplicas,
  receiveObjectTransfer
} from './game.js';
import logger from './logger.js';

export default function (io, socket) {
  const { auth } = socket.handshake;
  const roomId = auth.roomId
  if (!roomId) {
    console.error('no roomId in auth', auth)
    return
  }

  function update(payload) {
    updateReplicas(payload);
  }

  function handleReceiveObjectTransfer(payload) {
    receiveObjectTransfer(payload, roomId, socket);
  }

  function disconnect(reason) {
    logger.info('server disconnected', socket.id, reason);
  }

  logger.info('a server connected', socket.id);

  socket.on('update', update);
  socket.on('objectTransfer', handleReceiveObjectTransfer);
  socket.on('disconnect', disconnect);
}
