const checkInputSpeed=10;

class Sockets{
    webbsocket;
    constructor(webbsocket){
        this.webbsocket=webbsocket;

    }
    giveData(a,b){
        console.log("throttle: "+a+", gimble:"+b);
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

        for(var i=0; i<this.slider.sliderObj.length; i++)
            this.slider.sliderObj[i].classList.toggle("show",true);

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
        for(var i=0; i<this.slider.sliderObj.length; i++)
            this.slider.sliderObj[i].classList.toggle("show",false);
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
        for(var i=0; i<this.slider.sliderObj.length; i++)
            this.slider.sliderObj[i].classList.toggle("show",false);

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
        this.img.src= urlCreator.createObjectURL(blob);
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

        //eventlistners
        for (var i = 0; i< this.sliderObj.length; i++) {
            this.sliderObj[i].addEventListener("touchstart", function(e){me.touchStart(e);}, false);
            this.sliderObj[i].addEventListener("touchend", function(e){me.touchEnd(e);}, false);
            this.sliderObj[i].addEventListener("touchcancel", function(e){me.touchCancel(e);}, false);
            this.sliderObj[i].addEventListener("touchmove", function(e){me.touchMove(e);}, false);
        }
    }

    enable(){}
    disable(){}

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
                    if( e.target.hasAttribute('orient') && e.target.getAttribute('orient') == "vertical")
                    {
                        var height= e.target.offsetHeight;
                        var range = e.target.max -e.target.min;
                        var unit =range/height;
                        
                        var unitchange= Math.round((this.touchPoints[i].pageY - e.targetTouches[0].pageY)*unit);
                        e.target.value=  parseInt(e.target.value)+unitchange;
                    }
                    else{
                        height= e.target.offsetWidth;
                        range = e.target.max -e.target.min;
                        unit =range/height;
                        
                        unitchange= Math.round((this.touchPoints[i].pageX - e.targetTouches[0].pageX)*unit);
                        e.target.value=  parseInt(e.target.value)-unitchange;
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

class GamepadInput{ //not tested
    socket;
    controller;
    throttleAxe;
    gimbleAxe;
    throttleAxeInverted;
    gimbleAxeInverted;
    enabled;

    constructor(socket,controller){ //controller can be null!
        this.enabled=false;
        this.socket= socket;
        this.controller = controller;
        this.throttleAxe =1;
        this.gimbleAxe= 3;
        this.throttleAxeInverted=false;
        this.gimbleAxeInverted=false;

        this.CheckGamepadInput();
    }
    async CheckGamepadInput(){
        while(this.controller !=null && this.enabled){
            this.socket.giveData(this.controller.axes[1], this.controller.axes[3])
            await new Promise(res => setTimeout(res, checkInputSpeed));
        }
    }
    enable(){
        console.log(this.enabled +" "+this.controller);
        if(this.enabled && this.controller !=null)
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



let socket = new Sockets( new WebSocket('ws://localhost:8002'));
let settings;
let camera;
let slider;
let gamepad;
let keyboard;


window.addEventListener('load', function(){
    
    camera = new Camera(document.getElementById("camera"));  
    slider = new SliderInput(socket,document.getElementsByClassName("slider"), document.querySelectorAll('[type="checkbox"]')[0] );
    gamepad= new GamepadInput(socket,null);

    var bindedKeys =Array();
    for(i=2; i<document.querySelectorAll('[type="button"]').length; i++)
    {
        bindedKeys[i-2]=document.querySelectorAll('[type="button"]')[i].value;
    }
    
    keyboard = new KeyboardInput(socket,bindedKeys);

    settings= new Settings(slider,gamepad,keyboard);
    
    
    socket.webbsocket.addEventListener('message',function(e){
        camera.updateImgContent(e.data);
    });
    socket.webbsocket.addEventListener('error',function(e){
        console.log(e);
    }); 

    window.addEventListener('gamepadconnected', function(e){
        gamepad.controller = e.gamepad; 
        console.log(gamepad.controller);
    },false);

    window.addEventListener("gamepaddisconnected", function(e) {
        gamepad.controller = null;
    },false);
});
