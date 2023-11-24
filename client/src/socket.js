// This module has stub functions for the eventual socket api

import io from "socket.io-client"

const socket = io("localhost:3000", {
  // transports: ["websocket"],
});

socket.on("update", (data) => {
  console.log("update:", data);
});

export const sendInputMessage = async (input) => {
  // console.log('Sending input message:', input);
  socket.emit("input",input);
};
