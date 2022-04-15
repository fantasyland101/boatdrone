#rassbary pi-2 bullseye with external usb gps
#sudo apt install gpsd && gpsd-clients (i do not know if gpsd-clients is neded, i think not!) 
#sudo pip3 install gpsd-py3
#to run: python3 gpstest.py         (wait a bit before you get data)
 #--------------
import gpsd

# Connect to the local gpsd
gpsd.connect()

# Connect somewhere else
gpsd.connect(host="127.0.0.1", port=123456)

# Get gps position
packet = gpsd.get_current()

# See the inline docs for GpsResponse for the available data
print(packet.position())