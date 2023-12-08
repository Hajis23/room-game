import io from 'socket.io-client';
import { emitGameEvent } from './PhaserGame';

let socket = null;
let clientUserId = null;

export const getClientUserId = () => clientUserId;

export const disconnectRoomServer = () => {
  if (socket) {
    socket.disconnect();
  }
}

export const connectToRoomServer = (address, userId) => {
  socket = io(address, {
    auth: {
      type: 'user',
      id: userId,
    },
  });

  clientUserId = userId;
  socket.on('update', (data) => emitGameEvent('room_update', data));
}

export const sendInputMessage = async (input) => {
  // console.log('Sending input message:', input);
  socket.emit('input', input);
};
