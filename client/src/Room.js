import Phaser from 'phaser';

export default class Room {
  constructor(scene) {
    // create the Tilemap (key matches the asset key from the loader)
    const map = scene.make.tilemap({ key: 'tilemap' });

    // add the tileset image to the map
    const tileset = map.addTilesetImage('base', 'tilesheet');

    // Mark tiles with ids 48-51 as collidable
    map.setCollisionBetween(48, 51, true);

    // Create the base layer (floor and walls etc)
    this.collisionLayer = map.createLayer('Base', tileset);

    // Render collision boxes
    this.collisionLayer.renderDebug(scene.add.graphics(), {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });

    // Another purely visual layer
    map.createLayer('Decoration', tileset);
  }
}
