const checkInputSpeed=10;

class Map{
    marker; //ORDERD!! array of markers
    selectedMarker;  
    boatMarker;
    map;
    map_menu;
    routeLine;
    tripp_type; //0=circle 1=order 2=fastest
    add_marker_button;
    delete_marker_button;
    tripp_type_button;
    minimalistic;

    
    constructor(origin, scale, minimalistic=false ,nodes=[]){
        this.scale = scale

        this.loadMap(origin, scale,minimalistic);
        
        this.boatMarker=null;
        this.boatMarkerImage = L.icon({
            iconUrl: '../images/boat..jpg',
            iconSize: [56, 48],
            iconAnchor: [28, 24],
            popupAnchor: [-3, -76],
        });

        this.selectedMarker=null;
        this.routeLine=null;
        this.marker= new Array();
        this.tripp_type=0;

        for(var i=0; i<nodes.length; i++){
            this.addMarker(nodes[i]);
        }        
    }

    loadMap(origin,scale,minimalistic=false){
        const d = new Date();
        var StartTime = d.getTime();
        let me = this;

        document.getElementById('map').classList.toggle("minimalistic",minimalistic); //adds the minimalistic class if loadMap=> minimalistic

        this.map = L.map('map',{zoomControl: !minimalistic}).setView(origin, scale);

 
       
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        // CUSTOM MENU
        this.map_menu = L.control();
        this.map_menu.onAdd = function (info) {
            this._div = L.DomUtil.create('div', 'menu-map'); // create a div with a class "menu-map"
            this.update();
            return this._div;
        };
        // method that we will use to update the control based on feature properties passed
        this.map_menu.update = function (props) {

            if(!minimalistic){
                var data = '<h3>tripp:<h3/><button id="minimize">exit map</button><br><button id="tripp_type_button">tripp-type:circle</button><br><button id="add_marker_button">add marker</button><br><button id="delete_marker_button">delete marker</button>'
                this._div.innerHTML = data;
            }
        };
        this.map_menu.addTo(this.map);

        //CUSTOM MENU EVENT LISTNERS

        if (minimalistic){
            this.map.scrollWheelZoom.disable()
            this.map.dragging.disable()
            this.map.touchZoom.disable()
            this.map.doubleClickZoom.disable()
            this.map.boxZoom.disable()
            this.map.keyboard.disable()
            if (this.map.tap)
                map.tap.disable()

            this.map.on('click', function(){ // create a new map that has an oposite minimalistic setting.
                var r = new Date();
                if(r.getTime() -StartTime >1000)
                {
                    
                    let tempOrigin =me.map.getCenter();
                    let tempScale = me.map.getZoom();
                    me.map.remove();
                    me.loadMap(tempOrigin,tempScale, false); 
                }
            });
        }
        else
        {
            this.add_marker_button= document.getElementById('add_marker_button');
            this.delete_marker_button= document.getElementById('delete_marker_button');
            this.tripp_type_button = document.getElementById('tripp_type_button');
            var minimizeButton =document.getElementById('minimize');

            minimizeButton.addEventListener('click',function(){
                var r = new Date();
                if(r.getTime() -StartTime >1000)
                {
                    
                    let tempOrigin =me.map.getCenter();
                    let tempScale = scale;
                    if(me.boatMarker !=null)
                        tempOrigin = me.boatMarker.getLatLng();
                    me.map.remove();
                    me.loadMap(tempOrigin,tempScale, true); 
                }
            });

            this.tripp_type_button.addEventListener('click',function(){
                me.change_tripp_type();
            });
            
            this.delete_marker_button.addEventListener('click',function(){
                if(me.selectedMarker !=null)
                {
                    me.deleteMarker(me.selectedMarker);
                    me.selectedMarker=null;
                }
            });
            this.add_marker_button.addEventListener('click',function(){ //somhow makes event listeners crach!!
                me.addMarker(me.map.getCenter());
            });
        }

        
        if(this.marker != null && this.marker.length >0){

        //reload all markers.
        console.log(this.marker.length);
        
            for(var i=0; i<this.marker.length; i++){
                this.marker[i].addTo(this.map);

            }            
            this.update_tripp_type();
        }
        if(this.boatMarker != null) 
            this.boatMarker.addTo(this.map);
    }

