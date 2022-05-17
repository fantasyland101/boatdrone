#!/bin/sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
SCRIPTPATH=`dirname $SCRIPT`
pigpiod
sleep 1
export GPIOZERO_PIN_FACTORY=pigpio
sleep 1
su -c "python3 ${SCRIPTPATH}/receiver.py & python3 ${SCRIPTPATH}/datastream.py" $SUDO_USER
