const Matter = require('matter-js')
const mapJSON = require("../base.json")

const collisionLayer = mapJSON.layers.find((layer) => layer.name === "collision")

if (!collisionLayer) throw new Error("No collision layer found in map")

const createCollisionObjects = () => {
  const objects = collisionLayer.objects.map((object) => 
    Matter.Bodies.rectangle(object.x + (object.width / 2), object.y + (object.height / 2), object.width, object.height, { isStatic: true }))
  
  console.log("Created collision objects:", objects.length)

  return objects
}

module.exports = createCollisionObjects
