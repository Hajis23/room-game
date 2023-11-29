const Matter = require('matter-js');
const createCollisionObjects = require('./tiledMapParser');

const players = {}

const createPlayer = (id) => {
  console.log("creating player", id)

  const player = Matter.Bodies.rectangle(
    300,
    100,
    20,
    12,
    { isStatic: false, label: id }
  );

  players[id] = player;
  Matter.Composite.add(engine.world, player);
}

const setCurrentInput = (id, input) => {
  players[id].currentInput = input;
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
    angle: body.angle,
    angularVelocity: body.angularVelocity,
    label: body.label,
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
  Object.keys(players).forEach((id) => {
    const player = players[id];
    if (player.currentInput) {
      const { up, down, left, right } = player.currentInput;

      let x = 0;
      let y = 0;

      if (up) y -= 1;
      if (down) y += 1;
      if (left) x -= 1;
      if (right) x += 1;

      Matter.Body.setVelocity(player, { x, y });
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

  const objects = createCollisionObjects();
  console.log(objects)
  objects.forEach((object) => {
    Matter.Composite.add(engine.world, object);
  });

  const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
  Matter.Composite.add(engine.world, ground);

  // Run the game at 20 ticks per second
  const tickTime = 1000 / 5;
  setInterval(() => {
    Matter.Engine.update(engine, tickTime);
    processUpdate(io, engine.world.bodies);
  }, tickTime);
}

module.exports = { startGame, createPlayer, removePlayer, setCurrentInput };
