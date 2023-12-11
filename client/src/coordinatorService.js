import { useEffect, useState } from 'react';

import io from 'socket.io-client';
import { inDevelopment } from './config';

const url = inDevelopment ? 'localhost:3131' : 'wss://hajis-room-game-coordinator.fly.dev/';

const socket = io(url, {
  transports: ['websocket'],
});

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

function requestRoomServers(){
  return new Promise((resolve) => {
    socket.emit('get_room_servers', (response, respond) => {
      if(response){
        if(inDevelopment){ //inside docker-compose room server addresses are container names, but the client must connect to localhost
          let result = {}
          for(const roomName in response){
            const port = response[roomName].split(':').at(-1)
            result[roomName] = `localhost:${port}`
          }
          resolve(result);
        }else{
          resolve(response);
        }
      }
      
    });
  });
}

function useCoordinator() {
  const [roomServers, setRoomServers] = useState({});
  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    requestRoomServers().then(servers => setRoomServers(servers));
  }, []);

  return [ checkUsername, logoutFromCoordinator, roomServers, status ];
}

export default useCoordinator;
