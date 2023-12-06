import Matter from 'matter-js';
import { Socket } from 'socket.io-client'

import { measureTime, getAverageTime, ROOM_ID } from './utils.js';
import loadTiledMap from './tiledMapParser.js';
import { broadcastServerMessage, getAddressForRoom, sendServerMessage } from './serverSocket.js';

/**
 * (Someone can expand this typedef but id is enough for now.)
 * @typedef {{ id: string }} SerializedObject
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
const createPlayer = (id, socket) => {
  const existingReplica = replicatedObjects[id];

  if (existingReplica) {
    console.log('promoting replica to primary', id)
  } else {
    console.log('creating player', id)
  }

  const x = existingReplica?.position?.x || 300;
  const y = existingReplica?.position?.y || 100;
  const velocity = existingReplica?.velocity || { x: 0, y: 0 };
  const animationState = existingReplica?.animationState || 'idle';
  const flipX = existingReplica?.flipX || false;

  const player = Matter.Bodies.rectangle(
    x,
    y,
    20,
    12,
    {
      isStatic: false, label: id, frictionAir: 0.25, frictionStatic: 0.5, friction: 0.1, mass: 100,
    },
  );

  // Always attach an id to primary objects
  player.id = id;

  // Attach the socket to the player
  player.clientSocket = socket;

  player.animationState = animationState;
  player.flipX = flipX;
  player.velocity = velocity;

  player.createdAt = Date.now();

  if (existingReplica) {
    player.receivedAt = Date.now();
    delete replicatedObjects[id];
  }

  primaryObjects[id] = player;
  Matter.Composite.add(engine.world, player);
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
  label: body.label,
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
    if (now - replica.lastUpdated > 1000) {
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
 * @param {SerializedObject} body 
 * @param {string} roomId
 * @param {Socket} roomSocket
 */
const receiveObjectTransfer = (body, roomId, roomSocket) => {
  console.log("receiving", body.id, "from", roomId);
  // Promote this body to a primary object

  // Acknowledge the neighbouring room server that the body has been promoted
}

/**
 * @param {Matter.Body} body 
 * @param {string} roomId
 */
const handleObjectTransfer = (body, roomId) => {
  const objectId = body.label;
  if (body.isTransferring) return;
  if (body.createdAt + 2000 > Date.now()) return;
  if (body.receivedAt + 2000 > Date.now()) return;

  console.log("object", objectId, "is leaving room", ROOM_ID, "to room", roomId);
  body.isTransferring = true;

  // Is this body a player? If so, tell the client to change room
  if (body.clientSocket) {
    const address = getAddressForRoom(roomId);
    console.log("telling", objectId, "to change room to", address);
    body.clientSocket.emit('changeRoom', { roomId, address });
  }

  // (Is the neighbouring room server available?)

  // Contact the neighbouring room server and tell it to promote this body to a primary object to start simulating it
  sendServerMessage(roomId, 'objectTransfer', serializePrimaryBody(body))

  // Once the neighbouring room server has promoted the body, demote it to a replica on this server
}

/**
 * @param {{ pairs: { bodyA: Matter.Body, bodyB: Matter.Body }[] }} event 
 */
const handleObjectCollision = (event) => {
  const pairs = event.pairs;
  // Is one of the bodies neighbouring room?
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    if (bodyA.label.startsWith("room") && bodyA.label !== ROOM_ID) {
      handleObjectTransfer(bodyB, bodyA.label);
    } else if (bodyB.label.startsWith("room") && bodyB.label !== ROOM_ID) {
      handleObjectTransfer(bodyA, bodyB.label);
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
  const tickTime = 1000 / 10;
  setInterval(() => {
    measureTime("tick", gameTick);
  }, tickTime);

  // Log the tick time every 10 seconds
  // setInterval(() => {
  //   console.log("ticktime:", getAverageTime("tick", true), "ms")
  // }, 10_000)
}

export {
  startGame, createPlayer, removePrimaryObject, setCurrentPlayerInput, updateReplicas, receiveObjectTransfer
};
