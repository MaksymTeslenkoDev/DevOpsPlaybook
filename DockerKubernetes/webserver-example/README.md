# Nginx Web Server in Docker

## Project Structure
```
/
├── Dockerfile
├── index.html
├── README.md
```

## Description
This project sets up a simple **Nginx web server** running inside a **Docker container**. The container serves a static HTML page (`index.html`). The host machine can access the web page via **port 8080**.

Additionally, DNS has been configured for the VM in the host machine's `/etc/hosts` file:
```
192.168.1.9    virtualbox
```
This allows the VM to be accessed via `http://virtualbox:8080` from the host.

## Prerequisites
Ensure that you have **Docker** installed on your Ubuntu VM.

## Steps to Build and Run the Container

### 1️⃣ Build the Docker Image
Run the following command inside the project directory where the `Dockerfile` is located:
```sh
docker build -t my-nginx .
```
This creates a Docker image named `my-nginx`.

### 2️⃣ Run the Docker Container
Start the container and expose port `8080`:
```sh
docker run -d -p 8080:80 --name my-nginx-container my-nginx
```
**Explanation:**
- `-d` → Runs the container in detached mode.
- `-p 8080:80` → Maps port 8080 on the host to port 80 inside the container.
- `--name my-nginx-container` → Names the container `my-nginx-container`.

### 3️⃣ Verify the Running Container
Check if the container is running:
```sh
docker ps
```

### 4️⃣ Access the Web Server from Host Machine
Run the following command on your **macOS host**:
```sh
curl http://virtualbox:8080
```
If everything is set up correctly, you should see the following output:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <title>Nginx Web Server</title>

</head>

<body>
  <h1>Hello From Nginx Web Server Example</h1>
</body>
</html>
```

## Stopping and Removing the Container
To stop the running container:
```sh
docker stop my-nginx-container
```
To remove the container:
```sh
docker rm my-nginx-container
```

## Removing the Docker Image
To remove the image:
```sh
docker rmi my-nginx
```

## Checking Available Docker Images
To list all Docker images:
```sh
docker images
```

## Notes
- Ensure your VM's network is configured correctly for **port forwarding** or **bridged networking** if accessing from a different machine.
- If using **NAT mode**, you may need to set up **port forwarding** in VirtualBox.

