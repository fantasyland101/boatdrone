var camera;  //the image object in html
var url; //camera url
var sliders;
var toutchPoints= Array();
var gamepad;

function createUrlFromBlob(blob){ //create url to blob
    var urlCreator = window.URL || window.webkitURL;
    urlCreator.revokeObjectURL(url);
    url = urlCreator.createObjectURL(blob);
}

function updateCamera(){
    //aspect ratio of viewport and image 
    a = camera.naturalWidth/ camera.naturalHeight;
    b = document.body.clientWidth/document.body.clientHeight;
    if(a > b) { //if a has bigger aspect ratio
        camera.width= document.body.clientWidth;
        camera.height =document.body.clientWidth/a
    }
    else{
        camera.height = document.body.clientHeight;
        camera.width = document.body.clientHeight*a;
    }
}



const socket = new WebSocket('ws://localhost:8002');

window.addEventListener('load', function() {

    camera = document.getElementById("camera");
    sliders = document.getElementsByClassName("slider");
    updateCamera();


    socket.addEventListener('message', function (event) {
        createUrlFromBlob(event.data);
        camera.src = url;
    });

    window.addEventListener('resize', function(){
        updateCamera();
    });   

        //toutch. 2 sliders can't normaly be changed at the same time. this fixses it.

    for (var i = 0; i < sliders.length; i++) {
        sliders[i].addEventListener("touchstart", handleTouchStart, false);
        sliders[i].addEventListener("touchend", handleTouchEnd, false);
        sliders[i].addEventListener("touchcancel", handleTouchCancel, false);
        sliders[i].addEventListener("touchmove", handleTouchMove, false);
    }

    window.addEventListener('gamepadconnected', handleGamepad,false);
    window.addEventListener("gamepaddisconnected", function(e) {gamepad=null;});

});

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function gamepadCheck(){
    while(gamepad !=null){
        await sleep(1);
        console.log(gamepad.axes[1]);
    }
}

function handleGamepad(e){
    gamepad = e.gamepad;
    gamepadCheck();
    console.log(gamepad.id+" hi");
}


function handleTouchCancel(e){/**https://developer.mozilla.org/en-US/docs/Web/API/Touch_events */
    for(let i=0; i<toutchPoints.length; i++)
    if(toutchPoints[i].target== e.target){
        toutchPoints.splice(i, 1);
    }

}
function handleTouchEnd(e){ //removes the point from the toutchPoint array
    for(let i=0; i<toutchPoints.length; i++)
        if(toutchPoints[i].target== e.target){
            toutchPoints.splice(i, 1);
        }
}
function handleTouchMove(e){
    if(e.targetTouches.length==1){
        for(let i=0; i<toutchPoints.length; i++){
            if(toutchPoints[i].target == e.target){
                if( e.target.hasAttribute('orient') && e.target.getAttribute('orient') == "vertical")
                {
                    height= e.target.offsetHeight;
                    range = e.target.max -e.target.min;
                    unit =range/height;
                    console.log(e.target.offsetHeight);
                    
                    unitchange= Math.round((toutchPoints[i].pageY - e.targetTouches[0].pageY)*unit);
                    e.target.value=  parseInt(e.target.value)+unitchange;
                }
                else{
                    height= e.target.offsetWidth;
                    range = e.target.max -e.target.min;
                    unit =range/height;
                    console.log(e.target.offsetWidth);
                    
                    unitchange= Math.round((toutchPoints[i].pageX - e.targetTouches[0].pageX)*unit);
                    e.target.value=  parseInt(e.target.value)-unitchange;
                }
                toutchPoints[i]= e.targetTouches[0];
            }
        }
    }
}

function handleTouchStart(e){
    e.preventDefault();
    if(e.targetTouches.length==1)
    {
        noToutchWithTarget=true;
        for(let i=0; i<toutchPoints.length; i++)
        {
            if(toutchPoints[i].target == e.target)
            {
                toutchPoints[i]= e.targetTouches[0];
                noToutchWithTarget=false;
            }
        }
        if(noToutchWithTarget)
            toutchPoints.push(e.targetTouches[0]);
    }
}