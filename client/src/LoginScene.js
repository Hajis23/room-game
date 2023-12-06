import Phaser from 'phaser';

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super('login');
  }

  preload() {}

  create() {
    const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const centerY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.add.text(centerX, centerY, 'ROOM GAME', { fontSize: 70 }).setOrigin(0.5);
    this.add.text(centerX, centerY + 70, 'Log in to start the game', { fontSize: 20 }).setOrigin(0.5);
  }

  update() {}
}
