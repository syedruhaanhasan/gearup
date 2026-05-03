import { EventEmitter } from "events";

/** In-process pub/sub for SSE (single Node instance). Replace with Redis pub/sub when horizontally scaling. */
export const realtime = new EventEmitter();
realtime.setMaxListeners(200);

export function broadcastMechanics() {
  realtime.emit("mechanics");
}
