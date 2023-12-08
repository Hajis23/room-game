import io, { Socket } from 'socket.io-client'
import { emitGameEvent } from './PhaserGame';

const socketState = {
  socket: null,
}

const getSocket = () => socketState.socket;
const setSocket = (socket) => socketState.socket = socket;

let clientUserId = null;

export const getClientUserId = () => clientUserId;

export const disconnectRoomServer = () => {
  getSocket()?.disconnect();
}

const createSocket = (address, userId) => {
  return io(address, {
    auth: {
      type: 'user',
      id: userId,
    },
    transports: ['websocket'],
  });
}

/**
 * 
 * @param {Socket} socket 
 */
const addHandlers = (socket) => {
  socket.on('update', (data) => emitGameEvent('room_update', data));

  socket.on('changeRoom', (data) => {
    getSocket().disconnect();

    const newAddress = data.address;
    console.log('connecting to', newAddress);

    setSocket(createSocket(newAddress, clientUserId));
  
    addHandlers(getSocket());
    emitGameEvent('change_room', data)
  });
}

export const connectToRoomServer = (address, userId) => {
  clientUserId = userId;

  setSocket(createSocket(address, userId));

  addHandlers(getSocket());
}

export const sendInputMessage = async (input) => {
  // console.log('Sending input message to, ', getSocket()._opts.port, getSocket().connected);
  getSocket().emit('input', input);
};
