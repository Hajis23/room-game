# Room game

A prototype of a multi-server real-time online multiplayer game, implementing: 
- simple Server Meshing / Spatial partitioning between server nodes.
- Object replication between nodes
- Object transfer between nodes
- Server-authoritative physics with simple client-side prediction
- Server node discovery & coordination with a master node

We built it as a course project for the University of Helsinki Distributed Systems 2023 course.

The server nodes are based on NodeJS, run inside docker containers and communicate with the client and other server nodes via [socket.io](https://socket.io/).

The game client is created using [Phaser 3](https://github.com/photonstorm/phaser) with a [React](https://react.dev/) user interface.

The game features a simple dungeon-like map consisting of multiple rooms, created using Tiled. The players can freely move around the map and interact with other players (only by colliding with them). The rooms are simulated on separate servers and the player can seamlessly walk from one server to another.

## Setup

Make sure you have docker and npm installed.

Install dependencies for the client, cd to `client/` and run:
```
npm install
```

Install dependencies for the coordinator, cd to `coordinator/` and run:
```
npm install
```

The room server shouldn't need dependencies to be installed locally.

## Run

Run the Vite development server:
```
npm run client
```
The dev build is served at localhost:8000.

Run coordinator and 3 room servers with:
```
npm run room_server
```
This builds the required docker images and runs the compose file `room_server/docker-compose.yml`.

If you still come accross any `module not found`-errors, try running `npm install` locally in `room_server/` or `coordinator/`.
