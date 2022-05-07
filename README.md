# boatdrone
A frontend and backend for controling a rc-boat and getting live video feed and data using websockets and server side event's.
**The code is still not ready for use.**

# installation
## depencys
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
## what to do with this reposotary
then install this github-reposotary. I recomend using wget for this.
The boatdrone/backend is suposed to be install on the server (rassberry pi)

and the rest is suposed to be on the client.

# running / setup
run the 2 webbsocketservers in boatdrone/backend on rasspberry pi (python3 [filepath]). These websocketservers **have no security whatsoever** therefore only comunicate with these servers on trusted networks. Encapsulate the trafic in some safe way if you are sending it through unsafe networks (like the internet) I use ssh tunneling for this but some sort of vpn solution should also work.

My network setup:
```
-------------------------------------------------INTERNET----------------------------------------------------------------------------------------------------
-                                                                                                                                                           -
-         ---old-phone-4g-hotspot. (no network port forward)--------------                        --------lan. PORT 20 forwarded to server-1. ----          -
-         -                                                              -                        -                                              -          -
-         -    rassberry pi 2:                                           -                        -         server-1:                            -          -
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

```
exampel of port forwarding port 8002 & 8001 through a ssh tunel to port 8002 & 8001:
```
ssh -N username@ip_for_lan -L 8002:localhost:8002 -L  8001:localhost:8001
```
example of reverse port forwarding port 8002 & 8001 through ssh tunnel:
```
ssh -N  username@ip_for_lan -R 8002:localhost:8002  -R 8001:localhost:8001
```
---

because my server-1 is a google-vm i need to specify some more parameters to do the same as the above.

exampel of port forwarding port 8002 & 8001 through a ssh tunel to port 8002 & 8001 on a google vm:
```
ssh -i .ssh/google_compute_engine -o UserKnownHostsFile=/dev/null   -o CheckHostIP=no -o StrictHostKeyChecking=no -N username@ip_for_lan -L 8002:localhost:8002 -L 8001:localhost:8001
```

example of reverse port forwarding port 8002 & 8001 through ssh tunnel to a google vm:
```
ssh -i google_compute_engine -o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o StrictHostKeyChecking=no -N  username@ip_for_lan -R 8002:localhost:8002 -R 8001:localhost:8001 
```
where .ssh/google_compute_engine and google_compute_engine is the path to the file that stores the ssh-key.

---

on my laptop i open /html/liveActionView.html in a browser and can from there controll my rc boat. 

I take no liability in you using this repo in any way shape or form. 

## autossh
autossh is a program that can reverse port forward automaticaly and reconect a disconected  ssh reverse port forward. I plan to use this in the future 

thank you random person for this gpsd-python libary: https://github.com/MartijnBraam/gpsd-py3
