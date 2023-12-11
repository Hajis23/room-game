import io from "socket.io-client";
import { inProduction, toWsAddress } from "./utils.js";

const fetchNeighbours = (socket, roomId) => {
    return new Promise((resolve) => {
        socket.emit("get_room_neighbours", roomId, (response, respond) => {
            resolve(response);
        });
    });
}

const fetchRoomServers = (socket) => {
    return new Promise((resolve) => {
        socket.emit('get_room_servers', (response, respond) => {
          resolve(response)
        });
    });
}


const address = toWsAddress(process.env.COORDINATOR);

export const getNeighbours = async (roomId) => {
    console.log(address)
    const socket = io(address);
    const servers = await fetchRoomServers(socket);
    const neighbours = await fetchNeighbours(socket, roomId);
    return neighbours.map(name => {
        let address = servers[name];
        if (!inProduction) {
            // Hack
            address = `${name}:${address.split(":")[1]}`;
        }

        return {"id": name, "address": address }
    })
}
