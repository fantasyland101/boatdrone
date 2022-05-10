#!/usr/bin/env python
import asyncio
import websockets
import cv2
from time import sleep
import gpsd
from gpiozero import CPUTemperature
import struct

#maybee multiple conections if not multiple VIDEOCAPTURES
async def handler(websocket): #called when conection is established 
    global rval
    image = bytes()
    gps_pos =(0,0)
    cpu_temp=0
    
    while True:
        if rval:
            rval, frame = vc.read()
            image = cv2.imencode(".png", frame)[1].tobytes()  #.jpg is faster!
        try:
            packet = gpsd.get_current()
            gps_pos = packet.position()  
            cpu_temp = CPUTemperature().temperature
        finally:
            pass
            #print("gps_have not started yet)
            a = bytearray(struct.pack("f", gps_pos[0])) #4 bytes
            b=  bytearray(struct.pack("f", gps_pos[1])) #same
            c = bytearray(struct.pack("f", cpu_temp)) #same

        data = a+b+c+image # longitude bytes 4|latitude bytes 4|img_bytes-jpeg?
        if data != None:
            await websocket.send(data) #more then one client is slow!        
         
            #websockets.broadcast(CONNECTIONS,data)       
        #await asyncio.sleep(0.1) 

async def main():
    async with websockets.serve(handler,"", 8002): #creates webserver with handle "handler"
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    gpsd.connect()
    vc = cv2.VideoCapture(0) #look at this and later try to optimise: https://toptechboy.com/faster-launch-of-webcam-and-smoother-video-in-opencv-on-windows/
    if vc.isOpened(): # try to get the first frame
        rval, frame = vc.read()
    else:
        rval = False
    asyncio.run(main())  #entry point of main
