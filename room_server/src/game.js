const Matter = require('matter-js');

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
  // Check if bodies are leaving the room?

  // Process player input?

  // Send the bodies' data to the clients
  io.emit("update", bodies.map(transformBodyToData));
}

/**
 * @param {SocketIO} io
 */
const startGame = (io) => {
  const engine = Matter.Engine.create();

  const boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
  const boxB = Matter.Bodies.rectangle(450, 50, 80, 80);
  const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  Matter.Composite.add(engine.world, [boxA, boxB, ground]);

  // Run the game at 10 ticks per second
  const tickTime = 1000 / 10;
  setInterval(() => {
    Matter.Engine.update(engine, tickTime);
    processUpdate(io, engine.world.bodies);
  }, tickTime);
}

module.exports = startGame;
