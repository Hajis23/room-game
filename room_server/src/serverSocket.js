import { io, Socket } from "socket.io-client"; 

/**
 * @type {{ address: string, id: string}[]}
 */
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

/**
 * @type {{ [id: string]: Socket }}
 */
const serverSockets = Object.fromEntries(
  neighbourList.map(({ id, address }) => [id, io(address, { auth: { roomId: process.env.ROOM_ID, type: 'room' } })])
)

export const getAddressForRoom = (roomId) => {
  const neighbour = neighbourList.find(({ id }) => id === roomId)
  if (!neighbour) throw new Error(`No neighbour found for room ${roomId}`)
  return neighbour.address
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
    const res = await fetch(address)
    console.log('neighbour', address, await res.text())
  } catch (e) {
    console.error('neighbour', address, e)
  }
}), 1000)
