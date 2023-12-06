import Matter from 'matter-js';
import { Socket } from 'socket.io-client'

import { measureTime, getAverageTime, ROOM_ID } from './utils.js';
import loadTiledMap from './tiledMapParser.js';

/**
 * (Someone can expand this typedef but id is enough for now.)
 * @typedef {{ id: string }} SerializedObject
 */

/**
 * @typedef {{ up: boolean, down: boolean, left: boolean, right: boolean }} Input
 */

/**
 * @type {{ [id: string]: Matter.Body }}
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
 * 
 * @param {string} id 
 */
const createPlayer = (id) => {
  console.log('creating player', id)

  const player = Matter.Bodies.rectangle(
    300,
    100,
    20,
    12,
    {
      isStatic: false, label: id, frictionAir: 0.25, frictionStatic: 0.5, friction: 0.1, mass: 100,
    },
  );

  // Always attach an id to primary objects
  player.id = id;

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
const transformPrimaryBodyToData = (body) => ({
  position: body.position,
  velocity: body.velocity,
  label: body.label,
  animationState: body.animationState,
  flipX: body.flipX,
  id: body.id,
})

/**
 * @param {Socket} clientIO
 * @param {Socket[]} serverSockets
 */
const processUpdate = (clientIO, serverSockets) => {
  // Check if bodies are leaving the room?

  const primaries = Object.values(primaryObjects)

  primaries.forEach(updatePrimaryObject)

  const serializedPrimaries = primaries.map(transformPrimaryBodyToData);

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
  serverSockets.forEach((socket) => {
    // console.log("sending payload to ", socket.)
    socket.emit('update', serverPayload)
  })
}

/**
 * @param {SerializedObject} body 
 * @param {string} roomId
 */
const receiveObjectTransfer = (body, roomId) => {
  console.log("object", body.id, "is entering room", roomId, "from room", ROOM_ID);
  // Promote this body to a primary object

  // Acknowledge the neighbouring room server that the body has been promoted
}

/**
 * @param {Matter.Body} body 
 * @param {string} roomId
 */
const handleObjectTransfer = (body, roomId) => {
  const objectId = body.label;
  console.log("object", objectId, "is leaving room", ROOM_ID, "to room", roomId);

  // Is this body a player? If so, tell the client to change room

  // (Is the neighbouring room server available?)

  // Contact the neighbouring room server and tell it to promote this body to a primary object to start simulating it

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
 * @param {Socket[]} serverSockets
 */
const startGame = (clientIO, serverSockets) => {
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
    processUpdate(clientIO, serverSockets);
  }

  // Run the game at 20 ticks per second
  const tickTime = 1000 / 20;
  setInterval(() => {
    measureTime("tick", gameTick);
  }, tickTime);

  // Log the tick time every 10 seconds
  // setInterval(() => {
  //   console.log("ticktime:", getAverageTime("tick", true), "ms")
  // }, 10_000)
}

<<<<<<< HEAD
export {
  startGame, createPlayer, removePrimaryObject, setCurrentPlayerInput, updateReplicas,
};
||||||| parent of 2e8c283 (Create object transfer func)
export { startGame, createPlayer, removePrimaryObject, setCurrentPlayerInput, updateReplicas };
=======
export { startGame, createPlayer, removePrimaryObject, setCurrentPlayerInput, updateReplicas, receiveObjectTransfer };
>>>>>>> 2e8c283 (Create object transfer func)
