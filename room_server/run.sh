down(){
	docker-compose down
}

docker-compose build
trap 'down' INT 
docker-compose up
