# boatdrone
A frontend and backend for controling a rc-boat and getting live video feed and data using websockets and server side event's.
The code is still not ready for use.

only tested on rasspberry pi 2! 
sudo apt update
sudo apt install upgrade
sudo apt install gpsd //i use a usb-gps device. I use a gpsd-python-libary that talks to gpsd witch in return talk to the device.
sudo apt install python3 && python3-dev 
//stuff for opencv to work.   this last worked 2022-04-20 raspberry pi bullseye 
sudo apt install sudo apt-get install -y \
	libjpeg-dev libpng-dev libtiff-dev libgtk-3-dev \
	libavcodec-extra libavformat-dev libswscale-dev libv4l-dev \
	libxvidcore-dev libx264-dev libjasper1 libjasper-dev \
	libatlas-base-dev gfortran libeigen3-dev libtbb-dev
pip install numpy
pip install opencv

you may need to allow serial in raspi-config (sudo raspi-config) to get a gps to work. gpsd aplications takes some (3-6 seconds) time to lanch!
sudo apt install gpsd-clients to test out gpsd without python

thank you random person for this gpsd-python libary: https://github.com/MartijnBraam/gpsd-py3
