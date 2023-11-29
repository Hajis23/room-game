// This module has stub functions for the eventual socket api

import io from "socket.io-client"
import { getPlayer } from "./MainScene";

const socket = io("localhost:3000", {
  // transports: ["websocket"],
  auth: {
    id: "My player id"
  }
});

const serverTickRate = 1000 / 20;

const clientFrameRate = 1000 / 120;

const multiplier = serverTickRate / clientFrameRate;

socket.on("update", (data) => {
  const { bodies } = data
  for (const body of bodies) {
    console.log("updating body", body.label)
    const player = getPlayer(body.label);

    if (player) {
      console.log("updating player", body.label)
      player.setPosition(body.position.x, body.position.y);
      player.setVelocity(body.velocity.x * multiplier, body.velocity.y * multiplier);
      console.log(player.body.velocity, body.velocity)
      player.setAngle(body.angle);
      player.setAngularVelocity(body.angularVelocity);
      player.lastUpdated = Date.now();
    }
  }


});

export const sendInputMessage = async (input) => {
  // console.log('Sending input message:', input);
  socket.emit("input",input);
};
