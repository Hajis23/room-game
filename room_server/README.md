# Room game server

The docker-compose sets up 3 servers that communicate with each other and web
browser clients via `socket.io`.
Each server has its own local state which is visible to the connected servers.

# Usage

Server will start with following command:
```
./run.sh
```
