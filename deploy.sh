#
set -e


cd ./room_server/
docker buildx build . -t veikmaster/room_game_server:latest --platform linux/amd64 --push
cd ../

cd ./coordinator/
docker buildx build . -t veikmaster/room_game_coordinator:latest --platform linux/amd64 --push
cd ../

fly deploy ./fly/room1
fly deploy ./fly/room2
# fly deploy -i fly/room3/fly.toml
