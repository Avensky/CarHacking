
# 🚗 CarHacking CTF, Toolkit, and Simulator

A curated collection of tools, scripts, and resources for automotive security research and CAN bus experimentation.

This project launches a 3D vehicle simulator where users can attempt code injections for points in a CTF.

When the fuel gauge reaches 0, the simulation ends and all gauges are reset.

---

## 📁 Project Structure

```t
CarHacking/
├── .github/actions       # Github actions
├── .github/workflows     # CICD yml files
├── apis/                 # Api collection
├── captures/             # Sample CAN bus data captures
├── controllers/          # controllers
├── docs/                 # Research papers and reference materials
├── frontend/             # Vite Frontend with React 
├── routes/               # Routing apis
├── utils/                # Reusable scripts
├── server.js             # Backend
├── README.md             # Project overview and usage instructions
```

---

## 🧰 Tools & Scripts

This repository includes various tools and scripts designed to assist in car hacking endeavors:

- **CAN Bus Sniffers**: Utilities to monitor and log CAN traffic.
- **Start Sim**: Simulates vehicle CAN Bus data.
- **Abort**: Kills all node processes ending the simulation.
- **Reload Node**: Restarts the server without restarting the device.
- **Reload UI**: Refreshes the browser.
- **Message Injectors**: Scripts to send custom messages onto the CAN bus.
- **Hack Car**: Script simulates a code injection, manipulating the vehicle gauges, and movements.
-**Command Line**: Command line allows for unique code injection from a browser.
- **Diagnostic Tools**: Programs to interact with vehicle ECUs using standard protocols.

*Note: Ensure you have the necessary permissions and are compliant with local laws before interacting with vehicle networks.*

---

## 📝 Documentation

The `docs/` directory contains valuable resources to deepen your understanding of automotive security:

- **Research Papers**: In-depth analyses of vehicle network vulnerabilities.
- **Presentations**: Slides from conferences and workshops on car hacking.
- **Guides**: Step-by-step instructions for setting up your own car hacking lab.

---

## 📌 Prerequisites

Before using the tools, ensure you have:

- **Hardware**: A compatible CAN interface device (e.g. Raspberry Pi)
- **Software**: Python 3.x installed on your system.
- **Permissions**: Appropriate rights to interact with vehicle networks.

## 🚀 Getting Started

To begin using the tools in this repository:

1. **Set Up Your Environment**: Ensure you have the necessary hardware (e.g., CAN interface devices) and software dependencies installed.

# 🐧 Flashing Raspberry Pi OS (Raspbian) on a Raspberry Pi

This guide walks you through flashing **Raspberry Pi OS** (formerly Raspbian) onto a microSD card and booting it on your Raspberry Pi.

---

## ✅ Requirements

- 🧠 A **Raspberry Pi** (any model)
- 💾 A **microSD card** (8GB+ recommended, Class 10/UHS-1)
- 💻 A computer with **internet access & microSD card reader or usb for mircroSD adapter**
- 🔌 A **power supply** for the Pi
- ⌨️ (Optional) Keyboard, mouse, and HDMI display

---

## 🔧 Step-by-Step Instructions

### 🥇 Step 1: Download Raspberry Pi Imager

