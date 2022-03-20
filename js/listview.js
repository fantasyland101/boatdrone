  
        function ToggleShowOrNot(id) {
          document.getElementById(id).classList.toggle("show");
        }


        var map =null;
        function LoadMap(){ //redo? go to https://openlayers.org/en/latest/examples/icon-negative.html 
          if (document.getElementById("gps").classList.contains("show") && map == null){
            map = new ol.Map({
              target: 'map',
              layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM() 
              })
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([37.41, 8.82]),
              zoom: 4
            })
            });
          }}



 