# ReadME

edit: summer 2024
task: update front-end
attemp1: Install 3d graphics for online experience using threejs

![Gauges screenshot](https://user-images.githubusercontent.com/79558669/180919193-4b0581e3-ed1f-457c-8e1e-63e7c2ea8a78.png)

![GitHub last commit](https://img.shields.io/github/last-commit/crice114/CarHacking)

## About

This project will create a 3-d model render of a tank and gagues along the interface.

The project runs on a Raspberry Pi and simulates a car outputting revs, speed, and fuel consumption(this is shown at a rate that is sped up for functional timing purposes) and displays via the frond end using nodejs, threejs, react, fiber, and socketcan.

When the fuel gauge reaches 0, the simulation ends and all gauges are reset.The Pi model I am using is Raspberry Pi 4 model B.

The server is created using express, socket.io, socketcan and the gauges are created with the help of an existing canvas-gauge template.

## Prerequites

Raspberry Pi 4/5 model B.
Raspbian 64 bit OS.

## Installation

# Flash 64 bit os raspbian

# Connect to the internet and accept updates

# INSTRUCTIONS

## This project was developed using production assets to prevent unexpected problems, ensuring for a robust system

## About the Interface

Start Sim - engages the Car.js script from the backend, simulating an engine accelerating and shifting gears 1-6. Engine reaches top speed at 6k rpms in 6th gear. Script will run until the fuel runs out.

Abort - kills all node processes including the Car Simulation

Reload Node - restarts the server without restarting the device

Reload UI - refreshes the browser

Hack Car - Sends a code injection, manipulating speed and rpms

Command Line - Can be used to remotely reboot the device or send commands directly from browser to pi

# Flash Raspian os 64 bit

# Set up Pi and process all updates

# setup environment variables - create a file and add the variable

# Go to preferences then Raspberry Pi Configuration then interfaces, and enable SSH:

ssh <username>@<ipaddress>

# type your password and save a key fingerprint to your list of known hosts

# type yes and continue

The authenticity of host '<hostname> (<hostname>)' can't be established.
<KEY> key fingerprint is SHA256:<SHA>.

This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes

# Create environment variables

sudo nano ~/.profile
NODE_ENV=production

source ~/.profile
echo $NODE_ENV

# Setup node and npm

# install node version manager

sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# activate nvm

source ~/.bashrc

# confirm installation

command -v nvm

# install node

nvm install 18

# setup continuous integration / continuous delivery pipeline

# make a dir in /var/www/ -- This is necessary for nginx to recognize it as a website

sudo mkdir -p /var/www/
sudo mkdir /var/www/CarHacking; cd /var/www/CarHacking;

<!-- sudo mkdir -p /var/www/CarHacking; cd /var/www/CarHacking; -->

sudo chown -R $USER:$USER /var/www/CarHacking;
sudo chmod -R 755 /var/www/CarHacking;

# Create your own fork on the repository https://github.com/Avensky/CarHacking

# On Github go to your project>settings>actions>runners>new self-hosted runner>linux>ARM64

<!-- for ubuntu use the command to check architecture: uname -a -->

# Use the instructions on github with sudo, skip folder creation since we already made one. The instructions should look something like this:

# Download the latest runner package

#sudo curl -o actions-runner-linux-arm64-2.317.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-arm64-2.317.0.tar.gz;

echo "7e8e2095d2c30bbaa3d2ef03505622b883d9cb985add6596dbe2f234ece308f3 actions-runner-linux-arm64-2.317.0.tar.gz" | shasum -a 256 -c;

#sudo tar xzf ./actions-runner-linux-arm64-2.319.1.tar.gz;

# configure

sudo touch .env;
sudo chown -R $USER:$USER .env;
sudo chown -R $USER:$USER /home/uri/;

./config.sh --url https://github.com/Avensky/CarHacking --token THISISJUSTASAMPLETOKEN;

- ./run.sh

## Name the runner and select defaults

sudo ./svc.sh install;
sudo ./svc.sh start;

## INSTALL PM2 for persistant server

npm install -g pm2

<!-- sudo apt update && sudo apt install curl && sudo curl -sL https://raw.githubusercontent.com/Unitech/pm2/master/packager/setup.deb.sh | sudo -E bash - -->

node /var/www/CarHacking/\_work/CarHacking/CarHacking/backend/server.js
pm2 start /var/www/CarHacking/\_work/CarHacking/CarHacking/backend/server.js --name CarHacking
pm2 startup

To setup the Startup Script, copy/paste the following command:

#sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v18.20.3/bin /home/pi/.nvm/versions/node/v18.20.3/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi

pm2 save

# Install NGIX - Forwards requests to client using reverse proxy

- sudo apt update;
  sudo apt install nginx;
- sudo ufw app list

# Setup Server Block

## NOTE: If you need to delete this dir and start a new one, rerun this permissions on the new build

sudo chown -R $USER:$USER /var/www/CarHacking;
sudo chmod -R 755 /var/www/CarHacking;

sudo chown -R $USER:$USER /var/www/CarHacking/\_work/CarHacking/CarHacking/frontend/build
sudo chown -R $USER:$USER /var/www/CarHacking/;
sudo chmod -R 755 /var/www/CarHacking;
sudo chmod -R 777 /var/www/CarHacking;

- sudo nano /etc/nginx/sites-available/CarHacking

# edit server_name to match your ip

## restart systemctl when updating

```
server {
  listen 80;
  listen [::]:80;

  root /var/www/CarHacking/\_work/CarHacking/CarHacking/frontend/build;
  index index.html index.htm index.nginx-debian.html;

  server_name <ipaddress>;

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

- sudo ln -s /etc/nginx/sites-available/CarHacking /etc/nginx/sites-enabled/

- sudo nano /etc/nginx/nginx.conf
  ...
  http {
  ...
  server_names_hash_bucket_size 64;
  ...
  }
  ...

sudo systemctl status nginx.service
sudo systemctl start nginx.service
sudo systemctl reload nginx.service;
sudo systemctl restart nginx.service
sudo systemctl restart nginx;

sudo nginx -t;
sudo service nginx restart;
sudo service nginx status;

# set up virtual canbus

sudo apt-get install can-utils
sudo modprobe vcan

# use these when resetting pi on a different network

sudo ip link add dev vcan0 type vcan;
sudo ip link set up vcan0;

# IMPORTANT!!!

# recovering from a restart requires to check runner, canbus, and nginx

## reload the runner

cd /var/www/CarHacking;
sudo ./svc.sh start;

<!-- ## Test and look for vcan
ifconfig -->

<!-- # on your pc type [Raspberry Pi IP Address]:3000/index.html in a web browser
http://192.168.yur.ip -->
<!--
# in a terminal 2 start sending car data to gauges in terminal #1
node car.js -->

<!-- # in a terminal 3 hack the car gauges, do a cansend to the virtual canbus ID(found by cansniffer) and send in 16 bits of data to manipulate gauges.
cansend vcan0 1F4#AAAAAAAAAAAAAAAA -->

# IMPORTANT!!!!!!!

# Recovering from a change in IP Address

## Stop the server

pm2 stop 0

## edit server block server_name to match your ip

### to get ip

`hostname -I`

### edit nginx configuration and add your new ip

sudo nano /etc/nginx/sites-available/CarHacking
`#server_name <192.168.old.ip> <192.168.new.ip>;`

## test the configuration and reload

sudo nginx -t;
sudo service nginx restart;

<!-- ## To restore Broken pipeline remove the service
cd /var/www/CarHacking/;
sudo ./svc.sh uninstall; -->

<!-- ## on github go to repo>settings>actions>runner>remove runner
## to remove runner copy the command shown to you by github
```#./config.sh remove --token JUSTANEXAMPLE4SBTGNCJMVPLGQ4CLS;``` -->

<!-- ## once thats done force remove the runner on github
## click on 'New self-hosted runner'>linux>ARM64 -->
<!-- ```#sudo curl -o actions-runner-linux-x64-2.317.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-x64-2.317.0.tar.gz``` -->
<!--
## reinstall the service
sudo tar xzf ./actions-runner-linux-arm64-2.317.0.tar.gz -->

<!-- ## install runner using new token
sudo chmod -R 777 /var/www/CarHacking;
```#./config.sh --url https://github.com/Avensky/CarHacking --token USEYOURNEWTOKENIVNYBD3GRTPBQ``` -->

## restart the service

cd /var/www/CarHacking;
sudo ./svc.sh install;
sudo ./svc.sh start;

# set up a new canbus to reflect change in ip

sudo ip link add dev vcan0 type vcan;
sudo ip link set up vcan0;

# restart server

pm2 restart 0

## Recovering from a restart (But Same IP)

sudo ip link add dev vcan0 type vcan;
sudo ip link set up vcan0;
cd /var/www/CarHacking/;
sudo ./svc.sh start;

## Debugging backend short cuts

node /var/www/CarHacking/\_work/CarHacking/CarHacking/backend/car.js
sudo nano /var/www/CarHacking/\_work/CarHacking/CarHacking/backend/server.js
sudo nano /var/www/CarHacking/\_work/CarHacking/CarHacking/backend/car.js

# set up virtual canbus

sudo apt-get install can-utils
sudo modprobe vcan
sudo /usr/sbin/modprobe vcan

# in a terminal 2 start sending car data to gauges in terminal #1

node car.js

# in a terminal 3 hack the car gauges, do a cansend to the virtual canbus ID(found by cansniffer) and send in 16 bits of data to manipulate gauges.

cansend vcan0 1F4#AAAAAAAAAAAAAAAA

## Acknowledgement

Project concept and execution inspired by rhysmorgan134/Can-App

Frontend inspired by Domenicobrz/R3F-in-practice

T-90M 3D model
"T-90M (With interior) [FREE]" (https://skfb.ly/oWGUu) by DerpDude is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

Panzer II model
"Panzer II (Pz.Kpfw. II)" (https://skfb.ly/oTOqy) by vmatthew is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
