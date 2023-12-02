const Matter = require('matter-js')
const { ROOM_ID } = require('./utils')

const loadTiledMap = () => {

  const mapJSON = require("../base.json")

  const roomsLayer = mapJSON.layers.find((layer) => layer.name === "rooms")
  if (!roomsLayer) throw new Error("No rooms layer found in map")

  const roomObjects = roomsLayer.objects.map((object) => 
    Matter.Bodies.rectangle(object.x + (object.width / 2), object.y + (object.height / 2), object.width, object.height, { isStatic: true, isSensor: true, label: object.name }))

  const serverRoom = roomObjects.find((object) => object.label === ROOM_ID)
  if (!serverRoom) throw new Error(`No room with id ${ROOM_ID} found in map`)

  const collisionLayer = mapJSON.layers.find((layer) => layer.name === "collision")
  if (!collisionLayer) throw new Error("No collision layer found in map")

  const objects = collisionLayer.objects.filter((object) => {
    // Check if object is inside the room
    const bounds = Matter.Bounds.create([
      { x: object.x, y: object.y },
      { x: object.x + object.width, y: object.y + object.height },
    ])
    return Matter.Bounds.overlaps(bounds, serverRoom.bounds)
  }).map((object) => 
    Matter.Bodies.rectangle(object.x + (object.width / 2), object.y + (object.height / 2), object.width, object.height, { isStatic: true }))
  
  console.log("Created collision objects:", objects.length)

  return {
    objects,
    roomObjects,
  }
}

module.exports = loadTiledMap
