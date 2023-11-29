const Matter = require('matter-js');
const createCollisionObjects = require('./tiledMapParser');

const players = {}

const createPlayer = (id) => {
  console.log("creating player", id)

  const player = Matter.Bodies.rectangle(
    0,
    0,
    50,
    50,
    { isStatic: false }
  );

  players[id] = player;
  Matter.Composite.add(engine.world, player);
}

const getPlayer = (id) => {
  return players[id];
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
    angle: body.angle,
    angularVelocity: body.angularVelocity,
  };
}

/**
 * @param {SocketIO} io
 * @param {Matter.Body[]} bodies 
 */
const processUpdate = (io, bodies) => {
  const dynamicBodies = bodies.filter((body) => !body.isStatic)

  // Check if bodies are leaving the room?

  // Process player input?

  // Send the bodies' data to the clients
  io.emit("update", dynamicBodies.map(transformBodyToData));
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

  const objects = createCollisionObjects();
  console.log(objects)
  objects.forEach((object) => {
    Matter.Composite.add(engine.world, object);
  });

  const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
  Matter.Composite.add(engine.world, ground);

  // Run the game at 10 ticks per second
  const tickTime = 1000 / 10;
  setInterval(() => {
    Matter.Engine.update(engine, tickTime);
    processUpdate(io, engine.world.bodies);
    // console.log(engine.world.bodies.length)
  }, tickTime);
}

module.exports = { startGame, createPlayer };
