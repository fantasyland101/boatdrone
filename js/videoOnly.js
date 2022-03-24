var camera;  //the image object in html
var url;

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
    updateCamera();


    socket.addEventListener('message', function (event) {
        createUrlFromBlob(event.data);
        camera.src = url;
    });

    window.addEventListener('resize', function(){
        updateCamera();
    });   



});