1. Visit: [https://www.raspberrypi.com/software](https://www.raspberrypi.com/software)
2. Download and install the **Raspberry Pi Imager** for your OS (Windows/macOS/Linux)

---

### 🥈 Step 2: Insert and Select Your microSD Card

1. Insert your microSD card into your computer
2. Open **Raspberry Pi Imager**
3. Click **“Choose OS”** and select one:
   - `Raspberry Pi OS (32-bit)` (Recommended)
   - `Raspberry Pi OS Lite` (for headless setup, no GUI)

---

### 🛠️ Step 3: Configure (Optional)

Click the ⚙️ icon in the Imager to:

- Set a **hostname**
- Enable **SSH**
- Set **Wi-Fi SSID/password**
- Set **locale/timezone/keyboard**
- Create a **user account**

> ⚠️ These options save time if you're setting up a headless system.

---

### 🥉 Step 4: Flash the OS

1. Click **“Choose Storage”** → Select your SD card (Accept Updates)
2. Click **“Write”** → Wait for the flashing process to finish
3. Safely **eject** the card

---

### 🚀 Step 5: Boot the Raspberry Pi

1. Insert the flashed SD card into your Raspberry Pi
2. Plug in HDMI, keyboard, mouse, and power
3. Raspberry Pi OS will boot into the desktop or CLI

---

## 🧠 Optional: SSH & Wi-Fi (Headless Setup)

If you're not using a monitor/keyboard:

### Enable SSH:
Create a blank file named `ssh` (no extension) on the **boot** partition.

### Connect to Wi-Fi:
Create a file called `wpa_supplicant.conf` (in boot partition):

```bash
country=US
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
ssid="YourWiFiName"
psk="YourWiFiPassword"
}
```

Then boot the Pi and connect via:

```bash
ssh pi@<IP_ADDRESS>
or 

ssh -o IPQoS=throughput uri@192.168.1.175
```

### Save a Key Fingerprint
Type your password and save key to your list of known hosts.

🛠 First-Time Setup Commands
Open config menu:

```bash
  sudo raspi-config
```
Update the system:
```bash
  sudo apt update && sudo apt full-upgrade -y
```

📝 Notes
Default login (if using desktop OS):

Username: pi

Password: raspberry

Use a good-quality SD card and power supply for stability

## Add Environment Variables
```bash
  echo 'export NODE_ENV=production' >> ~/.profile
```
🔄 Apply it Immediately (without reboot):
After adding it, run:
```bash
  source ~/.profile
```

## ✅ Install `nvm`

Open your terminal and run:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

> This command downloads and runs the official install script from the `nvm-sh` GitHub repo.

---

## 🔄 Step 2: Activate `nvm`

After installation, activate `nvm` by sourcing your shell configuration file:

For **bash**:
```bash
source ~/.bashrc
```

---

## 🔍 Step 3: Verify Installation

Check if `nvm` was installed successfully:

```bash
nvm --version
```

You should see the version number (e.g., `0.40.1`).

---

## 🚀 Step 4: Install Node.js with `nvm`

You can now install any version of Node.js:

```bash
nvm install node          # Latest version
nvm install 18.20.3       # Specific version
nvm use 18.20.3           # Switch to version 18
```

Set a default version:

```bash
nvm alias default 18.20.3
```

---

## 📎 Notes

- `nvm` installs Node.js in your home directory (`~/.nvm`)
- It does **not require `sudo`** to manage Node versions

---

# 🚀 CI/CD Pipeline Setup for CarHacking (GitHub Actions + Self-Hosted Runner)

This guide explains how to set up a **self-hosted GitHub Actions runner** for deploying the [Avensky/CarHacking](https://github.com/Avensky/CarHacking) project using CI/CD on a Raspberry Pi or ARM64 device.

---

## 🔁 1. Clone the Repository and Prepare the Environment

```bash
# Create a directory recognized by Nginx
sudo mkdir -p /var/www/
sudo mkdir /var/www/CarHacking
cd /var/www/CarHacking

# Set correct ownership and permissions
sudo chown -R $USER:$USER /var/www/CarHacking
sudo chmod -R 755 /var/www/CarHacking
```

---

## 🍴 2. Fork the Repository

- Go to: [https://github.com/Avensky/CarHacking](https://github.com/Avensky/CarHacking)
- Click **Fork** and clone your forked version if needed.

---

## 🏃 3. Set Up a GitHub Self-Hosted Runner

1. Go to your fork on GitHub → **Settings** → **Actions** → **Runners**
2. Click **New self-hosted runner**
3. Choose:
   - OS: Linux
   - Architecture: ARM64 (for Raspberry Pi)
4. Follow the instructions (skip directory creation since we already did that - you should be in this directory /var/www/CarHacking)

---

## 📦 4. Download and Configure the Runner

Replace with the latest version from GitHub’s runner releases page (commenting out this section to avoid copy and paste, follow github's instructions):

```bash
# Download the runner ie:
# curl -o actions-runner-linux-arm64-2.324.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.324.0/actions-runner-linux-arm64-2.324.0.tar.gz

# Verify integrity

# Extract the runner
# tar xzf ./actions-runner-linux-arm64-2.324.0.tar.gz
```

---

## ⚙️ 5. Configure the Runner

```bash
# Create .env for environment variables
# sudo touch .env
# sudo chown -R $USER:$USER .env
# sudo chown -R $USER:$USER /home/$USER/

# Replace the token with your actual GitHub token
./config.sh --url https://github.com/<your-username>/CarHacking --token YOUR_TOKEN_HERE
```

> 🧠 During this step, you’ll name the runner and accept default prompts.

---

## ▶️ 6. Run the Runner

```bash
# Run manually
./run.sh
```

---

## 🛠 7. Install as a Service (Recommended)

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

---

## ✅ Done!

Your GitHub Actions runner is now connected. Any workflow `.yml` files you add to `.github/workflows/` in your repo will now execute using this runner.

---

# 🚀 Manually Triggering Initial GitHub Actions Workflow

After setting up your **self-hosted GitHub Actions runner**, you need to manually trigger the first workflow to verify the runner and kick off the deployment pipeline.

---

## 📂 Workflow File: `init.yml`

Your workflow uses:

```yaml
on:
  workflow_dispatch:
```

This enables **manual triggering** from the GitHub web interface.

---

## 🧭 How to Manually Trigger the Workflow

1. Go to your **GitHub repository** (your fork).
2. Click the **"Actions"** tab.
3. In the left sidebar, select **"Inital Deployment"** (or whatever you named the workflow).
4. Click the **"Run workflow"** dropdown.
5. Choose the branch (e.g., `main`), and click **"Run workflow"**.

> This will run the full pipeline on your **self-hosted runner**, executing the `backend`, `frontend`, and `build` jobs.

---

## 🧪 What Happens in the Workflow

The workflow performs these steps across 3 jobs:

### 🔧 `backend` job:
- Checks out code
- Sets up Node.js
- Caches `node_modules`
- Installs dependencies
- Lints and tests backend

### 🎨 `frontend` job:
- Waits for `backend` to finish
- Repeats setup and linting steps for frontend code

### 🏗 `build` job:
- Waits for `frontend`
- Builds the production frontend with `npm run build`

---

✅ Once complete, the runner should have tested, linted, and built your app for deployment.

# 🌐 Install and Configure NGINX with PM2

This guide walks you through installing **PM2** and **NGINX** on a Raspberry Pi to persist and proxy a Node.js backend using GitHub Actions and virtual CAN bus.

---

## 🔧 Install PM2 for Persistent Node Server
Verify your server runs then close it.
```bash
node /var/www/CarHacking/_work/CarHacking/CarHacking/server.js
```
Install pm2

```bash
npm install -g pm2
pm2 start /var/www/CarHacking/_work/CarHacking/CarHacking/server.js --name CarHacking
pm2 startup
```


fixing pipeline errors

```bash
pm2 delete all
pm2 unstartup
pm2 startup
pm2 save
```

NODE_ENV=production node var/www/CarHacking/_work/CarHacking/CarHacking/server.js 

To finalize the startup script:

```bash
# Replace the path below with your actual Node.js version path

sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v24.1.0/bin \
    /home/pi/.nvm/versions/node/v24.1.0/lib/node_modules/pm2/bin/pm2 \
    startup systemd -u pi --hp /home/pi

pm2 save
```

---

## 🌍 Install NGINX (Reverse Proxy for Frontend + API)

```bash
sudo apt update
sudo apt install nginx
```

---

## 🗂 Set Up Server Directory Permissions

```bash
sudo chown -R $USER:$USER /var/www/CarHacking
sudo chmod -R 755 /var/www/CarHacking
sudo chown -R $USER:$USER /var/www/CarHacking/_work/CarHacking/CarHacking/frontend/dist
sudo chmod -R 777 /var/www/CarHacking
```

---

## 📝 Configure NGINX Site

Edit the NGINX site configuration:

```bash
sudo nano /etc/nginx/sites-available/CarHacking
```

```t
server {
  listen 80;
  listen [::]:80;

  root /var/www/CarHacking/_work/CarHacking/CarHacking/frontend/dist;
  index index.html index.htm index.nginx-debian.html;

  server_name _;

  location / {
    try_files $uri $uri/ =404;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_buffers 8 16k;
    proxy_buffer_size 32k;
  }

  location /socket.io/ {
    proxy_pass http://localhost:5000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```


Enable the site and tweak NGINX settings:

```bash
sudo ln -s /etc/nginx/sites-available/CarHacking /etc/nginx/sites-enabled/
sudo nano /etc/nginx/nginx.conf
```

In the `http` block, ensure:

```s
server_names_hash_bucket_size 64;
```

---

## 🔁 Remove Default, Test, and Restart NGINX

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🚗 Set Up Virtual CAN Bus

```bash
sudo apt-get install can-utils
sudo modprobe vcan
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0
```

---

## Set Up Environment Variables
```bash
  nano ~/.bashrc
```

## Add This to Bottom of File
```s
  export NODE_ENV = production
  export PORT=5000
  export IP=192.168.41.216
  export Home_IP=192.168.1.175
```

## Load Environment Variables
```bash
  source ~/.bashrc
```

## 🔄 Recovery After Restart / IP Change

## Create Startup Script to Account For Ip Change
```bash
sudo nano /usr/local/bin/carhacking-startup.sh
```

## Paste, Save & exit, 
```t
  #!/bin/bash

  echo "➡️ Starting CarHacking service..."
  cd /var/www/CarHacking
  sudo ./svc.sh start

  echo "➡️ Checking for vcan0..."
  if ! ip link show vcan0 &> /dev/null; then
    echo "➡️ vcan0 does not exist. Creating..."
    sudo ip link add dev vcan0 type vcan
    sudo ip link set up vcan0
  else
    echo "✅ vcan0 already exists."
  fi
```

## make it executable:
```bash
  sudo chmod +x /usr/local/bin/carhacking-startup.sh
```

## Run it automatically on boot
```bash
sudo nano /etc/systemd/system/carhacking.service
```

## Copy Paste Exit
```t
[Unit]
Description=CarHacking Auto Startup Script
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/carhacking-startup.sh
RemainAfterExit=true

[Install]
WantedBy=multi-user.target

```

## Reload, Enable, And Test
```bash
sudo systemctl daemon-reload
sudo systemctl enable carhacking.service
sudo systemctl start carhacking.service
sudo systemctl status carhacking.service
```

# Manual Recovery From IP Change
### 1. Restart GitHub Actions Runner
```bash
cd /var/www/CarHacking
sudo ./svc.sh start
```

### 2. Restart Virtual CAN Bus
```bash
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0
```

### 3. Restart PM2 Server
```bash
pm2 restart 0
```

---

## 🌐 Recover From IP Address Change

### Stop server:

```bash
pm2 stop 0
```

### Find your new IP:

```bash
hostname -I
```

### Update `server_name` in NGINX config:

```bash
sudo nano /etc/nginx/sites-available/CarHacking
```

Update:
```s
server_name <new.ip.address>;
```

### Restart NGINX:

```bash
sudo nginx -t
sudo service nginx restart
```
---

# 🤝 Contributing

Contributions are welcome! If you have tools, scripts, or documentation to add:

1. **Fork the Repository**

2. **Create a New Branch**:

```bash
  git checkout -b feature/your-feature-name
```

3. **Commit Your Changes**:

```bash
  git commit -m "Add your feature"
```

4. **Push to Your Fork**:

```bash
  git push origin
```

5. **Create a Pull Request**

Please ensure your contributions adhere to the project's coding standards and include appropriate documentation.

---

## 📬 Contact

For questions, suggestions, or collaborations, please open an issue or contact [Avensky](https://github.com/Avensky).


# Acknowledgements

Project concept and execution inspired by rhysmorgan134/Can-App

Frontend inspired by Domenicobrz/R3F-in-practice

T-90M 3D model
"T-90M (With interior) [FREE]" (https://skfb.ly/oWGUu) by DerpDude is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

Panzer II model
"Panzer II (Pz.Kpfw. II)" (https://skfb.ly/oTOqy) by vmatthew is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
