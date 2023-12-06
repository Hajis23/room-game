import { io, Socket } from "socket.io-client"; 

/**
 * @type {{ address: string, id: string}[]}
 */
const neighbourList = JSON.parse(process.env.OTHER_SERVERS);

/**
 * @type {{ [id: string]: Socket }}
 */
export const serverSockets = Object.fromEntries(
  neighbourList.map(({ id, address }) => [id, io(address)])
)

export const sendServerMessage = (roomId, type, payload) => {

}


// Ping neighbours after 1 second
setTimeout(() => neighbourList.map(async ({ address }) => {
  try {
    const res = await fetch(address)
    console.log('neighbour', address, await res.text())
  } catch (e) {
    console.error('neighbour', address, e)
  }
}), 1000)
