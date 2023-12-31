import logger from "./logger.js";
import { setNeighbours } from "./serverSocket.js";
import { inProduction, toWsAddress } from "./utils.js";
import { io } from "socket.io-client"; 

export let ROOM_ID = null;

let waitRoomAssignmentResolve = null;

const coordinatorSocket = io(toWsAddress(process.env.COORDINATOR), { 
  auth: { 
    type: 'room',
    port: process.env.PORT,
    address: inProduction ? `${process.env.FLY_APP_NAME}.fly.dev` : process.env.HOST,
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

coordinatorSocket.on('topology_update', async (payload) => {
  await waitForRoomAssignment();

  logger.info('received topology_update', payload)

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
