import Phaser from 'phaser';

import MainScene from './MainScene';
import LoginScene from './LoginScene';

let game = new Phaser.Game({
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
  scene: [LoginScene, MainScene],
});
export default game;


export const startGame = () => {
  game.scene.switch("login", "main");
}

export const stopGame = () => {
  game.scene.switch("main", "login");
}