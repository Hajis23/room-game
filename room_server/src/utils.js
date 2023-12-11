const timings = {};

/**
 * Measure the average time it takes to run a function over multiple calls.
 * @param {*} name
 * @param {*} fn
 */
const measureTime = (name, fn) => {
  const startMs = Date.now();
  fn();
  const endMs = Date.now();
  const durationMs = endMs - startMs;

  if (timings[name]) {
    timings[name].count += 1;
    timings[name].total += durationMs;
  } else {
    timings[name] = {
      count: 1,
      total: durationMs,
    };
  }
}

/**
 *
 * @param {*} name
 * @param {*} reset
 * @returns
 */
const getAverageTime = (name, reset = false) => {
  const timing = timings[name];
  if (!timing) return 0;
  const avg = timing.total / timing.count;
  if (reset) {
    delete timings[name];
  }
  return avg;
}

export const inProduction = process.env.NODE_ENV === 'production';

export const toHttpAddress = (address) => {
  // Address has no protocol, add it.
  return inProduction ? `https://${address}` : `http://${address}`;
}

export const toWsAddress = (address) => {
  // Address has no protocol, add it.
  return inProduction ? `wss://${address}` : `ws://${address}`;
}



import { getRoomId } from './coordinatorHandler.js';
console.log("fetching roomId from coordinator...")
export const ROOM_ID = await getRoomId();
console.log("got roomId:", ROOM_ID)

export { measureTime, getAverageTime };
