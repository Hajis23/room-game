import {
  updateReplicas,
  receiveObjectTransfer
} from './game.js';

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
    console.log('server disconnected', socket.id, reason);
  }

  console.log('a server connected', socket.id);

  socket.on('update', update);
  socket.on('objectTransfer', handleReceiveObjectTransfer);
  socket.on('disconnect', disconnect);
}
