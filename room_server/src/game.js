const Matter = require('matter-js');
const createCollisionObjects = require('./tiledMapParser');

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
  const dynamicBodies = bodies.filter((body) => body.type !== "collision")

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

  Matter.Composite.add(engine.world, createCollisionObjects());

  // Run the game at 10 ticks per second
  const tickTime = 1000 / 10;
  setInterval(() => {
    Matter.Engine.update(engine, tickTime);
    processUpdate(io, engine.world.bodies);
  }, tickTime);
}

module.exports = startGame;
