#!/usr/bin/env python

import asyncio
import json
import websockets
import cv2
from time import sleep


async def handler(websocket): #called when conection is established
    #data = await websocket.recv()
    cv2.namedWindow("preview")
    vc = cv2.VideoCapture(0)
    if vc.isOpened(): # try to get the first frame
        rval, frame = vc.read()
    else:
        rval = False

    while rval:
        rval, frame = vc.read()
        #frame = cv2.resize(frame, (640, 480))
        #encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 65]
        #man = cv2.imencode('.jpg', frame, encode_param)[1]
        #sender(man)
        #sleep(0.2)
        image = cv2.imencode(".jpg", frame)[1].tobytes()
        await websocket.send(image)
        #await websocket.send(man.tobytes())
        

async def main():
    async with websockets.serve(handler, "", 8001): #creates webserver with handle "handler"
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())  #entry point of main