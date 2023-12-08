import Matter from 'matter-js';
import { Socket } from 'socket.io-client'

import { measureTime, getAverageTime, ROOM_ID } from './utils.js';
import loadTiledMap from './tiledMapParser.js';
import { broadcastServerMessage, getAddressForRoom, sendServerMessage } from './serverSocket.js';
import logger from './logger.js';

/**
 * (Someone can expand this typedef but id is enough for now.)
 * @typedef {{ id: string }} SerializedObject
 */

/**
 * @typedef {{ id: string} & Matter.Body} PrimaryObject
 */

/**
 * @typedef {{ up: boolean, down: boolean, left: boolean, right: boolean }} Input
 */

/**
 * @type {{ [id: string]: Matter.Body } & { clientSocket?: Socket } }}
 */
const primaryObjects = {}

/**
 * @type {{ [id: string]: SerializedObject }}
 */
const replicatedObjects = {};

/**
 * Objects cannot be transferred more often than this
 */
const ROOM_TRANSFER_COOLDOWN_MS = 4000;

/**
 * Replica expiration time
 */
const REPLICA_EXPIRATION_MS = 1000;

/**
 *
 * @param {{ timestamp: number, bodies: SerializedObject[] }} payload
 */
const updateReplicas = (payload) => {
  payload.bodies.forEach((replicaData) => {
    replicaData.lastUpdated = Date.now()
    replicatedObjects[replicaData.id] = replicaData
  })
}

/**
 * @param {string} id 
 * @param {Socket} socket
 */
const connectPlayer = (id, socket) => {
  const existingReplica = replicatedObjects[id];
  const existingPrimary = primaryObjects[id];

  let player = null;

  const isNewPlayer = !existingReplica && !existingPrimary;

  if (isNewPlayer) {
    // New player
    logger.tag(id).info('creating new player')
    player = createPrimaryObject({ id, position: { x: 640, y: 483 }, animationState: 'idle', flipX: false });

  } else if (existingReplica && !existingPrimary) {
    // Existing replica but need to promote to primary
    logger.tag(id).info('promoting replica to primary')
    player = createPrimaryObject(existingReplica);
    delete replicatedObjects[id];

  } else if (existingPrimary) {
    // Existing primary, usual case when reconnecting or being transferred
    logger.tag(id).info('connecting existing primary')
    player = existingPrimary;
  }

  // Attach the socket to the player
  player.clientSocket = socket;
}

/**
 * 
 * @param {string} id 
 * @param {Input} input 
 * @returns 
 */
const setCurrentPlayerInput = (id, input) => {
  if (!primaryObjects[id]) return;

  primaryObjects[id].currentInput = input;
  if (Object.values(input).some((v) => v)) {
    primaryObjects[id].animationState = 'walk';
    if (input.left) {
      primaryObjects[id].flipX = true;
    } else if (input.right) {
      primaryObjects[id].flipX = false;
    }
  } else {
    primaryObjects[id].animationState = 'idle';
  }
}

/**
 * @param {Matter.Body} body 
 */
const updatePrimaryObject = (body) => {
  Matter.Body.setAngularVelocity(body, 0);

  if (body.currentInput) {
    const {
      up, down, left, right,
    } = body.currentInput;

    let x = 0;
    let y = 0;

    if (up) y -= 0.1;
    if (down) y += 0.1;
    if (left) x -= 0.1;
    if (right) x += 0.1;

    Matter.Body.applyForce(body, body.position, { x, y });
  }
}

/**
 * @param {string} id 
 */
const removePrimaryObject = (id) => {
  if (!primaryObjects[id]) return
  Matter.Composite.remove(engine.world, primaryObjects[id])
  delete primaryObjects[id];
}

/**
 * @type {Matter.Engine} The global engine object
 */
let engine = null;

/**
 * Send the body's relevant fields to the client
 * @param {Matter.Body} body
 * @returns {SerializedObject}
 */
const serializePrimaryBody = (body) => ({
  position: body.position,
  velocity: body.velocity,
  animationState: body.animationState,
  flipX: body.flipX,
  id: body.id,
})

/**
 * @param {Socket} clientIO
 */
const processUpdate = (clientIO) => {
  // Check if bodies are leaving the room?

  const primaries = Object.values(primaryObjects)

  primaries.forEach(updatePrimaryObject)

  const serializedPrimaries = primaries.map(serializePrimaryBody);

  const replicas = Object.values(replicatedObjects)

  // Remove expired replicas
  const now = Date.now()
  replicas.forEach((replica) => {
    if (now > replica.lastUpdated + REPLICA_EXPIRATION_MS) {
      delete replicas[replica.id]
    }
  })

  // Send information about all objects to client
  const clientPayload = {
    bodies: serializedPrimaries.concat(replicas),
    timestamp: Date.now(),
  }

  // Send information only about primaries to neighbouring servers
  const serverPayload = {
    bodies: serializedPrimaries,
    timestamp: Date.now(),
  }

  clientIO.emit('update', clientPayload);
  broadcastServerMessage('update', serverPayload)
}