    updateGPS(blob){
        var me = this;
        var fileReader_long_ = new FileReader();
        fileReader_long_.onload = function() {
            const data = new Float32Array(this.result);
            if( me.boatMarker == null && data[0] !=null && data[1] !=null)
            {
                me.addMarker([data[0],data[1]],true);
                me.map.setView([data[0],data[1]],me.scale);
            }
            else if(data[0] !=null && data[1] !=null)
                me.boatMarker.setLatLng([data[0],data[1]]);
        };
        fileReader_long_.readAsArrayBuffer(blob.slice(0,8));
    }

    addMarker(position, boatmarker = false){
        if(boatmarker){
            this.boatMarker = L.marker(position, {icon: this.boatMarkerImage});
            this.boatMarker.addTo(this.map);
            return;
        }

        var me =this;
        var newMarker = L.marker(position, {draggable:'true'});
        newMarker.on('dragend', function(){
            me.update_tripp_type();
        });
        newMarker.on('click',function(){
            if(me.selectedMarker != null){

                me.marker[me.selectedMarker].setOpacity(1);
                me.selectedMarker = null;
            }
            else{
                for(var i =0; i<me.marker.length; i++)
                    if(me.marker[i]=== this)
                        me.selectedMarker =i;
                this.setOpacity(0.6);
            }
        });
        newMarker.addTo(this.map);
        this.marker.push(newMarker);
        this.update_tripp_type();
    }


    deleteMarker(index_in_marker){
        this.map.removeLayer(this.marker[index_in_marker]);
        this.marker.splice(index_in_marker,1);//removes the selected marker from marker
        this.update_tripp_type();
    }

    change_tripp_type(){
        this.tripp_type +=1
        if(this.tripp_type >2)
            this.tripp_type=0;

        this.update_tripp_type();
    }

    update_tripp_type(){
        switch(this.tripp_type){
            case 0:
                this.tripp_type_circle();
                break;
            case 1: 
                this.tripp_type_order();
                break;
            case 2: 
                this.tripp_type_fastest();
                break;
        }

    }

    tripp_type_circle(){
        this.tripp_type_button.innerHTML = 'tripp-type: circle';
        let nodes= new Array();
        for(var i=0; i<this.marker.length;i++){
            nodes.push(this.marker[i].getLatLng());

        }
        nodes.push(this.marker[0].getLatLng());

        if(this.routeLine!=null)
            this.map.removeLayer(this.routeLine);

        this.routeLine = L.polyline(nodes, {color: 'red'}).addTo(this.map);
    }

    tripp_type_order(){
        this.tripp_type_button.innerHTML = 'tripp-type: orderd';
        let nodes= new Array();
        for(var i=0; i<this.marker.length;i++){
            nodes.push(this.marker[i].getLatLng());

        }
        if(this.routeLine!=null)
            this.map.removeLayer(this.routeLine);

        this.routeLine = L.polyline(nodes, {color: 'red'}).addTo(this.map);
    }

    tripp_type_fastest(){
        this.tripp_type_button.innerHTML = 'tripp-type: fastest';
        if(this.routeLine!=null)
            this.map.removeLayer(this.routeLine);
        //ship position?
    }
}

class Sockets{
    webbsocket;
    webbsock2;
    throttle;
    gimble;
    constructor(webbsocket){
        this.webbsocket=webbsocket;
        this.webbsock2 = new WebSocket('ws://192.168.1.124:8001')
        this.throttle=0;
        this.gimble=0;
    }
    giveDataThrottle(throttle){
        this.giveData(throttle,this.gimble)
    }
    giveDataGimble(gimble){
        this.giveData(this.throttle,gimble)
    }

    giveData(throttle,gimble){
        this.throttle= throttle;
        this.gimble = gimble;
        console.log("throttle: "+throttle+", gimble:"+gimble);
        var data = new Int32Array([throttle,gimble]);   
        try{
            this.webbsock2.send(data);
        }catch(error){
            console.error(error)
        }

    }
}
class Temprature{
    tempratureElement;

    constructor(){
        this.tempratureElement = document.getElementById("temp");
    }

    updateTemprature(blob)
    {
        var me = this;
        var fileReader = new FileReader();
        fileReader.onload = function() {
            const data = new Float32Array(this.result);
            if(data[0] != null)
                me.tempratureElement.innerHTML = data[0].toFixed(2)+"C*";    
        }
        fileReader.readAsArrayBuffer(blob.slice(8,12));
    }
}
    
class Settings{
    settingsButton;
    sliderCheckbox;
    keyboardCheckbox;
    gamepadCheckbox;
    gamepad_settings_container;
    keyboard_settings_container;
    slider;
    gamepad;
    keyboard;

