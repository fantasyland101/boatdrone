# boatdrone
A frontend and backend for controling a rc-boat and getting live video feed and data using websockets and server side event's.
The code is still not ready for use.

# depencys
python3, python3-dev, gpsd (talks to my usb gps), opencv (AI libary, used for usb-webbcam video), numpy (needed for opencv)

how i got these dependencys installed on my rasspberry-pi-2:
```
	sudo apt update
	sudo apt upgrade
	sudo apt install gpsd      
	sudo apt install python3 && python3-dev

	//stuff for opencv to work.   this last worked 2022-04-20 raspberry pi bullseye 
	sudo apt install sudo apt-get install -y \
	libjpeg-dev libpng-dev libtiff-dev libgtk-3-dev \
	libavcodec-extra libavformat-dev libswscale-dev libv4l-dev \
	libxvidcore-dev libx264-dev libjasper1 libjasper-dev \
	libatlas-base-dev gfortran libeigen3-dev libtbb-dev

	pip install numpy
	pip install opencv
```
you may need to allow serial in raspi-config (sudo raspi-config) to get the usb-gps to work. gpsd aplications takes some (3-6 seconds) time to lanch!
sudo apt install gpsd-clients to test out gpsd without python

# Installation
run all pythonscripts in /backend on rasspberry pi. These are 2 websocketservers and have no security whatsoever.  
Therefore I have my pi connected to a trusted network and then I port forward the websocketserver-ports to my laptop on another network through an ssh tunnel. This ensures that the websocket is secure.


on my laptop i open /html/liveActionView.html in a browser and can from there controll my rc boat. 

I take no liability in you using this repo in any way shape or form. 

thank you random person for this gpsd-python libary: https://github.com/MartijnBraam/gpsd-py3
