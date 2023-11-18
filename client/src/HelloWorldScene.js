import Phaser from 'phaser';
import { sendInputMessage } from './socket';

export default class HelloWorldScene extends Phaser.Scene {
  keys = null;

  player = null;

  isDead = false;

  mapLayer = null;

  constructor() {
    super('hello-world');
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
    const map = this.make.tilemap({ key: 'tilemap' });

    // add the tileset image to the map
    const tileset = map.addTilesetImage('base', 'tilesheet');

    // Mark tiles with ids 48-51 as collidable
    map.setCollisionBetween(48, 51, true);

    // Create the base layer (floor and walls etc)
    this.mapLayer = map.createLayer('Base', tileset);

    // Uncomment to render collision boxes
    /* this.mapLayer.renderDebug(this.add.graphics(), {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    }) */

    // Another purely visual layer
    map.createLayer('Decoration', tileset);

    // Create the player sprite and add physics
    this.player = this.physics.add.sprite(300, 200, 'charactersheet', 0);
    this.player.scale = 0.5;
    this.player.setDamping(true);
    this.player.setMaxVelocity(70);
    this.player.setDrag(0.001);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 12, false);
    this.player.body.setOffset(14, 40);
    this.player.body.onCollide = true;

    // Create animations

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('charactersheet', { start: 36, end: 40 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('charactersheet', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'roll',
      frames: this.anims.generateFrameNumbers('charactersheet', { start: 41, end: 48 }),
      frameRate: 20,
      repeat: 0,
    });

    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNumbers('charactersheet', { start: 6, end: 7 }),
      frameRate: 2,
      repeat: 0,
    });

    this.player.anims.play('idle', true);

    // Init keyboard controls
    this.keys = this.input.keyboard.createCursorKeys();

    // Init camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(6);
    this.cameras.main.startFollow(this.player);

    // Send input messages to server every 100ms. Save the timer so we can for example cancel it later.
    this.inputInterval = this.time.addEvent({
      callback: () => {
        if (this.isDead) return;
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
    if (this.isDead) return;

    this.physics.collide(this.player, this.mapLayer);

    let isRunning = false;

    const isRolling = this.player.anims.currentAnim.key === 'roll' && !this.player.anims.currentFrame.isLast;
    if (isRolling) { // Keep rolling until anim ends...
      return;
    }

    // Trigger death from shift key
    if (this.keys.shift.isDown) {
      this.isDead = true;
      this.player.anims.play('death', true);
      return;
    }

    this.player.setAcceleration(0);

    if (this.keys.left.isDown) {
      this.player.setAccelerationX(-400);
      this.player.setFlipX(true);
      isRunning = true;
    } else if (this.keys.right.isDown) {
      this.player.setAccelerationX(400);
      this.player.setFlipX(false);
      isRunning = true;
    }
    if (this.keys.up.isDown) {
      this.player.setAccelerationY(-400);
      isRunning = true;
    } else if (this.keys.down.isDown) {
      this.player.setAccelerationY(400);
      isRunning = true;
    }

    if (this.keys.space.isDown && this.player.body.velocity.length() > 10) {
      this.player.anims.play('roll', true);
    } else if (isRunning) {
      this.player.anims.play('walk', true);
    } else {
      this.player.anims.play('idle', true);
    }
  }
}
