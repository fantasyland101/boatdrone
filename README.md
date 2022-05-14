# boatdrone
A frontend and backend for controling a rc-boat and getting live video feed and data using websockets and server side event's.
**The code is still not ready for use.**

# installation
#### installing python and gpsd
```
sudo apt install python3 python3-dev gpsd  (gpsd is used to comunicate with usb-gps-device)
sudo apt install gpsd-client (Optional! It contains gpsd-comand-line-interfaces for gps data)
```
#### how i installed the packages for opencv on my rassberry pi-2 (last tested: 2022-04-20 raspberry pi bullseye):
```
sudo apt install sudo apt-get install -y \
	libjpeg-dev libpng-dev libtiff-dev libgtk-3-dev \
	libavcodec-extra libavformat-dev libswscale-dev libv4l-dev \
	libxvidcore-dev libx264-dev libjasper1 libjasper-dev \
	libatlas-base-dev gfortran libeigen3-dev libtbb-dev
```
#### installing pip packages:
```
	pip install numpy (needed for opencv)
	pip install opencv (for video data)
	pip install gpiozero (for controlling rassbery pi io)
	pip install websocket (for handling webbsockets)
	pip3 install gpsd-py3 (for comunication with gpsd)
	pip install pigpio //this makes pwm less janky for gpizero. gpizero also recomend using this package. 
```
#### installing this reposotary.
	on rassberry pi: 
```
	wget https://github.com/fantasyland101/boatdrone
```
on windows use github webbsite and download reposotary as zip. then extract it and open boatdrone/html/index.html in a browser (works best in firefox). 
#### raspi-config
```
sudo raspi-config
```
you may need to allow serial in raspi-config to get the usb-gps to work.
# running / setup
#### if you installed gpsd-client test gpsd with: 
```
cgps -s 
```
or
```
gpsmon
```
The websocketservers are realy unsecure so only use them on trusted networks.
In my case i use a 4g-phone as a internet hotspot.
#### running the websocketservers:
```
	[if i wan't to use pigio]
		sudo pigpiod //to start daemon
		export GPIOZERO_PIN_FACTORY=pigpio //telling gpiozero to use gpiod

	cd boatdrone/backend
	python3 gps-test.py    (I spam this comand until my usb-gps device wake up and python stops throwing errors)
	python3 datastream.py
	
	[open up another terminal]
		cd boatdrone/backend
		python3 receiver.py
```
Because i wan't to etablish conection to these websockets outside the 4g-phone network in a safe way i tunnel the data through ssh.
I do not wan't to port forward my home network and I can't port forward my 4g phone.
Therefore I have setup a google cloud server as a middlepoint.
I will reverse port forward my rassberry-pi to it and port forward my laptop to it.
Another solution should be using vpn-tunnel insted of ssh-tunneling. 

#### My network setup:
```
-------------------------------------------------INTERNET----------------------------------------------------------------------------------------------------
-                                                                                                                                                           -
-         ---old-phone-4g-hotspot. (no network port forward)--------------                        --------lan. PORT 20 forwarded to server-1. ----          -
-         -                                                              -                        -                                              -          -
-         -    rassberry pi 2:                                           -                        -         server-1:                            -          -
-         -       port 8001 webbsocketserver 1                           -                        -            ssh-server on port 20             -          -       
-         -       port 8002 webbsocketserver 2                           -                        -                                              -          -
-         -       reverse ssh-tunel port forwards 8001 & 8002 to server 1-                        -                                              -          -       
-         -       gpio-17 pwm for servo controll                         -                        -                                              -          -
-         -       gpio-18 pwm for motor controll                         -                        -                                              -          -
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
.ssh/google_compute_engine and google_compute_engine is the paths to the file that stores the ssh-key.

---

on my laptop i open /html/index.html in my firefox webb browser and can from there controll my rc boat. 
**Some of the code only works on firefox such as input-sliders**

# Hardware setup.
´´´
pin 17 send out pwm to controll the servo.
pin 18 send out pwm to controll the motorcontroller.
´´´
## Hardware setup testing:
![circuit diagram](https://github.com/fantasyland101/boatdrone/blob/main/boat.png)

The batterys are not lipo flatcells but batterypacks and the motor and motorcontroller do not look like that. 
The rasspbery pi get's it's power by wall-power to micro-usb in this example and should therefore not share it's 5v pin with the microcontroller!! 
This is because the diferense in voltage betwean the two powersources will result in power flowing backwards through one of them.
DO NOT LOAD THE SERVO WHILE TESTING.
This setup is only for testing, if you load the servo while testing you may draw to mutch amprage through the 5v conector of the raspbery pi.
## Hardware setup final:
![circuit diagram](https://github.com/fantasyland101/boatdrone/blob/main/boat_final.png) 
The speed controller suply 6v with a maximum of 10A. 
Therefore the speed controller can suply all the electronics. Because the raspberry pi needs 5v we need to step down the voltage.
I do that with a Step-Down Regulator. **DO NOT ONLY USE A LINEAR VOLTIGE REGULATOR LIKE THE EXAMPLE**.


