import logger from "./logger.js";
import { setNeighbours } from "./serverSocket.js";
import { toWsAddress } from "./utils.js";
import { io } from "socket.io-client"; 

export let ROOM_ID = null;

let waitRoomAssignmentResolve = null;

const coordinatorSocket = io(toWsAddress(process.env.COORDINATOR), { 
  auth: { 
    type: 'room',
    port: process.env.PORT,
    host: process.env.HOST,
  }
});

coordinatorSocket.on('assignment', (assignedRoomId) => {
  ROOM_ID = assignedRoomId;
  logger.setDefaultTag(ROOM_ID);
  logger.info('assigned room id');

  if (typeof waitRoomAssignmentResolve === 'function') {
    waitRoomAssignmentResolve();
  }
})

coordinatorSocket.on('heartbeat', async (payload) => {
  await waitForRoomAssignment();

  logger.info('received heartbeat', payload)

  const { roomServers, roomNeighbours } = payload;

  const myNeighbours = roomNeighbours[ROOM_ID];

  const neighbours = {};

  myNeighbours.forEach((neighbourId) => {
    // Ignore self
    if (neighbourId === ROOM_ID) return;

    const neighbourInfo = roomServers[neighbourId];
    if (neighbourInfo) {
      neighbours[neighbourId] = neighbourInfo;
    }
  });

  setNeighbours(neighbours);
})

export const waitForRoomAssignment = () => new Promise((resolve) => {
  if (ROOM_ID) {
    resolve();
  } else {
    waitRoomAssignmentResolve = resolve;
  }
})
