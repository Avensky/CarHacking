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
Raspberry Pi 4 model B.
Raspbian 64 bit OS.

## Installation

```
# Flash 64 bit os raspbian
# Connect to the internet and accept updates
# install samba onto the Pi
sudo apt install samba samba-common-bin

# set up smb.conf file
sudo nano /etc/samba/smb.conf

# add the following to the bottom of the file and save changes.
[Pishare]
Comment = Pi shared folder
Path = /share
Browsable = yes
Writable = yes
only guest = no
create mask = 0777
directory mask = 0777
Public = yes
Guest ok = yes

# Make a user to log into the Pi (username is pi in this case) and enter a password
sudo smbpasswd -a pi


# install node version manager 
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# activate nvm
source ~/.bashrc

# confirm installation
command -v nvm

# install node
nvm install 18

# To test, in Network folder of your computer type: \\[Pi IP Address]\

# Map the Network drive.

# clone the repo and initialize project
git clone https://github.com/Avensky/CarHacking.git ~/share/CarHacking
cd ~/share/CarHacking
npm ci

# set up virtual canbus
sudo apt-get install can-utils
sudo modprobe vcan

# use these when resetting pi on a different network
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0

# To test, type ifconfig and look for vcan
# Get ip adress
hostname -I
```



## Usage
```
# in terminal 1 start server from project dir
cd ~/share/CarHacking
npm start 

# on your pc type [Raspberry Pi IP Address]:3000/index.html in a web browser
192.168.0.153:3000/index.html

# in a terminal 2 start sending car data to gauges in terminal #1
node car.js

# in a terminal 3 hack the car gauges, do a cansend to the virtual canbus ID(found by cansniffer) and send in 16 bits of data to manipulate gauges.
cansend vcan0 1F4#AAAAAAAAAAAAAAAA
```
## Acknowledgement
Project concept and execution inspired by rhysmorgan134/Can-App

Frontend inspired by Domenicobrz/R3F-in-practice

T-90M 3D model
"T-90M (With interior) [FREE]" (https://skfb.ly/oWGUu) by DerpDude is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

Panzer II model
"Panzer II (Pz.Kpfw. II)" (https://skfb.ly/oTOqy) by vmatthew is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
