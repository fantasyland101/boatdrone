# boatdrone
A frontend and backend for controling a rc-boat and getting live video feed and data using websockets and server side event's.
**The code is still not ready for use.**

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

then install this github-reposotary. I recomend using wget. the backend folder is suposed to be install on the rassberry pi and the rest on the client computer.

# Installation
run the 2 webbsocketservers in boatdrone/backend on rasspberry pi (python3 [filepath]). These websocketservers **have no security whatsoever** therefore only comunicate with these servers on trusted networks.

My network setup:

-------------------------------------------------INTERNET----------------------------------------------------------------------------------------------------
-                                                                                                                                                           -
-         ---old-phone-4g-hotspot. (no network port forward)--------------                        --------lan. PORT 20 forwarded to server-1. ----          -
-         -                                                              -                        -                                              -          -
-         -    rassberry pi 2:                                           -                        -         server 1:                            -          -
-         -       port 8001 webbsocketserver 1                           -                        -            ssh-server on port 20             -          -       
-         -       port 8002 webbsocketserver 2                           -                        -                                              -          -
-         -       reverse ssh-tunel port forwards 8001 & 8002 to server 1-                        -                                              -          -       
-         -                                                              -                        -                                              -          -
-         ----------------------------------------------------------------                        ------------------------------------------------          -
-                                                                                                                                                           -
-                                                                                                                                                           - 
-                                                                                                                                                           -
-                                                                                                                                                           - 
-                                                                                                                                                           -
-        -------home-network.  (no network port forward)---------------------                                                                               -
-        -                                                                  -                                                                               - 
-        -	laptop:                                                     -                                                                               -
-        -          port forwards 8001 & 8002 through ssh-tunel to server-1 -                                                                               - 
-        -                                                                  -                                                                               - 
-        --------------------------------------------------------------------                                                                               -
-                                                                                                                                                           -
-                                                                                                                                                           -
-------------------------------------------------------------------------------------------------------------------------------------------------------------


exampel of port forwarding port 8002 through a ssh tunel to port 8002:
```
ssh -N -L 8002:localhost:8002 username@ip_for_lan
```
example of reverse port forwarding port 8002 through ssh tunnel:
```
ssh -N -R 8002:localhost:8002 username@ip_for_lan
```

on my laptop i open /html/liveActionView.html in a browser and can from there controll my rc boat. 

I take no liability in you using this repo in any way shape or form. 

thank you random person for this gpsd-python libary: https://github.com/MartijnBraam/gpsd-py3
