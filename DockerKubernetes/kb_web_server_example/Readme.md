# Deploying a Kubernetes Application with ConfigMap, Service, and Namespace

## **Overview**
This guide describes how to deploy a Kubernetes application using **Deployments**, **ConfigMaps**, **Services**, and **Namespaces**. The final setup will allow us to send HTTP requests to a **LoadBalancer or NodePort service**, which distributes traffic across multiple pods.

---

## **1️⃣ Creating a Namespace**
Namespaces help organize resources in Kubernetes. First, create a namespace for your application:

### **Define the Namespace (namespace.yaml)**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: scm-namespace
```

### **Apply the Namespace**
```sh
microk8s.kubectl apply -f namespace.yaml
```

---

## **2️⃣ Creating a ConfigMap**
A ConfigMap stores configuration data separately from the application.

### **Create a ConfigMap from a File**
Ensure you have a config file (e.g., `server.config.json`):
```json
{
    "setting1": "value1",
    "setting2": "value2"
}
```
Then, create the ConfigMap:
```sh
microk8s.kubectl create configmap server-config --from-file=server.config.json -n scm-namespace
```

### **Verify the ConfigMap**
```sh
microk8s.kubectl get configmaps -n scm-namespace
microk8s.kubectl describe configmap server-config -n scm-namespace
```

---

## **3️⃣ Creating a Deployment**
The Deployment ensures that three replicas of the application are always running.

### **Define the Deployment (server_deployment.yaml)**
```yaml
apiVersion: apps/v1 # API version for Deployments
kind: Deployment # Defines a Kubernetes Deployment
metadata: # Name of the Deployment
  name: scm-server-deployment 
spec:
  replicas: 3 # Specifies 3 replicas (pods) for this deployment
  selector:
    matchLabels:
      app: scm-server # Selects pods matching this label
  template:
    metadata:
      labels:
        app: scm-server # Labels assigned to pods created by this deployment
    spec:
      volumes:
        - name: server-config # Name of the volume
          configMap:
            name: server-config # Mounts the ConfigMap named 'server-config'
      containers:
        - name: scm-container # Container name
          image: devmaksdev/scm_web_server:latest # Image to use
          env:
            - name: POD_NAME # Sets an environment variable with the pod name
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_IP # Sets an environment variable with the pod's internal IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
            - name: POD_UID # Sets an environment variable with the pod's UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
            - name: POD_NAMESPACE # Sets an environment variable with the pod's namespace
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          resources:
            limits:
              cpu: "125m"  # 1/8 of a CPU core (1000m = 1 CPU)
              memory: "256Mi"  # 1/4 of a GiB RAM (1024Mi = 1 GiB)
            requests:
              cpu: "125m"  # Minimum guaranteed CPU allocation
              memory: "256Mi"  # Minimum guaranteed memory allocation
          volumeMounts:
            - name: server-config # Mounts the 'server-config' volume
              mountPath: /home/app/node/config/ # Path inside the container
          ports:
            - containerPort: 8081 # Exposes port 8081 in the container

```

### **Apply the Deployment**
```sh
microk8s.kubectl apply -f deployment.yaml -n scm-namespace
```

### **Verify Deployment & Pods**
```sh
microk8s.kubectl get deployments -n scm-namespace
microk8s.kubectl get pods -n scm-namespace
```

To check detailed status:
```sh
microk8s.kubectl describe deployment scm-server-deployment -n scm-namespace
```

---

## **4️⃣ Creating a Service**
A Service exposes the pods to external traffic.

### **Define the Service (service.yaml)**
```yaml
apiVersion: v1  # Specifies the Kubernetes API version for Services
kind: Service  # Defines a Service resource
metadata:
  name: scm-server-service  # Name of the Service
spec:
  selector:
    app: scm-server  # Matches pods with this label to route traffic to them
  ports:
    - protocol: TCP  # Specifies the protocol (TCP/UDP)
      port: 80  # External port on the service that clients use
      targetPort: 8081  # Internal container port where the application is running
      nodePort: 30808  # Exposed port on the node (should be in range 30000-32767)
  type: NodePort  # Exposes the service on each node's IP at a static port
```

### **Apply the Service**
```sh
microk8s.kubectl apply -f service.yaml -n scm-namespace
```

### **Verify the Service**
```sh
microk8s.kubectl get services -n scm-namespace
```
Expected Output:
```
NAME                 TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
scm-server-service   NodePort   10.152.183.123   <none>        80:30808/TCP   5s
```

---

## **5️⃣ Testing the Deployment**
### **Send HTTP Requests**
Use `curl` or a browser to access the service:
```sh
curl http://192.168.1.9:30808/hello
```
Expected response:
```json
{
  "name": "scm-server-deployment-59c4797bc5-ttv7p",
  "ip": "10.1.243.227",
  "uid": "1dc75528-fc70-4bd6-8841-8505f79ebee2",
  "namespace": "namespace-scm-server",
  "req_ip": "10.0.1.1",
  "req_id": "req-4h"
}
```

---

## **6️⃣ Verifying Load Balancing Across Pods**
Since we have **three replicas**, Kubernetes will distribute requests across them. To test this:

### **Send Multiple Requests**
```sh
siege -c5 -r10 -v http://192.168.1.9:30808/hello
```

### **Expected Result**
The `ip, name, uid` field in the response should change, showing different pod ips, confirming the requests are being balanced.

---

## **7️⃣ Useful Commands for Managing Resources**

### **Get All Resources in the Namespace**
```sh
microk8s.kubectl get all -n scm-namespace
```

### **Check Pod Logs**
```sh
microk8s.kubectl logs -f <pod-name> -n scm-namespace
```

### **Restart Deployment**
```sh
microk8s.kubectl rollout restart deployment scm-server-deployment -n scm-namespace
```

### **Delete Resources**
```sh
microk8s.kubectl delete deployment scm-server-deployment -n scm-namespace
microk8s.kubectl delete service scm-server-service -n scm-namespace
microk8s.kubectl delete configmap server-config -n scm-namespace
microk8s.kubectl delete namespace scm-namespace
```

---

## **8️⃣ Why This Works**
- **Pods** run multiple instances of the app, providing high availability.
- **ConfigMap** decouples configuration, allowing changes without modifying containers.
- **Service (NodePort)** exposes pods externally and balances traffic among replicas.
- **Each request is forwarded to a different pod** based on Kubernetes' internal load balancing.

---

## **Conclusion**
This guide covers the full setup of a Kubernetes Deployment using MicroK8s, including:
- Creating a **namespace**
- Deploying an app with **ConfigMap**
- Exposing it with a **NodePort service**
- Testing traffic distribution among **replicas**

🚀 **Now you have a scalable Kubernetes app running!**


