import io from "socket.io-client";
import { toWsAddress } from "./utils.js";

const fetchNeighbours = (socket, roomId) => {
    return new Promise((resolve) => {
        socket.emit("get_room_neighbours", roomId, (response, respond) => {
            resolve(response);
        });
    });
}

const fetchRoomId = (socket) => {
    return new Promise((resolve) => {
        socket.emit('register_room_server', process.env.PORT, (response, respond) => {
          resolve(response)
        });
    });
}

const fetchRoomAddress = (socket, roomId) => {
    return new Promise((resolve) => {
        socket.emit('get_room_server_address', roomId, (response, respond) => {
          resolve(response)
        });
    });
}

export const getNeighbours = async (roomId) => {
    const socketAddr = toWsAddress(process.env.COORDINATOR);
    console.log(socketAddr)
    const socket = io(socketAddr);
    const neighbourNames = await fetchNeighbours(socket, roomId);
    
    const neighbours = await Promise.all(neighbourNames.map(async name => {
        let address = "";
        while(address === ""){ //poll coordinator until it knows the address of neighbour
            address = await fetchRoomAddress(socket, name);
        }
        return {"id": name, "address": address }
    }));

    return neighbours
}


export const getRoomId = async () => {
    const address = toWsAddress(process.env.COORDINATOR);
    const socket = io(address);
    return await fetchRoomId(socket);
}