const {
  setCurrentPlayerInput,
  removePrimaryObject,
  createPlayer,
} = require("./game");

module.exports = (io, socket) => {
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

  console.log('a user connected', socket.id);

  const id = socket.handshake.auth.id;
  createPlayer(id);

  socket.on("disconnect", disconnect)
  socket.on("input", input);
};
