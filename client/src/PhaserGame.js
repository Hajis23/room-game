import Phaser from 'phaser';

import MainScene from './MainScene';
import LoginScene from './LoginScene';
import { connectToRoomServer, disconnectRoomServer } from './socket';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaser-container',
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  pixelArt: true,
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      gravity: {
        y: 0,
      }
    }
  },
  scene: [LoginScene, MainScene],
});
export default game;

export const startGame = (address, userId) => {
  connectToRoomServer(address, userId);
  game.scene.switch('login', 'main');
  game.events.emit('start_game');
}

export const stopGame = () => {
  game.scene.switch('main', 'login');
  disconnectRoomServer();
  game.events.emit('stop_game');
}

export const emitGameEvent = (event, payload) => {
  // console.log('EVENT', event)
  game.events.emit(event, payload);
}
