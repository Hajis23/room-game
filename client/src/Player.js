import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, id) {
    super(scene, x, y, texture, frame);
    this.scale = 0.5;

    this.id = id;

    this.lastUpdated = Date.now();

    // Add the player to the scene
    scene.add.existing(this);

    // Add physics
    scene.physics.add.existing(this);

    this.body.setSize(20, 12, false);
    this.body.setOffset(14, 40);

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

    // Set idle animation
    this.anims.play('idle');
  }

  update() {
    if (this.isDead) return;

    let isRunning = false;

    const isRolling = this.anims.currentAnim.key === 'roll' && !this.anims.currentFrame.isLast;
    if (isRolling) { // Keep rolling until anim ends...
      return;
    }

    const EPSILON = 0.1;

    if (this.body.velocity.x < -EPSILON) {
      this.setFlipX(true);
      isRunning = true;
    } else if (this.body.velocity.x > EPSILON) {
      this.setFlipX(false);
      isRunning = true;
    }
    if (this.body.velocity.y < -EPSILON) {
      isRunning = true;
    } else if (this.body.velocity.y > EPSILON) {
      isRunning = true;
    }

    if (isRunning) {
      this.anims.play('walk', true);
    } else {
      this.anims.play('idle', true);
    }
  }
}
