import Matter from 'matter-js';
import Phaser from 'phaser';

/* eslint-disable */
const hashString = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }
  return hash;
}
/* eslint-enable */

export default class Player extends Phaser.GameObjects.Sprite {
  /**
   * @type {Matter.Body}
   */
  body = null;

  /**
   * @type {Matter.Body}
   */
  serverTrackingBody = null;

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
    this.body = scene.matter.add.gameObject(this, {
      shape: 'rectangle',
      width: 10,
      height: 20,
      frictionAir: 0.25, 
      frictionStatic: 0.5, 
      friction: 0.1, 
      mass: 100,
      collisionFilter: {
        category: 0x0001,
        mask: 0x0000,
      }
    }).body;

    this.serverTrackingBody = scene.matter.add.rectangle(this.x, this.y, 1, 1, {
      isStatic: true,
      collisionFilter: {
        category: 0x0002,
        mask: 0x0000,
      },
    })
    // Spring connecting to server position
    scene.matter.add.constraint(this.body, this.serverTrackingBody, 0, 0.002, {
      pointA: { x: 0, y: 0 },
      pointB: { x: 0, y: 0 },
      damping: 0.05,
      angularStiffness: 0.5,
    })

    const nameText = scene.add.text(0, 0, id, { fontSize: '14px', fill: '#fff' }).setOrigin(0.5, 0.5).setPosition(this.x, this.y - 15);
    nameText.scale = 0.2;
    this.nameText = nameText;

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
    Matter.Body.setAngularVelocity(this.body, 0);

    const {
      up, down, left, right,
    } = this.clientInput;

    let x = 0;
    let y = 0;

    if (up) y -= 0.07;
    if (down) y += 0.07;
    if (left) x -= 0.07;
    if (right) x += 0.07;

    Matter.Body.applyForce(this.body, this.body.position, { x, y });

    // Make text follow player
    this.nameText.setPosition(this.body.position.x + 5, this.body.position.y - 15);
    // Player draw order based on y position
    this.depth = this.y;
    // Draw text above player
    this.nameText.depth = this.depth + 2000;


    if (this.isDead) return;

    const isRunning = this.animationState === 'walk' || Object.values(this.clientInput).some((v) => v);

    const isRolling = this.anims.currentAnim.key === 'roll' && !this.anims.currentFrame.isLast;
    if (isRolling) { // Keep rolling until anim ends...
      return;
    }

    if (left) {
      this.setFlipX(true);
    } else if (right) {
      this.setFlipX(false);
    }

    if (isRunning) {
      this.anims.play('walk', true);
    } else {
      this.anims.play('idle', true);
    }

    super.update()
  }

  destroy() {
    this.nameText.destroy();
    super.destroy();
  }
}
