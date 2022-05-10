# code from https://github.com/MartijnBraam/gpsd-py3/blob/master/README.rst  
import gpsd

# Connect to the local gpsd
gpsd.connect()

# Get gps position
packet = gpsd.get_current()

# See the inline docs for GpsResponse for the available data
print(packet.position())
