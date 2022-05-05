#recives data such as boat-throttle
import asyncio
import websockets
import cv2
from gpiozero import Servo
from time import sleep

throttle_pin = None
gimble_pin = None

async def reciver(websocket):
    print("connected")
    while True:
        data = await websocket.recv() # type bytes
        throttle = int.from_bytes(data[:4],"little")
        gimble = int.from_bytes(data[4:8],"little")
        if(gimble ==4294967289):
            gimble=0
            print("gimble error")
        print("throttle: "+ str(throttle) +"  gimble: "+str(gimble)) 

        #send pwm to the pins
        throttle_pin.value = throttle/255  #from 0 to 1  
        gimble_pin.value = 1-gimble*2/255 #from -1 to 1

        #To reduce servo jitter, use the pigpio pin driver rather than the default RPi.GPIO driver
        #(pigpio uses DMA sampling for much more precise edge timing). 
        #See Changing the pin factory for further information.
        
        # GPIOZERO_PIN_FACTORY=pigpio python3 

async def main():
    async with websockets.serve(reciver,"", 8001): #creates webserver with handle "handler"
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    #https://gpiozero.readthedocs.io/en/stable/api_output.html?highlight=servo#gpiozero.Servo
    throttle_pin = Servo(17)
    gimble_pin = Servo(18)
    asyncio.run(main())  #entry point of main
