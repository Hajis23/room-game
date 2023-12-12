import Phaser from 'phaser';
import Matter from 'matter-js';
import { sendInputMessage, getClientUserId } from './socket';
import Player from './Player';
import Room from './Room';

const multiplier = 1000/20;

const players = {

};

const hideOldPlayers = () => {
  const now = Date.now();
  for (const id in players) {
    const player = getPlayer(id);
    if (player.lastUpdated < now - 1000) {
      player.destroy();
      delete players[id];
      console.log('hiding player', id)
    }
  }
}

const updatePlayer = (player, body) => {
  Matter.Body.setPosition(player.serverTrackingBody, body.position);
  // Matter.Body.setVelocity(player.serverTrackingBody, body.velocity);

  // player.setVelocity(body.velocity.x * multiplier, body.velocity.y * multiplier);
  player.animationState = body.animationState;
  if (!player.isClientPlayer) player.flipX = body.flipX;
  player.lastUpdated = Date.now();
}

/**
 *
 * @param {string} id
 * @returns {Player}
 */
export const getPlayer = (id) => players[id]

export default class MainScene extends Phaser.Scene {
  started = false;

  constructor() {
    super('main');
  }

  /**
   * Preload assets
   */
  preload() {
    this.load.image('tilesheet', 'assets/Tileset.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/base3.json');
    this.load.spritesheet('charactersheet', 'assets/playerSpriteSheet.png', { frameWidth: 47, frameHeight: 53 });
  }

  create() {
    console.log('Creating scene')

    // create the Tilemap (key matches the asset key from the loader)
    this.room = new Room(this);

    // Set event handlers
    this.sys.game.events.on('room_update', this.handleRoomUpdate, this);
    this.sys.game.events.on('start_game', this.startGame, this);
    this.sys.game.events.on('stop_game', this.stopGame, this);
    this.sys.game.events.on('change_room', this.handleRoomChange, this);

    // Init keyboard controls
    this.keys = this.input.keyboard.createCursorKeys();

    // Send input messages to server
    Object.keys(this.keys).forEach((key) => {
      this.keys[key].on('down', () => {
        sendInputMessage({ [key]: true });
      })
      this.keys[key].on('up', () => {
        sendInputMessage({ [key]: false });
      })
    })

    // Init camera
    this.cameras.main.setBounds(0, 0, this.room.widthInPixels, this.room.heightInPixels);
    this.cameras.main.setZoom(4);

    // When creating scene, start_game event is not yet captured so start game manually here
    this.startGame();
  }

  startGame() {
    console.log('starting game')

    // Create the player
    const userId = getClientUserId();
    this.player = new Player(this, 640, 483, 'charactersheet', 0, userId, true);
    players[this.player.id] = this.player;
    console.log('created player', this.player.id)
    this.cameras.main.fadeIn()
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.started = true;
  }

  stopGame() {
    console.log('stopping game')

    this.started = false;
    this.player.destroy();
    delete players[this.player.id];
    console.log(this.player.id, 'destroyed')
    this.player = null;
  }

  update(time, deltaTime) {
    if (!this.started) return;

    this.player.clientInput = this.getClientInput()
    for (const id in players) {
      const player = getPlayer(id);
      player.update();
    }
  }

  handleRoomUpdate(data) {
    const { bodies } = data
    for (const body of bodies) {
      let player = getPlayer(body.id);

      if (!player) {
        player = new Player(this, body.position.x, body.position.y, 'charactersheet', 0, body.id, false, new Phaser.Math.Vector2(body.position.x, body.position.y));
        players[player.id] = player;
      }

      updatePlayer(player, body);
    }

    hideOldPlayers();
  }

  getClientInput() {
    const input = {
      up: this.keys.up.isDown,
      down: this.keys.down.isDown,
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
    }
    return input;
  }

  handleRoomChange(data) {
    console.log('room change', data)
  }

  setDebug(isDebug) {
    this.matter.world.debugGraphic.visible = isDebug;
    console.log('debug', isDebug)
  }
}