/**
 * @param {SerializedObject} bodyPayload
 */
const createPrimaryObject = (bodyPayload) => {
  const body = Matter.Bodies.rectangle(
    bodyPayload.position.x,
    bodyPayload.position.y,
    20,
    12,
    {
      isStatic: false, frictionAir: 0.25, frictionStatic: 0.5, friction: 0.1, mass: 100,
    },
  );

  body.id = bodyPayload.id;
  body.velocity = bodyPayload.velocity || { x: 0, y: 0 };
  body.createdAt = Date.now();
  body.receivedAt = Date.now();
  body.animationState = bodyPayload.animationState;
  body.flipX = bodyPayload.flipX;

  primaryObjects[body.id] = body;

  Matter.Composite.add(engine.world, body);

  return body;
}

/**
 * @param {SerializedObject} bodyPayload 
 * @param {string} roomId
 * @param {Socket} roomSocket
 */
const receiveObjectTransfer = (bodyPayload, roomId, roomSocket) => {
  logger.tag(bodyPayload.id).info("received from", roomId);

  // Promote this body to a primary object
  const primaryObject = createPrimaryObject(bodyPayload);

  if (replicatedObjects[primaryObject.id]) {
    delete replicatedObjects[primaryObject.id];
  }

  // Acknowledge the neighbouring room server that the body has been promoted
}

/**
 * @param {Matter.Body} body 
 * @param {string} roomId
 */
const handleObjectTransfer = (body, roomId) => {
  if (body.isTransferring) return;
  if (body.createdAt + ROOM_TRANSFER_COOLDOWN_MS > Date.now()) return;
  if (body.receivedAt + ROOM_TRANSFER_COOLDOWN_MS > Date.now()) return;

  logger.tag(body.id).info("transferring to", roomId);
  body.isTransferring = true;

  // Is this body a player? If so, tell the client to change room
  if (body.clientSocket) {
    const address = getAddressForRoom(roomId);
    logger.tag(body.id).info("told to connect to", address);
    body.clientSocket.emit('changeRoom', { roomId, address });
  }

  // (Is the neighbouring room server available?)

  // Contact the neighbouring room server and tell it to promote this body to a primary object to start simulating it
  sendServerMessage(roomId, 'objectTransfer', serializePrimaryBody(body))

  // Once the neighbouring room server has promoted the body, demote it to a replica on this server
  removePrimaryObject(body.id);
  replicatedObjects[body.id] = serializePrimaryBody(body);
}

/**
 * @param {{ pairs: { bodyA: Matter.Body, bodyB: Matter.Body }[] }} event 
 */
const handleObjectCollision = (event) => {
  const pairs = event.pairs;
  // Is one of the bodies neighbouring room?
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    const bodyARoomId = bodyA.label;
    const bodyBRoomId = bodyB.label;
    if (bodyARoomId.startsWith("room") && bodyARoomId !== ROOM_ID) {
      handleObjectTransfer(bodyB, bodyARoomId);
    } else if (bodyBRoomId.startsWith("room") && bodyBRoomId !== ROOM_ID) {
      handleObjectTransfer(bodyA, bodyBRoomId);
    }
  });
}

/**
 * @param {Socket} clientIO
 */
const startGame = (clientIO) => {
  engine = Matter.Engine.create({
    gravity: {
      x: 0,
      y: 0,
    },
  });

  const { objects, roomObjects } = loadTiledMap();
  objects.forEach((object) => {
    Matter.Composite.add(engine.world, object);
  });
  roomObjects.forEach((object) => {
    Matter.Composite.add(engine.world, object);
  });

  Matter.Events.on(engine, 'collisionStart', handleObjectCollision);

  const gameTick = () => {
    Matter.Engine.update(engine, tickTime);
    processUpdate(clientIO);
  }

  // Run the game at 20 ticks per second
  const tickTime = 1000 / 20;
  setInterval(() => {
    measureTime("tick", gameTick);
  }, tickTime);

  // Log the tick time every 30 seconds
  setInterval(() => {
    logger.tag('PERF').info("ticktime:", getAverageTime("tick", true), "ms")
  }, 30_000)
}

export {
  startGame, connectPlayer, removePrimaryObject, setCurrentPlayerInput, updateReplicas, receiveObjectTransfer
};
