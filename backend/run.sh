#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

SCRIPT=$(readlink -f $0)
SCRIPTPATH=`dirname $SCRIPT`
pigpiod
sleep 1
export GPIOZERO_PIN_FACTORY=pigpio
sleep 1
su -c "python3 ${SCRIPTPATH}/receiver.py & python3 ${SCRIPTPATH}/datastream.py" $SUDO_USER
