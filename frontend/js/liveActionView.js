const checkInputSpeed=10;

class GPS{ //this instance is used by MAP
    boatMarker;
    boatMarkerImage; //custom image
    boatVelocity_lat;
    boatVelocity_long;
    gpsPositions; //gps history, orderd. 
    gpsPositon_lastUpdate; //time when the gpsPosition was last updated
    map; //instance of class map controller. 

    constructor(map){
        this.map= map;
        this.gpsPositions= Array();
        this.boatMarker= null;

        this.boatMarkerImage = L.icon({
            iconUrl: '../images/boat..jpg',
            iconSize: [56, 48],
            iconAnchor: [28, 24],
            popupAnchor: [-3, -76],
        });
    }

    updateGPS(blob){
        var me = this;
        var  blobReader = new FileReader();
        blobReader.onload = function() {
            const data = new Float32Array(this.result);
            this.update_gpsPositions(lat,long)
            if(me.boatMarker == null)
            {
                me.createBoatMarker(data[0], data[1])
                return;
            }
            me.boatMarker.setLatLng([data[0],data[1]]);
        };
        blobReader.readAsArrayBuffer(blob.slice(0,8));
    }

    createBoatMarker(lat,long){
        this.boatMarker = L.marker([lat,long], {icon: this.boatMarkerImage});
        this.boatMarker.addTo(this.map.leaflet_map);
    }

    update_gpsPositions(lat,long){

        let arrayLength = this.gpsPositions.length;
        if ( arrayLength == null || this.gpsPositions[arrayLength][0] == lat && this.gpsPositions[arrayLength][1] == long )
            return;
        
        const d = new Date();
        let new_time = d.getTime;         
        this.gpsPositions[arrayLength][0] = lat;
        this.gpsPositions[arrayLength][1] = long;  
        if(arrayLength >0) //there exist 2 elements or more in the array
        {
            const second =1000;
            const degree_in_Meter = 111000;
            let time_differnace_inSeconds = (new_time - this.gpsPositon_lastUpdate)/second;
            this.boatVelocity_lat = (lat -  this.gpsPositions[arrayLength-1][0])*degree_in_Meter/time_differnace_inSeconds;
            this.boatVelocity_long = (long - this.gpsPositions[arrayLength -1][1])*degree_in_Meter/time_differnace_inSeconds;
            console.log(this.boatVelocity_lat +"   "+this.boatVelocity_long);
        }
        this.gpsPositon_lastUpdate = new_time;
    }
}

class Navigation{
    map;

    routeMarkers;
    selectedRouteMarker; //index of selected marker in routemarker[]
    routeLine;
    tripptType; //a hole positive number

    add_marker_button;
    delete_marker_button;
    tripp_type_button;

    constructor(map){
        this.map = map;
        this.tripp_type = 0;
        this.routeLine = null;
        this.routeMarkers = Array();
    }

    add_eventListeners(){
        let me = this
        this.add_marker_button= document.getElementById('add_marker_button');
        this.delete_marker_button= document.getElementById('delete_marker_button');
        this.tripp_type_button = document.getElementById('tripp_type_button');

        this.tripp_type_button.addEventListener('click',function(){ 
            me.tripp_type +=1;
            if(me.tripp_type > 2 )
                me.tripp_type=0;
            me.update_tripp_type();
        });
        this.delete_marker_button.addEventListener('click',function(){
                me.delete_routeMarker(me.selectedRouteMarker);
                me.selectedRouteMarker=null;
        });
        this.add_marker_button.addEventListener('click',function(){ //somhow makes event listeners crach!!
            me.add_routeMarker(me.map.leaflet_map.getCenter());
        });
    }