    constructor(slider, gamepad, keyboard){
        this.keyboard=keyboard;
        this.slider=slider;
        this.gamepad=gamepad;
        this.sliderCheckbox = document.getElementById("slider-checkbox");
        this.keyboardCheckbox = document.getElementById("keyboard-checkbox");
        this.gamepadCheckbox = document.getElementById("gamepad-checkbox");
        
        this.settingsButton = document.getElementById("settings");

        this.gamepad_settings_container = document.getElementById("gamepad-settings-container");
        this.keyboard_settings_container = document.getElementById("keyboard-settings-container");

        //eventlistneners for checkboxses
        var me =this;

        this.sliderCheckbox.addEventListener('click', function(){
            me.sliderCheckboxClick();

        });
        this.keyboardCheckbox.addEventListener('click', function(){
            me.keyboardCheckboxClick();

        });
        this.gamepadCheckbox.addEventListener('click', function(){
            me.gamepadCheckboxClick();
        });

        //eventlistner for settings button
        this.settingsButton.addEventListener('click',function(){
            document.getElementById("settings-container").classList.toggle("show");

        });

        //when window load check what setting checkboxses are!
        if(this.sliderCheckbox.checked)
            this.sliderCheckboxClick();
        else if(this.keyboardCheckbox.checked)
            this.keyboardCheckboxClick();
        else
            this.gamepadCheckboxClick();
    }

    sliderCheckboxClick(){
        this.sliderCheckbox.checked=false;
        this.keyboardCheckbox.checked=false;
        this.gamepadCheckbox.checked=false;
        this.sliderCheckbox.checked=true;
        this.gamepad_settings_container.classList.toggle("show",false);
        this.keyboard_settings_container.classList.toggle("show",false);


        this.gamepad.disable();
        this.keyboard.disable();
        this.slider.enable();

    }
    keyboardCheckboxClick(){
        this.sliderCheckbox.checked=false;
        this.keyboardCheckbox.checked=false;
        this.gamepadCheckbox.checked=false;
        this.keyboardCheckbox.checked=true;
        this.gamepad_settings_container.classList.toggle("show",false);
        this.keyboard_settings_container.classList.toggle("show",true);
        this.gamepad.disable();
        console.log(this.keyboard);
        this.keyboard.enable();
        this.slider.disable();
    }
    gamepadCheckboxClick(){

        this.sliderCheckbox.checked=false;
        this.keyboardCheckbox.checked=false;
        this.gamepadCheckbox.checked=false;
        this.gamepadCheckbox.checked=true;
        this.gamepad_settings_container.classList.toggle("show",true);
        this.keyboard_settings_container.classList.toggle("show",false);

        this.gamepad.enable();
        this.keyboard.disable();
        this.slider.disable();
    }


}


class Camera{
    img;
    constructor(img){
        this.img=img;
        this.updateImgSize();

        //eventhandler
        var me =this;
        window.addEventListener('resize', function(){ me.updateImgSize(); });

    }
    updateImgSize(){
         //aspect ratio of viewport and image 
        var a = this.img.naturalWidth/ this.img.naturalHeight;
        var b = document.body.clientWidth/document.body.clientHeight;
        if(a > b) { //if a has bigger aspect ratio
            this.img.width= document.body.clientWidth;
            this.img.height =document.body.clientWidth/a
        }
        else{
            this.img.height = document.body.clientHeight;
            this.img.width = document.body.clientHeight*a;
        }
    }
    updateImgContent(blob){ 
        var urlCreator = window.URL || window.webkitURL;
        var oldUrl=this.img.src;
        urlCreator.revokeObjectURL(oldUrl);
        this.img.src= urlCreator.createObjectURL(blob.slice(12));
    }  
}


class SliderInput{
    sliderObj;//array of slider objects.
    checkbox;
    touchPoints; //array of last touched point of sliderObj-ects
    socket;


    constructor(socket, sliderObj, checkbox){
        this.socket=socket;
        this.sliderObj = sliderObj;
        this.checkbox = checkbox;
        this.touchPoints = Array();

        var me =this; //in functions this != this instance, it is strange but this will solve it!

        
        for (var i = 0; i< this.sliderObj.length; i++) {
            this.sliderObj[i].addEventListener("touchstart", function(e){me.touchStart(e);}, false);
            this.sliderObj[i].addEventListener("touchend", function(e){me.touchEnd(e);}, false);
            this.sliderObj[i].addEventListener("touchcancel", function(e){me.touchCancel(e);}, false);
            this.sliderObj[i].addEventListener("touchmove", function(e){me.touchMove(e);}, false);
            this.sliderObj[i].addEventListener("input",function(e){me.mouseInput(e);}, false);

            //this.socket.throttle =  this.sliderObj[0].value;
            //this.socket.gimble = this.sliderObj[1].value;
        
        }
    }

