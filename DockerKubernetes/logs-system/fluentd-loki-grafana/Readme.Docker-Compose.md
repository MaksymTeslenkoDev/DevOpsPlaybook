# Running Centralized Logging System with Docker Compose

## 🚀 Overview
This setup uses **Docker Compose** to run a centralized logging system with:
- **Fluentd** for log collection
- **Loki** for log storage
- **Grafana** for visualization
- **Node.js Application** that logs using `pino`

---

## 📂 Project Structure
```
/centralized-logging
│── /fluentd
│   ├── Dockerfile
│   ├── fluent.conf
│── /grafana
│   ├── provisioning
│   │   ├── datasource
│── /app
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│── docker-compose.yml
│── README.md
```

---

## 🛠️ **Running the System with Docker Compose**

### 1️⃣ **Start the Services**
```sh
docker-compose up -d --build
```
This will:
- Build and start all services in the **my_network** Docker network.
- Configure Fluentd to collect logs from the Node.js app.
- Store logs in Loki.
- Provide a web interface for logs in Grafana at **http://localhost:3000**.

### 2️⃣ **Check Running Containers**
```sh
docker ps
```
Ensure all services (`loki`, `fluentd-loki`, `grafana`, `node-app`) are running.

### 3️⃣ **Access Grafana**
1. Open **Grafana**: [http://localhost:3000](http://localhost:3000)
2. **Login**: `admin / admin`
3. **Add Loki as a Data Source**:
   - Go to **Settings → Data Sources**.
   - Select **Loki**.
   - Set **URL: `http://loki:3100`**.
   - Click **Save & Test**.
4. **Query Logs**:
   - Go to **Explore**.
   - Select **Loki Data Source**.
   - Run:
     ```plaintext
     {app="node-app"} | json
     ```

---

## 🛑 **Stopping and Cleaning Up**
```sh
docker-compose down --volumes
```
This will **stop and remove** all running containers with volumes but **keep built images**.

To also **remove built images**, run:
```sh
docker-compose down --rmi all
```

---

## ✅ Summary
- **Fluentd collects logs** from the Node.js app.
- **Stores logs in Loki**.
- **Grafana visualizes logs**.
- **Health checks ensure Fluentd is ready before the app starts**.

🚀 **Now you have a fully functional centralized logging system using Docker Compose!**