    add_routeMarker(position){
        var me =this;
        var newMarker = L.marker(position, {draggable:'true'});
        newMarker.on('dragend', function(){
            me.update_tripp_type();
        });
        newMarker.on('click',function(){
            if(me.selectedRouteMarker != null){
                me.routeMarkers[me.selectedRouteMarker].setOpacity(1);
                me.selectedRouteMarker = null;
            }
            else{
                for(var i =0; i<me.routeMarkers.length; i++)
                    if(me.routeMarkers[i] === this)
                        me.selectedRouteMarker =i;
                this.setOpacity(0.6);
            }
        });
        newMarker.addTo(this.map.leaflet_map);
        this.routeMarkers.push(newMarker);
        this.update_tripp_type();
    }

    delete_routeMarker(index_of_routeMarker){
        if(index_of_routeMarker == null)
            return;
        this.map.leaflet_map.removeLayer(this.routeMarkers[index_of_routeMarker]);
        this.routeMarkers.splice(index_of_routeMarker,1);//removes the selected marker from marker
        this.update_tripp_type();
    }

    update_tripp_type(){
        switch(this.tripp_type){
            case 0:
                this.trippType_circle();
                break;
            case 1: 
                this.trippType_order();
                break;
            case 2: 
                this.trippType_fastest();
                break;
        }
    }

    trippType_circle(){
        this.tripp_type_button.innerHTML = 'tripp-type: circle';
        if(this.routeLine != null)
            this.map.leaflet_map.removeLayer(this.routeLine);

        let nodes = [];
        for(var i=0; i<this.routeMarkers.length;i++){
            nodes.push( this.routeMarkers[i].getLatLng());
            
        }
        if(nodes.length == 0)
            return;

        nodes.push(this.routeMarkers[0].getLatLng());
        this.routeLine = L.polyline(nodes, {color: 'red'}).addTo(this.map.leaflet_map);
    }

    trippType_order(){
        this.tripp_type_button.innerHTML = 'tripp-type: orderd';
        let nodes= new Array();
        for(var i=0; i<this.routeMarkers.length;i++){
            nodes.push(this.routeMarkers[i].getLatLng());

        }
        if(this.routeLine!=null)
            this.map.leaflet_map.removeLayer(this.routeLine);

        this.routeLine = L.polyline(nodes, {color: 'red'}).addTo(this.map.leaflet_map);
    }

    trippType_fastest(){
        this.tripp_type_button.innerHTML = 'tripp-type: fastest';

        if(this.routeLine!=null)
            this.map.leaflet_map.removeLayer(this.routeLine);
        //ship position?
    }
}

class Map{
    gps; //handels gps data
    navigation;//handels navigation
    leaflet_map;
    leaflet_map_menu;    
    no_fullscreen_button;
    fullscrean;

    constructor(origin, scale, fullscrean=false ,nodes=[]){
        this.gps = new GPS(this); 
        this.navigation= new Navigation(this);
        this.loadMap(origin, scale, fullscrean); //creates this.leaflet_map
    }

    loadMap(origin,scale, fullscrean= false){
        let d = new Date();
        let startTime = d.getTime(); 
        let time_until_userclick= 100;
        let me = this;
        document.getElementById('map').classList.toggle("minimalistic",!fullscrean); //adds the minimalistic class if loadMap=> minimalistic
        this.leaflet_map = L.map('map',{zoomControl: fullscrean}).setView(origin, scale);
        
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.leaflet_map);

        if(fullscrean){
            //CUSTOM MENU FOR LEAFLET MAP
            var leaflet_map_menu = L.control();
            leaflet_map_menu.onAdd = function (info) {
                this._div = L.DomUtil.create('div', 'menu-map'); // create a div with a class "menu-map"
                this.update();
                return this._div;
            };
            // method that we will use to update the control based on feature properties passed
            leaflet_map_menu.update = function (props) {
                var data = '<h3>tripp:<h3/><button id="exit_map">exit map</button><br><button id="tripp_type_button">tripp-type:circle</button><br><button id="add_marker_button">add marker</button><br><button id="delete_marker_button">delete marker</button>'
                this._div.innerHTML = data;
            };
            leaflet_map_menu.addTo(this.leaflet_map);

            this.no_fullscreen_button = document.getElementById("exit_map");
            this.no_fullscreen_button.addEventListener('click',function(){
                d =new Date();
                if(startTime + time_until_userclick > d.getTime())
                    return;
                

                let tempOrigin =me.leaflet_map.getCenter();
                let tempScale = 1
                me.leaflet_map.remove();
                me.loadMap(tempOrigin,tempScale, false);
            });
            this.navigation.add_eventListeners();
            this.leaflet_map.removeEventListener("devicemotion");
            return;
        }