    enable(){
        this.sliderObj[0].value =this.socket.throttle;
        this.sliderObj[1].value = this.socket.gimble;
        for(var i=0; i<this.sliderObj.length; i++)
            this.sliderObj[i].classList.toggle("show",true);

    }
    disable(){
        for(var i=0; i<this.sliderObj.length; i++)
            this.sliderObj[i].classList.toggle("show",false);
    }

    mouseInput(e){ //if mouse change the slider
        if( e.target.hasAttribute('orient') && e.target.getAttribute('orient') == "vertical") 
        {
            socket.giveDataThrottle(e.target.value);
        }
        else{
            socket.giveDataGimble(e.target.value);
        }
    }

    touchCancel(e){/**https://developer.mozilla.org/en-US/docs/Web/API/Touch_events */
        for(let i=0; i<this.touchPoints.length; i++)
        if(this.touchPoints[i].target== e.target){
            this.touchPoints.splice(i, 1);
        }
    }
    touchEnd(e){ //removes the point from the toutchPoint array
        for(let i=0; i<this.touchPoints.length; i++)
            if(this.touchPoints[i].target== e.target){
                this.touchPoints.splice(i, 1);
            }
    }
    touchMove(e){
        if(e.targetTouches.length==1){
            for(let i=0; i<this.touchPoints.length; i++){
                if(this.touchPoints[i].target == e.target){
                    if( e.target.hasAttribute('orient') && e.target.getAttribute('orient') == "vertical") //
                    {
                        var height= e.target.offsetHeight;
                        var range = e.target.max -e.target.min;
                        var unit =range/height;
                        
                        var unitchange= Math.round((this.touchPoints[i].pageY - e.targetTouches[0].pageY)*unit);
                        e.target.value=  parseInt(e.target.value)+unitchange;
                        socket.giveDataSpeed(e.target.value);
                    }
                    else{
                        height= e.target.offsetWidth;
                        range = e.target.max -e.target.min;
                        unit =range/height;
                        
                        unitchange= Math.round((this.touchPoints[i].pageX - e.targetTouches[0].pageX)*unit);
                        e.target.value=  parseInt(e.target.value)-unitchange;
                        socket.giveDataRotation(e.target.value);
                    }
                    this.touchPoints[i]= e.targetTouches[0];
                }
            }
        }
    }
    touchStart(e){
        e.preventDefault();
        if(e.targetTouches.length==1)
        {
            var noToutchWithTarget=true;
            for(let i=0; i<this.touchPoints.length; i++)
            {
                if(this.touchPoints[i].target == e.target)
                {
                    this.touchPoints[i]= e.targetTouches[0];
                    noToutchWithTarget=false;
                }
            }
            if(noToutchWithTarget)
            this.touchPoints.push(e.targetTouches[0]);
        }
    }
}

class GamepadInput{
    socket;
    controller;
    throttleAxe;
    gimbleAxe;
    throttleAxeInverted;
    gimbleAxeInverted;
    enabled;

    throttleInput;
    gimbleInput;

    constructor(socket){ //controller can be null!
        this.enabled=false;
        this.socket= socket;
        this.controller = null;
        this.throttleAxe =1;
        this.gimbleAxe= 2;
        this.throttleAxeInverted=false;
        this.gimbleAxeInverted=false;
        this.throttleInput=0;
        this.gimbleInput=0;
        
        var me = this;
        window.addEventListener('gamepadconnected', function(e){
            me.controller = e.gamepad; 
            me.enable();
            console.log(gamepad.controller);
        },false);  
        window.addEventListener("gamepaddisconnected", function(e) {
            me.controller = null;
            console.log("disconected");
        },false);

    }
    async CheckGamepadInput(){
        while(this.controller != null && this.enabled){
            if( Math.abs(this.throttleInput - this.controller.axes[this.throttleAxe]) > 0.05 || Math.abs(this.gimbleInput - this.controller.axes[this.gimbleAxe]) > 0.05 )
                {
                    this.throttleInput = this.controller.axes[this.throttleAxe];
                    this.gimbleInput = this.controller.axes[this.gimbleAxe];

                    throttle = -Math.round(this.throttleInput*255); 
                    gimble = Math.round( this.gimbleInput*125) +125;
                    if(throttle < 0)
                        throttle = 0;
                    this.socket.giveData(throttle, gimble)

                }                
            await new Promise(res => setTimeout(res, checkInputSpeed));
        }
        this.enabled = false;
    }
    enable(){
        if(this.enabled && this.controller != null)
            return;
        this.enabled=true;
        this.CheckGamepadInput();
    }
    disable(){
        this.enabled=false;
    }
}

