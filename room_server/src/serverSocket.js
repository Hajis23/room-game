import { io, Socket } from "socket.io-client"; 
import { inProduction } from './utils.js'
import {toHttpAddress, toWsAddress} from './utils.js';
import logger from "./logger.js";
import { ROOM_ID } from "./coordinatorClient.js";

/**
 * @type {{  }}
 */
export let neighbours = {};

/**
 * 
 * @param {{ [roomId: string]: { address: string, port: string } }} newNeighbours 
 */
export const setNeighbours = (newNeighbours) => {
  console.log(newNeighbours)
  Object.entries(newNeighbours).forEach(([id, { address, port }]) => {
  
    if (neighbours[id]) {
      // Check if address same
      const currentAddress = neighbours[id].address;
      if (currentAddress === address) {
        return;
      }
      // Else disconnect old socket
      neighbours[id].socket.disconnect();
    }

    // Development mode hack: address is host:port
    if (!inProduction) {
      address = `${host}:${port}`
    }

    logger.info('connecting to neighbour', id, toWsAddress(address))
    const socket = io(toWsAddress(address), {
      auth: {
        type: 'room',
        roomId: ROOM_ID,
      }
    });

    neighbours[id] = {
      id,
      address,
      socket,
    };
  })
}

export const getAddressForRoom = (roomId) => {
  const neighbour = neighbours[roomId]
  if (!neighbour) throw new Error(`No neighbour found for room ${roomId}`)
  return toWsAddress(neighbour.address)
}

export const broadcastServerMessage = (type, payload) => {
  Object.values(neighbours).forEach(({ socket }) => {
    socket.emit(type, payload)
  })
}

export const sendServerMessage = (roomId, type, payload) => {
  const socket = neighbours[roomId]?.socket

  if (socket) {
    socket.emit(type, payload)
  } else {
    console.error('no socket for room', roomId)
  }
}


// Ping neighbours after 1 second
setTimeout(() => Object.values(neighbours).map(async ({ address }) => {
  try {
    const url = toHttpAddress(address)
    const res = await fetch(url)
    logger.info('HTTP ping to neighbour', url, await res.text())
  } catch (e) {
    console.error('HTTP ping to neighbour', address, e)
  }
}), 1000)
