#
set -e


cd ./room_server/
docker buildx build . -t veikmaster/room_game_server:latest --platform linux/amd64 --push
cd ../
cd ./coordinator/
docker buildx build . -t veikmaster/room_game_coordinator:latest --platform linux/amd64 --push
cd ../

# -ha false: disable high availability which spins multiple machines, we only want one

fly deploy ./fly/room1 --ha=false
fly deploy ./fly/room2 --ha=false
fly deploy ./fly/room3 --ha=false
fly deploy ./fly/coordinator --ha=false
