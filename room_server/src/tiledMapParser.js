const Matter = require('matter-js')

const ROOM_ID = process.env.ROOM_ID

const loadTiledMap = () => {

  const mapJSON = require("../base.json")

  const roomsLayer = mapJSON.layers.find((layer) => layer.name === "rooms")
  if (!roomsLayer) throw new Error("No rooms layer found in map")

  const roomObject = roomsLayer.objects.find((object) => object.name === ROOM_ID)
  if (!roomObject) throw new Error(`No room with id ${ROOM_ID} found in map`)

  const roomBounds = Matter.Bounds.create([
    { x: roomObject.x, y: roomObject.y },
    { x: roomObject.x + roomObject.width, y: roomObject.y + roomObject.height },
  ])

  const collisionLayer = mapJSON.layers.find((layer) => layer.name === "collision")
  if (!collisionLayer) throw new Error("No collision layer found in map")

  const objects = collisionLayer.objects.filter((object) => {
    // Check if object is inside the room
    const bounds = Matter.Bounds.create([
      { x: object.x, y: object.y },
      { x: object.x + object.width, y: object.y + object.height },
    ])
    return Matter.Bounds.overlaps(bounds, roomBounds)
  }).map((object) => 
    Matter.Bodies.rectangle(object.x + (object.width / 2), object.y + (object.height / 2), object.width, object.height, { isStatic: true }))
  
  console.log("Created collision objects:", objects.length)

  return objects
}

module.exports = loadTiledMap
