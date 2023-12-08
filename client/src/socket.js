import io, { Socket } from 'socket.io-client'
import { emitGameEvent } from './PhaserGame';

const inProduction = import.meta.env.MODE === 'production';
console.log('VITE MODE: ', import.meta.env.MODE)

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

    let newAddress = data.address;
    if (!inProduction) {
      // Hack in local development, only use the port from the address
      newAddress = `http://localhost:${new URL(data.address).port}`;
    }
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
