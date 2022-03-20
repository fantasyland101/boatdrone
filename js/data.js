//---------- 
var source = new EventSource('../backend/data.php'); //https://www.html5rocks.com/en/tutorials/eventsource/basics/
source.onmessage = function(e) {
    if (e.origin == 'http://localhost:8080'){
        //console.log(e.data);
        var data= JSON.parse(e.data)
        document.getElementById("cordinates").innerText ="cordinates: "+ data.cordinates;
        document.getElementById("angle").innerText ="angle: "+ data.angle;
        document.getElementById("speed").innerText ="speed: "+ data.speed;
        document.getElementById("voltage").innerText ="voltage: "+ data.voltage;   
        document.getElementById("amparage").innerText ="amparage: "+ data.amparage;
        document.getElementById("time-until-death").innerText ="time estimated until death: "+ data.time_until_death;
        document.getElementById("motor-temprature").innerText ="motor temprature: "+ data.motor_temprature;
        document.getElementById("motor-rpm").innerText ="motor rpm: "+ data.motor_rpm;
        document.getElementById("temprature").innerText ="temprature: "+ data.temprature;
        document.getElementById("type").innerText ="type: "+ data.type;
        document.getElementById("strength").innerText ="strength: "+ data.strength;
    }
    else{
        console.log('data from unkown source, will only allow from localhost:8080');
    }
};    