# boatdrone
A frontend and backend for controling a rc-boat and getting live video feed and data using websockets and server side event's.
**The code is still not ready for use.**

# installation on rasoberry pi
#### installing python and gpsd
```
sudo apt install python3 python3-dev gpsd  (gpsd is used to comunicate with usb-gps-device)
sudo apt install gpsd-client (Optional! It contains gpsd-comand-line-interfaces for gps data)
```
#### how i installed the packages for opencv on my rassberry pi-2 B (last tested: 2022-04-20 raspberry pi bullseye):
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
	pip install opencv-python (for video data)
	pip install gpiozero (for controlling rassbery pi io)
	pip install websocket (for handling webbsockets)
	pip3 install gpsd-py3 (for comunication with gpsd)
	pip install pigpio (this makes pwm less janky for gpizero) 
```
#### installing this reposotary.
```
	git clone https://github.com/fantasyland101/boatdrone
```
only the stuff in boatdrone/backend is realy needed for the raspberry pi.

#### raspi-config
```
sudo raspi-config
```
you may need to allow serial in raspi-config to get the usb-gps to work.

# installation on windows
You can click on "code", and "download as .zip" in the github page. Later extract the zip file and click on index.html in the folder structure. 
The webbsite was written for firefox so somethings may not work as intended on other browsers.
 The /css /html /images /js folders are the only things needed in this repository to controll the boat. 

# running / setup
#### if you installed gpsd-client test gpsd with: 
```
cgps -s 
```
or
```
gpsmon
```
--- 
The websocketservers are realy unsecure so only use them on trusted networks.
In my case i use a 4g-phone as a internet hotspot.
#### running the websocketservers:
```
	sudo bash boatdrone/backend/run.sh 
```
This starts pigpiod-daemon, sets pigpio as default for gpiozero and starts boatdrone/backend/datastream.py and receiver.py.
**WARINING** Anything conected to the local-network can use these websocket-servers, and they are realy unsecure.  



#### My network setup:
Because of this vonorability I have my rassberry pi conected to a secure network (my old phone).

Because i wan't to etablish conection to these websockets outside the 4g-phone-network in a safe way i tunnel the data through ssh.
I do not wan't to port forward my home network and I can't port forward my 4g phone,
therefore I have setup a google cloud server as a middlepoint.
I ssh-reverse-port-forward my rassberry-pi to the cloud computer and then ssh-port-forwad my laptop to the same cloud computer. This ensures a safe connection betwean the 2 devices (my raspberry pi and my computer) through the internet.

Another solution could be using vpn-tunnel insted of ssh-tunneling. 
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

##### Example of port forwarding:
Exampel of port forwarding port 8002 & 8001 through a ssh tunel to port 8002 & 8001:
```
ssh -N username@ip_for_lan -L 8002:localhost:8002 -L  8001:localhost:8001
```
example of reverse port forwarding port 8002 & 8001 through ssh tunnel:
```
ssh -N  username@ip_for_lan -R 8002:localhost:8002  -R 8001:localhost:8001
```
---
##### Example of port forwarding for a google-vm:
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

##### Other stuff
To open a shell on my raspberry-pi i ssh into it using the [termux-app](https://github.com/termux/termux-app) on my old-phone.
On my laptop i open /html/index.html in my firefox webb browser and can from there controll my rc boat. 
**Some of the code only works on firefox such as input-sliders**

# Hardware setup.

raspberry pi: 
* pin 17 send out pwm to controll the servo.
* pin 18 send out pwm to controll the motorcontroller.

### my hardware:
*computer (a laptop) 
*old phone (running [terminux-app](https://github.com/termux/termux-app))
* raspberry pi 2 B
* traxxas vxl-6s motor controller
* 2 traxxas lipo power cell 25c 7.4v 5800mAh
* traxxas 540XL 2400 brushless motor
* LM2596S DC to DC stepdown power suply

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
I do that with a Step-Down power suply. **DO NOT ONLY USE A LINEAR VOLTIGE REGULATOR LIKE THE EXAMPLE**.


