const Matter = require('matter-js')
const mapJSON = require("../base.json")

const collisionLayer = mapJSON.layers.find((layer) => layer.name === "collision")

if (!collisionLayer) throw new Error("No collision layer found in map")

const createCollisionObjects = () => collisionLayer.objects.map((object) => 
  Matter.Bodies.rectangle(
    object.x,
    object.y,
    object.width,
    object.height,
    { isStatic: true, type: "collision" }
  ))

module.exports = createCollisionObjects
