# Docker Networking and Volumes

## Task Description

This example covers creating containers with different network types and using a shared Docker Volume.

## Task Execution

### 1. Creating Containers with Different Network Types

#### Custom Bridge Network
```bash
sudo docker network create example_bridge_network
```

#### Run Two Containers with a Custom Bridge Network
```bash
sudo docker run -d --name nginx-server1 --network example_bridge_network -p 8080:80 nginx
sudo docker run -d --name nginx-server2 --network example_bridge_network -p 8081:80 nginx
```

#### Test Two Containers Accessibility within the Same Bridge Network
```bash
sudo docker exec -it nginx-server2 sh
# curl http://nginx-server1
```

#### Creating a Container with Host Network Type
```bash
sudo docker run -d --name nginx-server-host --network host nginx
```

#### Test from Host Machine
```bash
curl localhost
```

#### Creating a None Network Container
```bash
sudo docker run -d --name none_container --network none busybox sleep 3600
```

#### Verify Network Isolation
```bash
sudo docker exec -it none_container sh
/ # ping -c 4 8.8.8.8
```
Expected output: `Network is unreachable`

### 2. Creating and Using a Shared Docker Volume

#### Create a Volume
```bash
sudo docker volume create shared_volume
```

#### Inspect Created Volume
```bash
sudo docker inspect shared_volume
```

#### Run Two Containers Using the Shared Volume
```bash
sudo docker run -d --name producer -v shared_volume:/logs busybox sleep 3600
sudo docker run -d --name consumer -v shared_volume:/logs busybox sleep 3600
```

#### Write a Log File in the Producer Container
```bash
sudo docker exec -it producer sh
/ # echo "This is a test log entry" > /logs/example.log
```

#### Verify Log File Existence in the Consumer Container
```bash
sudo docker exec -it consumer sh
/ # ls /logs/
example.log
```

#### Stop and Delete Containers
```bash
sudo docker stop producer consumer
sudo docker rm producer consumer
```

#### Check if Volume Data Still Exists
```bash
sudo cat /var/lib/docker/volumes/shared_volume/_data/example.log
```
Expected output: `This is a test log entry`

