<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache'); // recommended to prevent caching of event data.

function sendMsg($arr){
  $msg = json_encode($arr);
  $time = time();
  echo "id: $time" . PHP_EOL; //PHP_EOL return \n    id probably not needed
  echo "data: $msg" . PHP_EOL;
  //echo "retry: 30" . PHP_EOL;
  echo PHP_EOL;
  ob_flush();
  flush();
}


$data['cordinates']= strval(rand(0,3000)) .':'.strval(rand(0,3000));
$data['speed']= strval(rand(10,60)) .'m/s';
$data['angle']= strval(rand(-179,180)) .'C* North';
$data['voltage']= strval(rand(12,15)) .'V';
$data['amparage']= strval(rand(3,10)) .'A';
$data['time_until_death']= strval(rand(3,30)) .'min';
$data['motor_temprature']= strval(rand(10,60)) .'C*';
$data['motor_rpm']= strval(rand(0,2000)) .'rpm';
$data['temprature']= strval(rand(10,40)) .'C*';
$data['type']="cellular";
$data['strength']=rand(0,100)/100;

sendMsg($data);
