const Matter = require('matter-js');

const startGame = () => {
  const engine = Matter.Engine.create();

  const boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
  const boxB = Matter.Bodies.rectangle(450, 50, 80, 80);
  const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  Matter.Composite.add(engine.world, [boxA, boxB, ground]);

  // Run the game at 10 ticks per second
  const tickTime = 1000 / 10;
  setInterval(() => {
    Matter.Engine.update(engine, tickTime);
    // Log this to see physics running on server:
    // console.log(boxA.position);
  }, tickTime);
}

module.exports = startGame;
