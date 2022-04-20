#!/usr/bin/env python

import asyncio
import json
import websockets
import cv2
from time import sleep
from threading import Thread
import struct


import gpsd



#maybee multiple conections if not multiple VIDEOCAPTURES
async def handler(websocket): #called when conection is established
    print("connected")
    global rval
    image = bytes()
    gps_pos =(0,0)
    #g= asyncio.create_task(gps())
    #asyncio.run(camera())
    #i = asyncio.create_task(camera())


    while True:



        if rval:
            rval, frame = vc.read()
            image = cv2.imencode(".jpg", frame)[1].tobytes()
        try:
            packet = gpsd.get_current()
            gps_pos = packet.position()
            #print(gps_pos)
        finally:
            pass
            #print("gps_have not started yet")

            a = bytearray(struct.pack("f", gps_pos[0])) #4 bytes
            b=  bytearray(struct.pack("f", gps_pos[1])) #same

        data = a+b+image # longitude bytes 4|latitude bytes 4|img_bytes-jpeg?
        if data != None:
            await websocket.send(data)







async def main():
    async with websockets.serve(handler,"", 8002): #creates webserver with handle "handler"
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    gpsd.connect()
    vc = cv2.VideoCapture(0)
    if vc.isOpened(): # try to get the first frame
        rval, frame = vc.read()
    else:
        rval = False

    asyncio.run(main())  #entry point of main
