import { io, Socket } from "socket.io-client"; 

/**
 * @type {{ address: string, id: string}[]}
 */
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

/**
 * @type {{ [id: string]: Socket }}
 */
const serverSockets = Object.fromEntries(
  neighbourList.map(({ id, address }) => [id, io(address)])
)

export const sendServerMessage = (roomId, type, payload) => {

}