        this.leaflet_map.scrollWheelZoom.disable()
        this.leaflet_map.dragging.disable()
        this.leaflet_map.touchZoom.disable()
        this.leaflet_map.doubleClickZoom.disable()
        this.leaflet_map.boxZoom.disable()
        this.leaflet_map.keyboard.disable()
        if (this.leaflet_map.tap)
            this.leaflet_map.tap.disable()

        this.leaflet_map.on('click', function(){ // create a new map that has an oposite minimalistic setting.
            d = new Date();
            if(startTime + time_until_userclick > d.getTime())
                return;
            
            let tempOrigin = me.leaflet_map.getCenter();
            let tempScale = me.leaflet_map.getZoom();
            me.leaflet_map.remove();
            me.loadMap(tempOrigin,tempScale, true); 
        });
    }
}

class Sockets{ //class for controlling webbsockets
    webbsocket_stream; //a continus data stream of data such as video, gps_position etc. 
    webbsocket_control; //a socket for controlling the server (a rc boat).
    throttle;
    gimble;
    constructor(webbsocket_stream,webbsocket_control){
        this.webbsocket_stream=webbsocket_stream;
        this.webbsocket_control = webbsocket_control;
        this.throttle=127;
        this.gimble=127;

        this.webbsocket_stream.addEventListener('error',function(e){
            console.log(e);
        }); 
        this.webbsocket_control.addEventListener('error',function(e){
            console.log(e);
        }); 
    }

    giveDataThrottle(throttle){ //change throttle 
        this.giveData(throttle,this.gimble)
    }
    giveDataGimble(gimble){ //change gimble
        this.giveData(this.throttle,gimble)
    }

