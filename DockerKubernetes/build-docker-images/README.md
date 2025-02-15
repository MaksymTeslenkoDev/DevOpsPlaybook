# 🚀 Docker Image Optimization & Deployment

## 📌 Task Overview
This repository contains two versions of a **Node.js application Docker image**:
1. **Unoptimized Image** (`Dockerfile.unoptimized.example`) - A basic version without optimizations.
2. **Optimized Image** (`Dockerfile.optimized.example`) - Uses **multi-stage builds** to reduce the final image size.

Both images have been **built, tagged, and pushed** to Docker Hub.

### 📂 Full Example Application
A complete example of the **Node.js application** that utilizes these Docker images can be found here:  
👉 **[GitHub Repository](https://github.com/MaksymTeslenkoDev/HighloadPlaybook/tree/master/domains/supply-chain/pkg/server)**

---

## 🚀 Docker Hub Repository Links
- **Optimized Image:** [devmaksdev/node-app-0.1](https://hub.docker.com/repository/docker/devmaksdev/node-app-0.1/general)
- **Unoptimized Image:** [devmaksdev/node-app-0.2](https://hub.docker.com/repository/docker/devmaksdev/node-app-0.2/general)

---

## 🚀 Building & Pushing Images to Docker Hub

### **1️⃣ Build the Unoptimized Image**
```sh
docker build -t devmaksdev/node-app-0.1:v1 -f Dockerfile.unoptimized.example .
```

### **2️⃣ Push the Unoptimized Image to Docker Hub**
```sh
docker push devmaksdev/node-app-0.1:v1
```

### **3️⃣ Build the Optimized Image**
```sh
docker build -t devmaksdev/node-app-0.2:v1 -f Dockerfile.optimized.example .
```

### **4️⃣ Push the Optimized Image to Docker Hub**
```sh
docker push devmaksdev/node-app-0.2:v1
```

---

## 📥 Pulling & Running the Images from Docker Hub

### **Run Unoptimized Image**
```sh
docker run -d --name node-app-unoptimized -p 3000:3000 devmaksdev/node-app-0.1:v1
```

### **Run Optimized Image**
```sh
docker run -d --name node-app-optimized -p 3000:3000 devmaksdev/node-app-0.2:v1
```

### **Verify Running Containers**
```sh
docker ps
```

---

## 📏 Image Size Comparison

After building both images, the following sizes were observed:

```sh
docker images
REPOSITORY                TAG              IMAGE ID       CREATED             SIZE
devmaksdev/node-app-0.2   v1               301403055291   10 seconds ago      180MB
devmaksdev/node-app-0.1   v1               3909b3dc4576   About an hour ago   414MB
```

- **Unoptimized Image (0.1)** → **414MB**
- **Optimized Image (0.2)** → **180MB** 🚀 **(smaller & faster!)**

---

## 🔥 Optimizations Used in `Dockerfile.optimized.example`
The optimized image was **significantly reduced in size** by using:
1. **Multi-Stage Builds** – The first stage compiles the app, and the second stage copies only the necessary files.
2. **Excluding `node_modules` in `.dockerignore`** – Ensuring only fresh dependencies are installed.
3. **Installing Only Production Dependencies** – Using:
   ```sh
   npm ci --only=production --ignore-scripts
   ```
4. **Using Alpine Base Image** – A lightweight Linux distribution for Node.js.

---

## ✅ Conclusion
By **using multi-stage builds**, we **reduced the Docker image size from 414MB to 180MB** without sacrificing functionality. 

**This makes deployments faster, reduces storage costs, and improves security!** 🚀