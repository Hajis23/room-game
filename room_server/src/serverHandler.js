import {
  updateReplicas,
} from "./game.js";

export default function(io, socket) {
  function update(payload) {
    updateReplicas(payload);
  }

  function disconnect(reason) {
    console.log("server disconnected", socket.id, reason);
  }

  const auth = socket.handshake.auth;
  console.log('a server connected', socket.id);

  socket.on("update", update);
  socket.on("disconnect", disconnect);
}
