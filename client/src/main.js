import Phaser from 'phaser';

import MainScene from './MainScene';

export default new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 1000,
  height: 800,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [MainScene],
});
