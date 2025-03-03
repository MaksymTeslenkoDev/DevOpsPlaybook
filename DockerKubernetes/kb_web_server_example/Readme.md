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

### **Define the Deployment (deployment.yaml)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scm-server-deployment
  namespace: scm-namespace
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scm-server
  template:
    metadata:
      labels:
        app: scm-server
    spec:
      volumes:
        - name: server-config
          configMap:
            name: server-config
      containers:
        - name: scm-container
          image: devmaksdev/scm_web_server:latest
          volumeMounts:
            - name: server-config
              mountPath: /home/node/app/config/
          ports:
            - containerPort: 8081
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
apiVersion: v1
kind: Service
metadata:
  name: scm-server-service
  namespace: scm-namespace
spec:
  selector:
    app: scm-server
  ports:
    - protocol: TCP
      port: 80  # Exposed port
      targetPort: 8081  # Container port
      nodePort: 32263  # Externally accessible port
  type: NodePort
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
scm-server-service   NodePort   10.152.183.123   <none>        80:32263/TCP   5s
```

---

## **5️⃣ Testing the Deployment**
### **Send HTTP Requests**
Use `curl` or a browser to access the service:
```sh
curl http://192.168.1.9:32263/hello
```
Expected response:
```json
{
    "Ip": "10.0.1.1",
    "Host": "192.168.1.9:32263",
    "Req_Id": "req-9"
}
```

---

## **6️⃣ Verifying Load Balancing Across Pods**
Since we have **three replicas**, Kubernetes will distribute requests across them. To test this:

### **Send Multiple Requests**
```sh
for i in {1..10}; do curl -s http://192.168.1.9:32263/hello | jq .Ip; done
```

### **Expected Result**
The `Ip` field in the response should change, showing different pod IPs, confirming the requests are being balanced.

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


