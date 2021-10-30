let map, infoWindow;
let markers = [];
function initMap()
{
  // —————————————————————————————————————————————————————————————底图初始化—————————————————————————————————————————————————————————————
  map = new google.maps.Map
  (
    document.getElementById("map"),
    {
      zoom: 12,
      styles: stylesArray,
      center: new google.maps.LatLng(1.34, 103.82),
      mapTypeId: "terrain",
    }
  );
  // —————————————————————————————————————————————————————————————定位控件——————————————————————————————————————————————————————————————————
  infoWindow = new google.maps.InfoWindow();
  const locationButton = document.createElement("button");
  locationButton.textContent = "LOCATE";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener
  (
    "click",
    () => 
    {
      // Try HTML5 geolocation.
      if (navigator.geolocation)
      {
        navigator.geolocation.getCurrentPosition
        (
          (position) => 
          {
            const pos = 
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            infoWindow.setPosition(pos);
            infoWindow.setContent("Location found.");
            infoWindow.open(map);
            map.setCenter(pos);
          },
          () => 
          {
            handleLocationError(true, infoWindow, map.getCenter());
          }
        );
      } 
      else 
      {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
    }
  );
  function handleLocationError(browserHasGeolocation, infoWindow, pos) 
  {
    infoWindow.setPosition(pos);
    infoWindow.setContent
    (
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  };
  //==============================================================底图初始化结束=======================================================================

  // ——————————————————————————————————————————————————————————————构造数据类—————————————————————————————————————————————————————————————
  function layer(layerData, weight, layerGradient, layerMaxIntensity, layerRadius, layerOpacity)
  {
    this.layerData = layerData;
    this.weight = weight;
    this.layerGradient = layerGradient;
    this.layerMaxIntensity = layerMaxIntensity;
    this.layerRadius = layerRadius;
    this.layerOpacity = layerOpacity
  };

  var stops_capacity_layer = new layer
  (
    layerData = stops_capacity,
    weight = "Capacity",
    layerGradient = ramp_stops_capacity,
    layerMaxIntensity = 17,
    layerRadius = 30,
    layerOpacity = 1
  );
  var stops_bus_volume_layer = new layer
  (
    layerData = stops_bus_volume,
    weight = "BusVolume",
    layerGradient = Heatmap9,
    layerMaxIntensity = 60,
    layerRadius = 20,
    layerOpacity = 1
  );
  var stops_human_volume_layer = new layer
  (
    layerData = stops_human_volume,
    weight = "HumanVolume",
    layerGradient = Heatmap12, 
    layerMaxIntensity = 600,
    layerRadius = 20,
    layerOpacity = 1
  );
  var stops_balance_layer = new layer
  (
    layerData = stops_balance,
    weight = "Balance",
    layerGradient = Heatmap4,
    layerMaxIntensity = 17,
    layerRadius = 20,
    layerOpacity = 1
  );

  var allMyLayer = [stops_capacity_layer, stops_bus_volume_layer, stops_human_volume_layer, stops_balance_layer];
  // ————————————————————————————————————————————————————————————添加MARKER————————————————————————————————————————————————————————————————————————
  
  
  function addMarkers(markerLayer)
  {
    markerData = markerLayer.layerData;
    scale_shown = markerLayer.weight;
    for(var i = 0; i < markerData.length; i++)
    {
      latitude = markerData[i].Latitude;
      longitude = markerData[i].Longitude;
      
      // console.log(latitude, longitude)
      const marker = new google.maps.Marker
      ({
        position: {lat: latitude, lng: longitude},
        icon: 
        {
          path: google.maps.SymbolPath.CIRCLE,
          scale: markerData[i][scale_shown],
          fillColor: "rgb(14, 248, 254)",
          fillOpacity: 0.6,
          // strokeColor: "white",
          strokeWeight: 0,
        },
        // draggable: true,
        map: map,
      });
      markers.push(marker)
    }
  };
  

  // ——————————————————————————————————————————————————————————————HEATMAP数据切换————————————————————————————————————————————————————————————————————————
  var dataSelect = document.getElementById("dropdown");
  let heatmap
  function generateData()
  {
    for(var i = 0; i < allMyLayer.length; i++)
    {
      for(var j = 0; j < dataSelect.selectedItems.length; j++)
      {
        if(dataSelect.selectedItems[j].id == allMyLayer[i].weight)
        {
          var layer = allMyLayer[i];   
        }
      }
    }
    var data_shown = layer.layerData;
    var weight_shown = layer.weight;
    // ———————————————————————————————————————————————————————————————取出需要的layer
    if(heatmap)
    {
      heatmap.setMap(null);
      heatmap.setData([]);
    }

    if(weight_shown == 'Capacity')
    {
      addMarkers(layer)
    }
    else
    {
      const heatmapData = [];
      for (let i = 0; i < data_shown.length; i++)
      {
        const weightedLatLon =
        {
          location: new google.maps.LatLng(data_shown[i].Latitude, data_shown[i].Longitude),
          weight: data_shown[i][weight_shown]
        }
        heatmapData.push(weightedLatLon);
      }

      heatmap = new google.maps.visualization.HeatmapLayer
      ({
        data: heatmapData,
        gradient: layer.layerGradient,
        maxIntensity: layer.layerMaxIntensity,
        dissipating: true,
        radius: layer.layerRadius,
        opacity: layer.layerOpacity,
        map: map
      });
      heatmap.setMap(map);
    }
  };
  dataSelect.addEventListener("calciteDropdownSelect", generateData);


// ——————————————————————————————————————————————————————————————HEATMAP与MARKER数据清除————————————————————————————————————————————————————————————————————————
  document.getElementById("delete").onclick = function deleteHeatmap(){
    if(heatmap)
    {
      heatmap.setMap(null);
      dataSelect.selectedItems = [];
    }
    if(markers)
    {
      for (let i = 0; i < markers.length; i++)
      {
        markers[i].setMap(null);
      }
      markers = []
    }
  }
  
  // —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
};

