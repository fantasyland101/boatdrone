const socket = new WebSocket('ws://localhost:8001');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
    console.log("data sent")
});

// Listen for messages
socket.addEventListener('message', function (event) {
    //console.log('Message from server: ', event.data);
    //let image = new Image();
   // image.src = URL.createObjectURL(e.data);
   // document.body.appendChild(image);


    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(event.data);
    console.log("here:"+ imageUrl);
        //var imageUrl = URL.createObjectURL(blob);
    document.getElementById('camera').src = imageUrl;
    

});