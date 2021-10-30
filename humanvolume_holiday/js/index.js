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

  var human_volume_layer = new layer
  (
    layerData = human_volume_holiday_coords,
    weight = "VolumeAlltime",
    layerGradient = Heatmap4,
    layerMaxIntensity = 1000,
    layerRadius = 15,
    layerOpacity = 1
  );

  // ——————————————————————————————————————————————————————————————HEATMAP数据切换————————————————————————————————————————————————————————————————————————
  var dataSelect = document.getElementById("dropdown");
  let heatmap
  function generateData()
  {
    layer = human_volume_layer
    var time_selected = dataSelect.selectedItems[0].id
    var data_shown = layer.layerData;
    var weight_shown = layer.weight;
    
    // ———————————————————————————————————————————————————————————————取出需要的layer
    if(heatmap)
    {
      heatmap.setMap(null);
      heatmap.setData([]);
    }
    {
      const heatmapData = [];
      for (let i = 0; i < data_shown.length; i++)
      {
        const weightedLatLon =
        {
          location: new google.maps.LatLng(data_shown[i].Latitude, data_shown[i].Longitude),
          weight: data_shown[i][weight_shown][time_selected]
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
  document.getElementById("delete").onclick = function deleteHeatmap()
  {
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

