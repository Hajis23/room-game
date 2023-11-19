import Phaser from 'phaser';

import MainScene from './MainScene';

export default new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaser-container',
  scale: {
		mode: Phaser.Scale.ScaleModes.RESIZE,
		width: window.innerWidth,
		height: window.innerHeight,
	},
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
