const Matter = require('matter-js');
const { measureTime, getAverageTime, ROOM_ID } = require('./utils');
const loadTiledMap = require('./tiledMapParser');
const { Socket } = require('socket.io-client')

/**
 * (Someone can expand this typedef but id is enough for now.)
 * @typedef {{ id: string }} SerializedObject
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

const createPlayer = (id) => {
  console.log("creating player", id)

  const player = Matter.Bodies.rectangle(
    300,
    100,
    20,
    12,
    { isStatic: false, label: id, frictionAir: 0.25, frictionStatic: 0.5, friction: 0.1, mass: 100 }
  );

  // Always attach an id to primary objects
  player.id = id;

  primaryObjects[id] = player;
  Matter.Composite.add(engine.world, player);
}

const setCurrentPlayerInput = (id, input) => {
  if (!primaryObjects[id]) return;

  primaryObjects[id].currentInput = input;
  if (Object.values(input).some((v) => v)) {
    primaryObjects[id].animationState = "walk";
    if (input.left) {
      primaryObjects[id].flipX = true;
    } else if (input.right) {
      primaryObjects[id].flipX = false;
    }
  } else {
    primaryObjects[id].animationState = "idle";
  }
}

const updatePrimaryObjects = (body) => {
  Matter.Body.setAngularVelocity(body, 0);

  if (body.currentInput) {
    const { up, down, left, right } = body.currentInput;

    let x = 0;
    let y = 0;

    if (up) y -= 0.1;
    if (down) y += 0.1;
    if (left) x -= 0.1;
    if (right) x += 0.1;

    Matter.Body.applyForce(body, body.position, { x, y });
  }
}

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
const transformPrimaryBodyToData = (body) => {
  return {
    position: body.position,
    velocity: body.velocity,
    label: body.label,
    animationState: body.animationState,
    flipX: body.flipX,
    id: body.id,
  };
}

/**
 * @param {Socket} clientIO
 * @param {Socket[]} serverSockets
 */
const processUpdate = (clientIO, serverSockets) => {
  // Check if bodies are leaving the room?

  const primaries = Object.values(primaryObjects)

  primaries.forEach(updatePrimaryObjects)

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

  clientIO.emit("update", clientPayload);
  serverSockets.forEach(socket => {
    // console.log("sending payload to ", socket.)
    socket.emit("update", serverPayload)
  })
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

  Matter.Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    // Is one of the bodies neighbouring room?
    pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      if (bodyA.label.startsWith("room") && bodyA.label !== ROOM_ID) {
        console.log("player entered", bodyA.label);
      } else if (bodyB.label.startsWith("room") && bodyB.label !== ROOM_ID) {
        console.log("player entered", bodyB.label);
      }
    });
  });

  // Run the game at 20 ticks per second
  const tickTime = 1000 / 20;
  setInterval(() => {
    measureTime("tick", () => {
      Matter.Engine.update(engine, tickTime);
      processUpdate(clientIO, serverSockets);
    });
  }, tickTime);

  // Log the tick time every 10 seconds
  // setInterval(() => {
  //   console.log("ticktime:", getAverageTime("tick", true), "ms")
  // }, 10_000)
}

module.exports = { startGame, createPlayer, removePrimaryObject, setCurrentPlayerInput, updateReplicas };
