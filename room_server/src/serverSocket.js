import { io, Socket } from "socket.io-client"; 
import { ROOM_ID } from './utils.js'
import {toHttpAddress, toWsAddress} from './utils.js';
import logger from "./logger.js";

/**
 * @type {{ address: string, id: string}[]}
 */
let neighbourList = [];

/**
 * @type {{ [id: string]: Socket }}
 */
let serverSockets = {};

export const setNeighbours = (neighbours) => {
  neighbourList = neighbours;
  serverSockets = Object.fromEntries(
    neighbourList.map(({ id, address }) => [id, io(toWsAddress(address), { auth: { roomId: ROOM_ID, type: 'room' } })])
  );
}

export const getAddressForRoom = (roomId) => {
  const neighbour = neighbourList.find(({ id }) => id === roomId)
  if (!neighbour) throw new Error(`No neighbour found for room ${roomId}`)
  return toWsAddress(neighbour.address)
}

export const broadcastServerMessage = (type, payload) => {
  Object.values(serverSockets).forEach((socket) => {
    socket.emit(type, payload)
  })
}

export const sendServerMessage = (roomId, type, payload) => {
  const socket = serverSockets[roomId]
  if (socket) {
    socket.emit(type, payload)
  } else {
    console.error('no socket for room', roomId)
  }
}


// Ping neighbours after 1 second
setTimeout(() => neighbourList.map(async ({ address }) => {
  try {
    const url = toHttpAddress(address)
    console.log(url)
    const res = await fetch(url)
    logger.info('neighbour', address, await res.text())
  } catch (e) {
    console.error('neighbour', address, e)
  }
}), 1000)
