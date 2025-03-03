# Updating MicroK8s Certificates for External Access

## **Issue Description**
When accessing MicroK8s from an external machine (e.g., your macOS host connecting to a VirtualBox VM via SSH), you may encounter TLS verification errors:

```
tls: failed to verify certificate: x509: certificate is valid for 10.0.2.15, 172.17.0.1, fd00::a00:27ff:fe9d:f061, not 192.168.1.9
```

### **Why Does This Happen?**
By default, MicroK8s generates self-signed certificates that only include certain predefined IPs (e.g., `127.0.0.1`, `10.152.183.1`). If your VirtualBox VM receives a different IP (e.g., `192.168.1.9`), MicroK8s will reject connections from that IP due to certificate mismatches.

To fix this, we need to **refresh the MicroK8s certificates** and ensure the correct IP is included.

---

## **Updating MicroK8s Certificates**
### **1️⃣ Backup Existing Certificates (Optional)**
While not required, you can back up the current certs just in case:
```sh
sudo cp -r /var/snap/microk8s/current/certs /var/snap/microk8s/current/certs.bak
```

---

### **2️⃣ Update the Certificate Configuration**
Edit the certificate template file:
```sh
sudo nano /var/snap/microk8s/current/certs/csr.conf.template
```

Find the `[ alt_names ]` section and add your VirtualBox VM's IP (`192.168.1.9`) as a new entry:

```
[ alt_names ]
DNS.1 = kubernetes
DNS.2 = kubernetes.default
DNS.3 = kubernetes.default.svc
DNS.4 = kubernetes.default.svc.cluster
DNS.5 = kubernetes.default.svc.cluster.local
IP.1 = 127.0.0.1
IP.2 = 10.152.183.1
IP.3 = 192.168.1.9  # 👈 Add this line
IP.4 = 172.18.0.1
IP.5 = 172.17.0.1
```
Save the file (`CTRL + X`, then `Y`, then `Enter`).

---

### **3️⃣ Refresh MicroK8s Certificates**
Instead of manually deleting certificates, use the built-in command to refresh them:
```sh
sudo microk8s refresh-certs --cert server.crt
```
If you need to refresh all certificates (e.g., if MicroK8s still does not work):
```sh
sudo microk8s refresh-certs --cert ca.crt
```
⚠ **Warning:** Refreshing the root CA (`ca.crt`) requires all nodes to leave and rejoin the cluster.

---

### **4️⃣ Restart MicroK8s**
After refreshing certificates, restart MicroK8s to apply the changes:
```sh
sudo microk8s stop
sudo microk8s start
```

Check if MicroK8s is running:
```sh
microk8s status --wait-ready
```

---

### **5️⃣ Verify That the New Certificates Include the Correct IP**
Check the updated certificate:
```sh
openssl x509 -in /var/snap/microk8s/current/certs/server.crt -text -noout | grep -A 2 "Subject Alternative Name"
```
You should now see `192.168.1.9` listed under **IP Address** entries.

---

### **6️⃣ Update the MicroK8s Configuration**
Check your current Kubernetes API server configuration:
```sh
microk8s.kubectl config view
```
If it still shows `127.0.0.1`, update it:
```sh
microk8s.kubectl config set-cluster microk8s-cluster --server=https://192.168.1.9:16443
```
Or manually edit:
```sh
sudo nano /var/snap/microk8s/current/credentials/client.config
```
Replace any reference of `127.0.0.1` with `192.168.1.9`, then save and exit.

---

### **7️⃣ Test Your Setup**
Try running:
```sh
microk8s.kubectl logs <pod-name>
```
If the logs are displayed **without TLS errors**, the issue is resolved! 🎉

---

## **Prevent Future Issues: Set a Static IP**
If `192.168.1.9` is **assigned dynamically** by VirtualBox, it may change after rebooting the VM. To prevent this, you can:
1. **Manually set a static IP in Ubuntu (Recommended)**
   ```sh
   sudo nano /etc/netplan/00-installer-config.yaml
   ```
   Add:
   ```yaml
   network:
     ethernets:
       eth0:
         dhcp4: no
         addresses:
           - 192.168.1.9/24
         gateway4: 192.168.1.1
         nameservers:
           addresses:
             - 8.8.8.8
             - 8.8.4.4
     version: 2
   ```
   Apply changes:
   ```sh
   sudo netplan apply
   ```

2. **Configure VirtualBox’s DHCP to Assign a Fixed IP**
   ```sh
   VBoxManage dhcpserver modify --network "HostOnly" --mac-address=<your-mac-address> --fixed-address 192.168.1.9
   ```

With a **static IP**, you won’t need to refresh certificates each time you restart your VM.

---

## **Conclusion**
By following this guide, you ensure that MicroK8s correctly recognizes your VirtualBox VM’s external IP (`192.168.1.9`). This prevents TLS errors when accessing logs, services, or API calls from outside the VM. 

If you set a **static IP**, you only need to do this once. Otherwise, you’ll need to repeat the process whenever the VM’s IP changes.

🚀 **Enjoy your fully functional MicroK8s setup!** 🚀