    giveData(throttle,gimble){ //change throttle and gimble at the same time.
        this.throttle= throttle;
        this.gimble = gimble;
        console.log("throttle: "+throttle+", gimble:"+gimble);
        var data = new Int32Array([throttle,gimble]);   
        try{
            this.webbsocket_control.send(data);
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
    //html elements.
        //buttons
        settingsButton;
        gamepad_axe_bind_throttle_button;
        gampad_axe_bind_gimble_button;
        keyboard_throttle_up_button;
        keyboard_throttle_down_button;
        keyboard_gimble_left_button;
        keyboard_gimble_right_button;
        //checkboxed
        sliderCheckbox;
        keyboardCheckbox;
        gamepadCheckbox;
        //div-s
        gamepad_settings_container;
        keyboard_settings_container;
    //instances 
    slider;
    gamepad;
    keyboard;

    constructor(slider, gamepad, keyboard){
        
        var me =this;

        this.settingsButton = document.getElementById("settings");
        this.gamepad_axe_bind_throttle_button = document.getElementById("gamepad-bind-axe-throttle");
        this.gamepad_axe_bind_gimble_button =  document.getElementById("gamepad-bind-axe-gimble");
        this.keyboard_throttle_up_button = document.getElementById("keyboard-forward");
        this.keyboard_throttle_down_button = document.getElementById("keyboard-backward");
        this.keyboard_gimble_left_button = document.getElementById("keyboard-left");
        this.keyboard_gimble_right_button = document.getElementById("keyboard-right");

        this.sliderCheckbox = document.getElementById("slider-checkbox");
        this.keyboardCheckbox = document.getElementById("keyboard-checkbox");
        this.gamepadCheckbox = document.getElementById("gamepad-checkbox");
        this.gamepad_settings_container = document.getElementById("gamepad-settings-container");
        this.keyboard_settings_container = document.getElementById("keyboard-settings-container");
        this.keyboard=keyboard;
        this.slider=slider;
        this.gamepad=gamepad;

        //eventlistners
        this.settingsButton.addEventListener('click',function(){
            document.getElementById("settings-container").classList.toggle("show");
        });
        this.gamepad_axe_bind_throttle_button.addEventListener('click',function(){
            me.gamepad.bind_axe_throttle(me.gamepad_axe_bind_throttle_button);
        });
        this.gamepad_axe_bind_gimble_button.addEventListener('click',function(){
            me.gamepad.bind_axe_gimble(me.gamepad_axe_bind_gimble_button);
        });
        this.keyboard_throttle_up_button.addEventListener('click', function(){
            me.keyboard.rebindKey(me.keyboard.throttle_up_key_index,me.keyboard_throttle_up_button);
        });
        this.keyboard_throttle_down_button.addEventListener('click', function(){
            me.keyboard.rebindKey(me.keyboard.throttle_down_key_index,me.keyboard_throttle_down_button);
        });

        this.keyboard_gimble_left_button.addEventListener('click', function(){
            me.keyboard.rebindKey(me.keyboard.gimble_left_key_index,me.keyboard_gimble_left_button);
        });

        this.keyboard_gimble_right_button.addEventListener('click', function(){
            me.keyboard.rebindKey(me.keyboard.gimble_right_key_index,me.keyboard_gimble_right_button);
        });


        this.sliderCheckbox.addEventListener('click', function(){
            me.sliderCheckboxClick();

        });
        this.keyboardCheckbox.addEventListener('click', function(){
            me.keyboardCheckboxClick();

        });
        this.gamepadCheckbox.addEventListener('click', function(){
            me.gamepadCheckboxClick();
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
            return;
        }
        this.img.height = document.body.clientHeight;
        this.img.width = document.body.clientHeight*a;
        
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
            return;
        }
        socket.giveDataGimble(e.target.value);
    }

    touchCancel(e){/**https://developer.mozilla.org/en-US/docs/Web/API/Touch_events */
        for(let i=0; i<this.touchPoints.length; i++)
            if(this.touchPoints[i].target== e.target)
                this.touchPoints.splice(i, 1);     
    }

    touchEnd(e){ //removes the point from the toutchPoint array
        for(let i=0; i<this.touchPoints.length; i++)
            if(this.touchPoints[i].target== e.target)
                this.touchPoints.splice(i, 1);
    }

    touchMove(e){
        if(e.targetTouches.length != 1)
            return;
        
        for(let i=0; i<this.touchPoints.length; i++){
            if(this.touchPoints[i].target == e.target){
                if( e.target.hasAttribute('orient') && e.target.getAttribute('orient') == "vertical") 
                {
                    var height= e.target.offsetHeight;
                    var range = e.target.max -e.target.min;
                    var unit =range/height;
                        
                    var unitchange= Math.round((this.touchPoints[i].pageY - e.targetTouches[0].pageY)*unit);
                    e.target.value=  parseInt(e.target.value)+unitchange;
                    socket.giveDataThrottle(e.target.value);
                    this.touchPoints[i]= e.targetTouches[0];
                    continue;
                }
                
            height= e.target.offsetWidth;
            range = e.target.max -e.target.min;
            unit =range/height;
                        
            unitchange= Math.round((this.touchPoints[i].pageX - e.targetTouches[0].pageX)*unit);
            e.target.value=  parseInt(e.target.value)-unitchange;
            socket.giveDataGimble(e.target.value);
            this.touchPoints[i]= e.targetTouches[0];
            }
        }
    }
    touchStart(e){
        e.preventDefault();
        if(e.targetTouches.length != 1)
            return;
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
        this.throttleAxeInverted=true;
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
        const accuracyIndex = 0.05;//how small should a input change be before you should send the data to the server.
        while(this.controller != null && this.enabled){
            var Run =  Math.abs(this.throttleInput - this.controller.axes[this.throttleAxe]) > accuracyIndex
                || Math.abs(this.gimbleInput - this.controller.axes[this.gimbleAxe]) > accuracyIndex;

            if(Run)
            {
            this.throttleInput = this.controller.axes[this.throttleAxe];
            this.gimbleInput = this.controller.axes[this.gimbleAxe];
            if(this.throttleAxeInverted)
                throttle = -Math.round(this.throttleInput*255); 
            else
                throttle = Math.round(this.throttleInput*255); 
            
            if(this.gimbleAxeInverted)
                gimble = Math.round( -this.gimbleInput*125) +125;
            else
                gimble = Math.round(this.gimbleInput*125) +125;
            
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
    async bind_axe_throttle(button){
        button.style.opacity =0.7;
        const enughMovedInAxe = 0.9;
        while(this.controller != null && this.enabled){
            for(var i=0; i<this.controller.axes.length; i++)
            {
                if( -enughMovedInAxe >this.controller.axes[i])
                {
                    this.throttleAxeInverted = true;
                    this.throttleAxe =i
                    button.innerHTML = "gamepad axe throttle: " + i;
                    button.style.opacity =1;
                    return;
                }
                if(enughMovedInAxe <this.controller.axes[i])
                {
                    this.throttleAxeInverted = false;
                    this.throttleAxe =i
                    button.innerHTML = "gamepad axe throttle: " + i;
                    button.style.opacity =1;
                    return;
                }
            }            
            await new Promise(res => setTimeout(res, checkInputSpeed));
        }     
    }
    async bind_axe_gimble(button){
        const enughMovedInAxe = 0.9;
        while(this.controller != null && this.enabled){
            for(var i=0; i<this.controller.axes.length; i++)
            {
                
                if( -enughMovedInAxe >this.controller.axes[i])
                {
                    this.gimbleAxeInverted = true;
                    this.gimbleAxe =i
                    button.innerHTML = "gamepad axe gimble: " + i;
                    return;
                }
                if(enughMovedInAxe <this.controller.axes[i])
                {
                    this.gimbleAxeInverted = false;
                    this.gimbleAxe =i
                    button.innerHTML = "gamepad axe gimble: " + i;
                    return;
                }
            }            
            await new Promise(res => setTimeout(res, checkInputSpeed));
        }            
    }
}

class KeyboardInput{  
    socket;
    throttle;
    gimble;               //NOT WORKING YET
    bindedKeys; //array of binded keys
    bindedKeysIsPushed; //array of true/false values of binded keys
    lastPushedKey;


    enabled;

     //not constants but acts as constants
     throttle_up_key_index; //index in bindedkeys for the button that coresponds to throttle up.
     throttle_down_key_index;
     gimble_left_key_index;
     gimble_right_key_index;     

    constructor(socket,bindedKeys){
        this.lastPushedKey =null;
        this.enabled=false;
        this.socket= socket;
        this.throttle=0;
        this.gimble=0;
        this.bindedKeys=bindedKeys;
        this.bindedKeysIsPushed= [false,false,false,false];
        var me =this;

        this.throttle_up_key_index =0; 
        this.throttle_down_key_index =1;
        this.gimble_left_key_index = 3;
        this.gimble_right_key_index = 2;

        document.addEventListener('keydown', function(e){
            me.keyDown(e);  
        });
        document.addEventListener('keyup', function(e){
            me.keyUp(e);
        });
    }

    async rebindKey(key_index, button ){ //push key to rebind
        button.style.opacity =0.7;
        while(true)
        {
            console.log("hi");
            if(this.lastPushedKey != null)
            {
                this.bindedKeysIsPushed[key_index]=false;
                this.bindedKeys[key_index] = this.lastPushedKey;
                button.style.opacity = 1;
                button.innerHTML = this.lastPushedKey; 
                return;
            }
            await new Promise(res => setTimeout(res, checkInputSpeed));
        }
    }

    enable(){
        if(this.enabled)
            return;

        this.enabled=true;
        this.Update();
    }
    disable(){
        this.enabled=false;
    }

    async Update(){
        const changePerTick = 1
        while(this.enabled){
            var throttleAdd=0;
            var gimbleAdd =0;
            if(this.bindedKeysIsPushed[this.throttle_up_key_index] && !this.bindedKeysIsPushed[this.throttle_down_key_index])
                throttleAdd = changePerTick;
            else if(!this.bindedKeysIsPushed[this.throttle_up_key_index] && this.bindedKeysIsPushed[this.throttle_down_key_index])
                throttleAdd = -changePerTick;
            if(this.bindedKeysIsPushed[this.gimble_left_key_index] && !this.bindedKeysIsPushed[this.gimble_right_key_index])
                gimbleAdd =changePerTick;
            else if(!this.bindedKeysIsPushed[this.gimble_left_key_index] && this.bindedKeysIsPushed[this.gimble_right_key_index])
                gimbleAdd = -changePerTick;
            if( 0 > this.socket.gimble + gimbleAdd || this.socket.gimble + gimbleAdd > 255 )
                gimbleAdd=0;
            if( 0 > this.socket.throttle + throttleAdd || this.socket.throttle + throttleAdd > 255 )
                throttleAdd=0;
            
            if(throttleAdd !=0 || gimbleAdd !=0) //don't send if it we have not changed anything!
                this.socket.giveData(this.socket.throttle+throttleAdd,this.socket.gimble + gimbleAdd);
            
            await new Promise(res => setTimeout(res, checkInputSpeed));
        }
    }
    keyDown(e) {
        this.lastPushedKey = e.code;
        switch(e.code){
            case this.bindedKeys[this.throttle_up_key_index]://throttle up
                this.bindedKeysIsPushed[this.throttle_up_key_index]=true;
                break;
            case this.bindedKeys[this.throttle_down_key_index]://throttle down
                this.bindedKeysIsPushed[this.throttle_down_key_index]=true;
                break;
            case this.bindedKeys[this.gimble_left_key_index]://gimble left
                this.bindedKeysIsPushed[this.gimble_left_key_index]=true;
                break;
            case this.bindedKeys[this.gimble_right_key_index]://gimble right
                this.bindedKeysIsPushed[this.gimble_right_key_index]=true;
                break;
        }
    }
    keyUp(e){
        if(this.lastPushedKey == e.code)
            this.lastPushedKey =null;       
        switch(e.code){
            case this.bindedKeys[this.throttle_up_key_index]://throttle up
                this.bindedKeysIsPushed[this.throttle_up_key_index] = false;
                break;
            case this.bindedKeys[this.throttle_down_key_index]://throttle down
                this.bindedKeysIsPushed[this.throttle_down_key_index] = false;
                break;
            case this.bindedKeys[this.gimble_left_key_index]://gimble left
                this.bindedKeysIsPushed[this.gimble_left_key_index] = false;
                break;
            case this.bindedKeys[this.gimble_right_key_index]://gimble right
                this.bindedKeysIsPushed[this.gimble_right_key_index] = false;
                break;
        }
    }
}


//---------------MAIN--------------------------


let socket;
let settings;
let camera;
let slider;
let gamepad;
let keyboard;
let map;
let temprature;


window.addEventListener('load', function(){
    
    socket = new Sockets( new WebSocket('ws://localhost:8002'), new WebSocket('ws://localhost:8001'));
    map = new Map([0,0],14,false);

    camera = new Camera(document.getElementById("camera"));  
    slider = new SliderInput(socket,document.getElementsByClassName("slider"), document.querySelectorAll('[type="checkbox"]')[0] );
    gamepad= new GamepadInput(socket);
    temprature = new Temprature();

    var bindedKeys =Array();
        bindedKeys[0]= "KeyW"
        bindedKeys[1]= "KeyS"
        bindedKeys[2]= "KeyA"
        bindedKeys[3]= "KeyD"

    keyboard = new KeyboardInput(socket,bindedKeys);

    settings= new Settings(slider,gamepad,keyboard);
    
    socket.webbsocket_stream.addEventListener('message',function(e){
        camera.updateImgContent(e.data);
        map.gps.updateGPS(e.data);
        temprature.updateTemprature(e.data);
    });
});
