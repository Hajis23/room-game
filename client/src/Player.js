import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.scale = 0.5;

    // Add the player to the scene
    scene.add.existing(this);

    // Add physics
    scene.physics.add.existing(this);

    // Set physics properties
    this.setCollideWorldBounds(true);
    this.setDrag(0.001);
    this.setDamping(true);
    this.setMaxVelocity(70);
    this.body.setSize(20, 12, false);
    this.body.setOffset(14, 40);
    this.body.onCollide = true;

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

  update(keys) {
    if (this.isDead) return;

    let isRunning = false;

    const isRolling = this.anims.currentAnim.key === 'roll' && !this.anims.currentFrame.isLast;
    if (isRolling) { // Keep rolling until anim ends...
      return;
    }

    // Trigger death from shift key
    if (keys.shift.isDown) {
      this.isDead = true;
      this.anims.play('death', true);
      return;
    }

    this.setAcceleration(0);

    if (keys.left.isDown) {
      this.setAccelerationX(-400);
      this.setFlipX(true);
      isRunning = true;
    } else if (keys.right.isDown) {
      this.setAccelerationX(400);
      this.setFlipX(false);
      isRunning = true;
    }
    if (keys.up.isDown) {
      this.setAccelerationY(-400);
      isRunning = true;
    } else if (keys.down.isDown) {
      this.setAccelerationY(400);
      isRunning = true;
    }

    if (keys.space.isDown && this.body.velocity.length() > 10) {
      this.anims.play('roll', true);
    } else if (isRunning) {
      this.anims.play('walk', true);
    } else {
      this.anims.play('idle', true);
    }
  }
}
