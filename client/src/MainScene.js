import Phaser from 'phaser';
import { sendInputMessage, getClientUserId } from './socket';
import Player from './Player';
import Room from './Room';

const serverTickRate = 1000 / 20;
const clientFrameRate = 1000 / 120;
const multiplier = serverTickRate / clientFrameRate;

const players = {

};

const hideOldPlayers = () => {
  const now = Date.now();
  for (const id in players) {
    const player = getPlayer(id);
    if (player.lastUpdated < now - 1000) {
      player.destroy();
      delete players[id];
      console.log("hiding player", id)
    }
  }
}


const updatePlayer = (player, body) => {
  console.log("updating player", body.label)
  player.setPosition(body.position.x, body.position.y);
  player.setVelocity(body.velocity.x * multiplier, body.velocity.y * multiplier);
  console.log(player.body.velocity, body.velocity)
  player.setAngle(body.angle);
  player.setAngularVelocity(body.angularVelocity);
  player.lastUpdated = Date.now();
}


/**
 * 
 * @param {string} id 
 * @returns {Player}
 */
export const getPlayer = (id) => {
  return players[id];
}

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('main');
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
    this.room = new Room(this);

    // Create the player
    const userId = getClientUserId();
    this.player = new Player(this, 300, 100, 'charactersheet', 0, userId);
    players[this.player.id] = this.player;

    // Set event handlers
    this.sys.game.events.on('room_update', this.handleRoomUpdate, this);

    // Init keyboard controls
    this.keys = this.input.keyboard.createCursorKeys();

    // Init camera
    this.cameras.main.setBounds(0, 0, this.room.widthInPixels, this.room.heightInPixels);
    this.cameras.main.setZoom(6);
    this.cameras.main.startFollow(this.player);

    // Send input messages to server every 100ms. Save the timer so we can for example cancel it later.
    this.inputInterval = this.time.addEvent({
      callback: () => {
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

  update(time, deltaTime) {
    for (const id in players) {
      const player = getPlayer(id);
      player.update();
    }
  }

  handleRoomUpdate(data){
    const { bodies } = data
    for (const body of bodies) {
      console.log("updating body", body.label)
      let player = getPlayer(body.label);  
      if (!player) {
        player = new Player(this, 300, 100, 'charactersheet', 0, body.label);
        players[player.id] = player; 
      }
      updatePlayer(player, body);
    }
  
    hideOldPlayers();
  }
}
