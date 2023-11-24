// This module has stub functions for the eventual socket api

import io from "socket.io-client"

const socket = io("ws://localhost:3000");

export const sendInputMessage = async (input) => {
  console.log('Sending input message:', input);
  socket.emit("input",input);
};
