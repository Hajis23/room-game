export default class Room {
  /**
   * 
   * @param {Phaser.Scene} scene 
   */
  constructor(scene) {
    // create the Tilemap (key matches the asset key from the loader)
    const map = scene.make.tilemap({ key: 'tilemap' });

    // add the tileset image to the map
    const tileset = map.addTilesetImage('base', 'tilesheet');

    map.createLayer('Base', tileset);

    map.createLayer('Decoration', tileset);

    map.createLayer('Shade', tileset);

    const roofLayer = map.createLayer('Roof', tileset);
    roofLayer.setDepth(2000);


    // create colliders
    const collisionObjects = map.getObjectLayer('collision').objects;
    collisionObjects.filter((object) => object.rectangle).forEach((object) => {
      const body = scene.matter.add.rectangle(object.x + (object.width / 2), object.y + (object.height / 2), object.width, object.height, { isStatic: true });
      body.label = object.name;
      body.collisionFilter.category = 0x0002;
    });
  }
}
