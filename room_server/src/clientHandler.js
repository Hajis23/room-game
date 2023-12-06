import {
  setCurrentPlayerInput,
  removePrimaryObject,
  createPlayer,
} from "./game.js";

const USER = "user";
const ROOM = "room";

export default function(io, socket) {
  function input(data) {
    const id = socket.handshake.auth.id;

    setTimeout(() => { // Simulate latency
      setCurrentPlayerInput(id, data);
    }, 100);
  }

  function disconnect(reason) {
    console.log("client disconnected", socket.id, reason);

    const id = socket.handshake.auth.id;
    removePrimaryObject(id);
  }

  const auth = socket.handshake.auth;
  console.log('a user connected', socket.id);

  createPlayer(auth.id);

  socket.on("disconnect", disconnect)
  socket.on("input", input);
}
