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
  }
}
