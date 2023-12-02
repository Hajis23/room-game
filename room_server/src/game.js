const Matter = require('matter-js');
const { measureTime, getAverageTime, ROOM_ID } = require('./utils');
const loadTiledMap = require('./tiledMapParser');

/**
 * @type {{ [id: string]: Matter.Body }}
 */
const players = {}

const createPlayer = (id) => {
  console.log("creating player", id)

  const player = Matter.Bodies.rectangle(
    300,
    100,
    20,
    12,
    { isStatic: false, label: id, frictionAir: 0.2, frictionStatic: 0.5, friction: 0.1, mass: 100 }
  );

  players[id] = player;
  Matter.Composite.add(engine.world, player);
}

const setCurrentInput = (id, input) => {
  if (!players[id]) return;

  players[id].currentInput = input;
  if (Object.values(input).some((v) => v)) {
    players[id].animationState = "walk";
    if (input.left) {
      players[id].flipX = true;
    } else if (input.right) {
      players[id].flipX = false;
    }
  } else {
    players[id].animationState = "idle";
  }
}

const removePlayer = (id) => {
  Matter.Composite.remove(engine.world, players[id])
  delete players[id];
}

/**
 * @type {Matter.Engine} The global engine object
 */
let engine = null;

/**
 * Send the body's relevant fields to the client
 * @param {Matter.Body} body 
 */
const transformBodyToData = (body) => {
  return {
    position: body.position,
    velocity: body.velocity,
    label: body.label,
    animationState: body.animationState,
    flipX: body.flipX,
  };
}

/**
 * @param {SocketIO} io
 * @param {Matter.Body[]} bodies 
 */
const processUpdate = (io, bodies) => {
  const dynamicBodies = bodies.filter((body) => !body.isStatic)

  // Do not allow angular rotation
  dynamicBodies.forEach((body) => {
    Matter.Body.setAngularVelocity(body, 0);
  })

  // Check if bodies are leaving the room?

  // Process player input
  Object.values(players).forEach(player => {
    if (player.currentInput) {
      const { up, down, left, right } = player.currentInput;

      let x = 0;
      let y = 0;

      if (up) y -= 0.1;
      if (down) y += 0.1;
      if (left) x -= 0.1;
      if (right) x += 0.1;
  
      Matter.Body.applyForce(player, player.position, { x, y });
    }
  })

  // Send the bodies' data to the clients
  io.emit("update", {
    bodies: dynamicBodies.map(transformBodyToData),
  });
}

/**
 * @param {SocketIO} io
 */
const startGame = (io) => {
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
      processUpdate(io, engine.world.bodies);
    });
  }, tickTime);

  // Log the tick time every 10 seconds
  setInterval(() => {
    console.log("ticktime:", getAverageTime("tick", true), "ms")
  }, 10_000)
}

module.exports = { startGame, createPlayer, removePlayer, setCurrentInput };
