import Phaser from 'phaser';

const hashString = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {

  /**
   * 
   * @param {Phaser.Scene} scene 
   * @param {*} x 
   * @param {*} y 
   * @param {*} texture 
   * @param {*} frame 
   * @param {*} id 
   * @param {*} isClientPlayer 
   */
  constructor(scene, x, y, texture, frame, id, isClientPlayer = false) {
    super(scene, x, y, texture, frame);
    this.scale = 0.5;

    this.id = id;
    this.lastUpdated = Date.now();
    this.animationState = 'idle';
    this.clientInput = {};
    this.flipX = false;
    this.isClientPlayer = isClientPlayer;

    // Add the player to the scene
    scene.add.existing(this);

    // Add physics
    scene.physics.add.existing(this);

    const nameText = scene.add.text(0, 0, id, { fontSize: '14px', fill: '#fff' }).setOrigin(0.5, 0.5).setPosition(this.x, this.y - 15);
    nameText.scale = 0.2;
    this.nameText = nameText;

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

    // Give player random color tint
    const max = 0xFFFFFF;
    this.tint = hashString(id) % max;
  }

  update() {
    // Make text follow player
    this.nameText.setPosition(this.x, this.y - 15);
    // Player draw order based on y position
    this.depth = this.y;
    // Draw text above player
    this.nameText.depth = this.depth + 1;
  
    if (this.isDead) return;

    let isRunning = this.animationState === 'walk' || Object.values(this.clientInput).some((v) => v);
    if (!this.anims) {
      console.log(this)
    }
    const isRolling = this.anims.currentAnim.key === 'roll' && !this.anims.currentFrame.isLast;
    if (isRolling) { // Keep rolling until anim ends...
      return;
    }

    if (this.clientInput.left) {
      this.setFlipX(true);
    } else if (this.clientInput.right) {
      this.setFlipX(false);
    }

    if (isRunning) {
      this.anims.play('walk', true);
    } else {
      this.anims.play('idle', true);
    }
  }

  destroy() {
    this.nameText.destroy();
    super.destroy();
  }
}
