const { setCurrentPlayerInput } = require("./game");

module.exports = (io, socket) => {
  function input(data) {
    const id = socket.handshake.auth.id;

    setTimeout(() => { // Simulate latency
      setCurrentPlayerInput(id, data);
    }, 100);
  }

  socket.on("input", input);
};
