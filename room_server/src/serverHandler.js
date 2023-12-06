import {
  updateReplicas,
  receiveObjectTransfer
} from './game.js';

export default function (io, socket) {
  function update(payload) {
    updateReplicas(payload);
  }

  function handleReceiveObjectTransfer(payload) {
    receiveObjectTransfer(payload);
  }

  function disconnect(reason) {
    console.log('server disconnected', socket.id, reason);
  }

  console.log('a server connected', socket.id);

  socket.on('update', update);
  socket.on('receiveObjectTransfer', handleReceiveObjectTransfer);
  socket.on('disconnect', disconnect);
}