class KeyboardInput{  
    socket;
    throttle;
    gimble;               //NOT WORKING YET
    bindedKeys; //array of binded keys
    bindedKeysIsPushed; //array of true/false values of binded keys
    aKeyIsDown;
    enabled;

    constructor(socket,bindedKeys){
        this.enabled=false;
        this.socket= socket;
        this.aKeyIsDown=true;
        this.throttle=0;
        this.gimble=0;
        this.bindedKeys=bindedKeys;
        this.bindedKeysIsPushed= [false,false,false,false];
        //eventlisteners
        var me =this;
        document.addEventListener('keydown', function(e){
            me.keyDown(e);
            
        });
        document.addEventListener('keyup', function(e){
            me.keyUp(e);
        });
        //infinate loop
        this.keyIsDown();
    }




    enable(){
        if(! this.enabled){
            this.enabled=true;
            this.keyIsDown();
        }
    }
    disable(){
        this.enabled=false;
    }

    async keyIsDown(){
        while(this.enabled){
            for(var i=0; i<this.bindedKeysIsPushed.length; i++){
                if(this.bindedKeysIsPushed[i]){
                    switch(i){
                        case 0:
                            this.throttle++;
                            break;
                        case 1:
                            this.throttle--;
                            break;
                        case 2:
                            this.gimble++;
                            break;
                        case 3:
                            this.gimble--;
                            break;
                    }
                }
            }
            this.socket.giveData(this.throttle,this.gimble);
            await new Promise(res => setTimeout(res, checkInputSpeed));
        }
    }
    keyDown(e) {
        switch(e.code){
            case this.bindedKeys[0]://throttle up
                this.bindedKeysIsPushed[0]=true;
                break;
            case this.bindedKeys[1]://throttle down
                this.bindedKeysIsPushed[1]=true;
                //this.isKeyDown(true);
                break;
            case this.bindedKeys[2]://gimble left
                this.bindedKeysIsPushed[2]=true;

                break;
            case this.bindedKeys[3]://gimble right
                this.bindedKeysIsPushed[3]=true;

                //this.isKeyDown(true);
                break;
        }
    }
    keyUp(e){
        switch(e.code){
            case this.bindedKeys[0]://throttle up
                this.bindedKeysIsPushed[0]=false;
                break;
            case this.bindedKeys[1]://throttle down
                this.bindedKeysIsPushed[1]=false;

                //this.isKeyDown(false);
                break;
            case this.bindedKeys[2]://gimble left
                this.bindedKeysIsPushed[2]=false;
                //this.isKeyDown(false);
                break;
            case this.bindedKeys[3]://gimble right
                this.bindedKeysIsPushed[3]=false;
                //this.isKeyDown(false);
                break;
        }
    }
}





let socket = new Sockets( new WebSocket('ws://192.168.1.124:8002'));
let settings;
let camera;
let slider;
let gamepad;
let keyboard;
let map;
let temprature;


window.addEventListener('load', function(){
    
    map = new Map([59.74075673613076, 19.173589129896786],14,true);

    camera = new Camera(document.getElementById("camera"));  
    slider = new SliderInput(socket,document.getElementsByClassName("slider"), document.querySelectorAll('[type="checkbox"]')[0] );
    gamepad= new GamepadInput(socket);
    temprature = new Temprature();

    var bindedKeys =Array();
    for(i=2; i<document.querySelectorAll('[type="button"]').length; i++)
    {
        bindedKeys[i-2]=document.querySelectorAll('[type="button"]')[i].value;
    }
    
    keyboard = new KeyboardInput(socket,bindedKeys);

    settings= new Settings(slider,gamepad,keyboard);
    
    
    socket.webbsocket.addEventListener('message',function(e){
        camera.updateImgContent(e.data);
        map.updateGPS(e.data);
        temprature.updateTemprature(e.data);
    });
    socket.webbsocket.addEventListener('error',function(e){
        console.log(e);
    }); 
});
