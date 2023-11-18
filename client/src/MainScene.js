import Phaser from 'phaser';
import { sendInputMessage } from './socket';
import Player from './Player';
import Room from './Room';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('main');
  }

  /**
   * Preload assets
   */
  preload() {
    this.load.image('tilesheet', 'assets/Tileset.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/base.json');
    this.load.spritesheet('charactersheet', 'assets/playerSpriteSheet.png', { frameWidth: 47, frameHeight: 53 });
  }

  create() {
    // create the Tilemap (key matches the asset key from the loader)
    this.room = new Room(this);

    // Create the player
    this.player = new Player(this, 300, 100, 'charactersheet', 0);

    // Init keyboard controls
    this.keys = this.input.keyboard.createCursorKeys();

    // Init camera
    this.cameras.main.setBounds(0, 0, this.room.widthInPixels, this.room.heightInPixels);
    this.cameras.main.setZoom(6);
    this.cameras.main.startFollow(this.player);

    // Send input messages to server every 100ms. Save the timer so we can for example cancel it later.
    this.inputInterval = this.time.addEvent({
      callback: () => {
        const input = {
          left: this.keys.left.isDown,
          right: this.keys.right.isDown,
          up: this.keys.up.isDown,
          down: this.keys.down.isDown,
          space: this.keys.space.isDown,
        };
        // We could optimize this in many ways, for example not sending message if input is same as last time
        sendInputMessage(input);
      },
      callbackScope: this,
      delay: 100,
      loop: true,
    });
  }

  update() {
    this.physics.collide(this.player, this.room.collisionLayer);
    this.player.update(this.keys);
  }
}
