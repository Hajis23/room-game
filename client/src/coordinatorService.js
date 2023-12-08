import { useEffect } from 'react';

import io from 'socket.io-client';

const url = 'localhost:3131';

const socket = io(url);

function onConnect() {
  console.log('- connect');
}

function onDisconnect() {
  console.log('- disconnect');
}

function checkUsername(username) {
  return new Promise((resolve) => {
    socket.emit('check', username, (response, respond) => {
      if (response) {
        resolve(response);
      }
    });
  });
}

function logoutFromCoordinator(){
  return new Promise((resolve) => {
    socket.emit('logout', (response, respond) => {
      console.log("logout")
      resolve()
    });
  });
}

function useCoordinator() {
  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
  }, []);

  return [ checkUsername, logoutFromCoordinator, status ];
}

export default useCoordinator;
