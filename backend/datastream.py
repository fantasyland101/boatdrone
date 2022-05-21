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
    image = bytes(0) 
    gps_pos =(0,0)
    cpu_temp=0
    print("client connected")
    while True:
        if rval:
            image = cv2.imencode(".png", frame)[1].tobytes()  #.jpg is faster!
            rval, frame = vc.read()

        packet = gpsd.get_current()
        gps_pos = packet.position()  
        cpu_temp = CPUTemperature().temperature

        a = bytearray(struct.pack("f", gps_pos[0])) #4 bytes
        b=  bytearray(struct.pack("f", gps_pos[1])) #same
        c = bytearray(struct.pack("f", cpu_temp)) #same

        data = a+b+c+image # longitude bytes 4|latitude bytes 4|img_bytes-jpeg?
        if data != None:
            await websocket.send(data)   

async def main():
    async with websockets.serve(handler,"", 8002): #creates webserver with handle "handler"
        await asyncio.Future()  # run forever
        

if __name__ == "__main__":
    while(True):
        try:
            print("conecting to gps ...")
            gpsd.connect()
        except:
            sleep(1)
            continue
        print("gps conected")
        break

    vc = cv2.VideoCapture(0)
    if vc is None or not vc.Opened():
        rval = false
    else # try to get the first frame
        rval, frame = vc.read()
        
    asyncio.run(main())  #entry point of main
