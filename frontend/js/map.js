//map providers http://leaflet-extras.github.io/leaflet-providers/preview/index.html
//https://www.sjofartsverket.se/sv/tjanster/sjokortsprodukter/karttjanster/
//menu https://leafletjs.com/SlavaUkraini/examples/choropleth/
//create a menu read this !! https://stackoverflow.com/questions/40906118/is-it-possible-to-add-custom-html-to-leaflet-layer-groups-and-layers-control
//https://map.openseamap.org/

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

    
    constructor(origin, scale, nodes=[]){
        this.scale = scale

        this.loadMap(origin, scale);
        
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

    loadMap(origin,scale){
        let me = this;

        this.map = L.map('map').setView(origin, scale); 
       
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

            var data = '<h3>tripp:<h3/><button id="tripp_type_button">tripp-type:circle</button><br><button id="add_marker_button">add marker</button><br><button id="delete_marker_button">delete marker</button>'
            this._div.innerHTML = data;
        };
        this.map_menu.addTo(this.map);
        
        this.add_marker_button= document.getElementById('add_marker_button');
        this.delete_marker_button= document.getElementById('delete_marker_button');
        this.tripp_type_button = document.getElementById('tripp_type_button');
    
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




var webbsocket = new WebSocket('ws://localhost:8002')

window.addEventListener('load',function(){
    var map = new Map([0,0],14);
    webbsocket.addEventListener('message',function(e){
        map.updateGPS(e.data);
    });
    webbsocket.addEventListener('error',function(e){
        console.log(e);
    }); 
});