require
(
  ["esri/config", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/renderers/HeatmapRenderer", "esri/widgets/Legend", "esri/widgets/Expand", "esri/renderers/ClassBreaksRenderer"],
  function (esriConfig, Map, MapView, FeatureLayer, Legend, Expand, ClassBreaksRenderer) 
  {

//-------------------------------------Map Control Initialization------------------------------------------------------------------------------------------------------

    esriConfig.apiKey = "AAPKb5d758fbfaf144b197b6b4f4bd2ecfb7rcXe-NnkiuOpUDlvB__2Wu7_T-eTMKXul8H3FIFcf6vufaSJ3OexuR_W69yUtkql";

    const map = new Map
    ({
      basemap:  // Basemap layer service, for example: arcgis-topographic
      {
        portalItem:
        {
          id: "4f2e99ba65e34bb8af49733d9778fb8e"
        }
      }
    });
    const view = new MapView
    ({
      map: map,
      center: [103.82, 1.34],
      zoom: 11,
      container: "viewDiv"
    });

    // view.ui.add(document.getElementById("panelDiv"), "top-right");
    view.ui.add
    (
      new Expand
      ({
        content: new Legend
        ({
          view: view
        }),
        view: view,
        expanded: false
      }),
    "bottom-right"
    );

//--------------------------------------Render Options----这里也可以用类把所有渲染封装起来，但作者太懒就没有干-------------------------------------------------------------------------------------------------    
    const Heatmap1 = ["#85c1c8", "#90a1be", "#9c8184", "#a761aa", "#af4980", "#b83055", "#c0182a", "#c80000", "#d33300", "#de6600", "#e99900", "#f4cc00", "#ffff00"];
    const Heatmap2 = ["#f3e4e5", "#e4becb", "#d498b2", "#c57298", "#b95685", "#ae3972", "#a21d5e", "#96004b", "#ab006f", "#c00093", "#d500b7", "#ea00db", "#ff00ff"];    
    const Heatmap4 = ["#0022c8", "#2b1ca7", "#551785", "#801164", "#aa0b43", "#d50621", "#ff0000", "#ff3900", "#ff7100", "#ffaa00", "#ffc655", "#ffe3aa", "#ffffff"];
    const Heatmap8 = ["#730073", "#820082", "#910091", "#a000a0", "#af00af", "#c300c3", "#d700d7", "#eb00eb", "#ff00ff", "#ff58a0", "#ff896b", "#ffb935", "#ffea00"];
    const Heatmap9 = ["#215587", "#245b91", "#26629b", "#2968a5", "#2b6eaf", "#307bc3", "#3687d7", "#3b94eb", "#40a0ff", "#6db8ff", "#9bd0ff", "#c8e7ff", "#f5ffff"];
    const BlueNRed11 = ["#ff2638", "#a6242e", "#403031", "#2e6ca4", "#1993ff"];
    const Blue23 = ["#0010d9", "#0040ff", "#0080ff", "#00bfff", "#00ffff"];
    const Blue19 = ["#00497c", "#0062a8", "#007cd3", "#0095ff", "#00b7ff"];
    const Purple13 = ["#43048d", "#690cc2", "#8f14f7", "#b63df4", "#e566ff"];// #4e0f55|#750580|#9c00aa|#ca00d4|#ff00ff
    const Purple10 = ["#4e0f55", "#750580", "#9c00aa", "#ca00d4", "#ff00ff"];
    // Color Ramp Source: https://developers.arcgis.com/javascript/latest/visualization/symbols-color-ramps/esri-color-ramps/

    const IAColor = Heatmap4;
    const SPColor = Heatmap4;
    const SCColor = Heatmap9;
    const VGColor = Heatmap8;

    const IARenderer = {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: 
      {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        outline: 
        {  // autocasts as new SimpleLineSymbol()
          color: [128, 128, 128, 0.2],
          width: "0px"
        }
      },
      label: "Number of bus stops within 20-minute-walk", // label for the legend
      visualVariables: [
        {
          type: "color", // indicates this is a color visual variable
          field: "StopNumber",
          stops: [
            {value: 1, color: IAColor[0], label: "1"},
            {value: 10, color: IAColor[3]},
            {value: 20, color: IAColor[6], label: "20"},
            {value: 30, color: IAColor[9]},
            {value: 40, color: IAColor[12], label: "40 or higher"}
          ]
        }
      ]
    };

    const SPRenderer = 
    {
      type: "simple",
      symbol: 
      {
        type: "simple-marker",
        style: "circle",
        color: [250, 250, 250],
        outline: 
        {
          color: [255, 255, 255, 0.5],
          width: 0
        },
        size: "8px"
      },
      label: "Number of people served per bus route",
      visualVariables: 
      [{
        type: "color",
        field: "Pressure",
        stops: 
        [
          { value: 1, color: SPColor[0] },
          { value: 3000, color: SPColor[3] },
          { value: 9000, color: SPColor[6] },
          { value: 20000, color: SPColor[9] },
          { value: 40000, color: SPColor[12] }
        ]
      }]
    };

    const SCRenderer = {
      type: "simple",
      symbol: 
      {
        type: "simple-fill",
        outline: 
        {
          color: [128, 128, 128, 0.2],
          width: "0px"
        }
      },
      label: "Percentage of subzone area covered by Isochronous Area",
      visualVariables: [
        {
          type: "color",
          field: "Coverage",
          stops: [
            {value: 1, color: SCColor[0], label: "0%"},
            {value: 25, color: SCColor[3]},
            {value: 50, color: SCColor[6], label: "50%"},
            {value: 75, color: SCColor[9]},
            {value: 100, color: SCColor[12], label: "100%"}
          ]
        }
      ]
    };

    const VGRenderer = {
      type: "simple",
      symbol: 
      {
        type: "simple-fill",
        outline: 
        {
          color: [128, 128, 128, 0.2],
          width: "0px"
        }
      },
      label: "Pouplation of children and elder",
      visualVariables: [
        {
          type: "color",
          field: "Population",
          stops: [
            {value: 0, color: VGColor[0], label: "0"},
            {value: 2500, color: VGColor[3]},
            {value: 7500, color: VGColor[6], label: "7500"},
            {value: 15000, color: VGColor[9]},
            {value: 48000, color: VGColor[12], label: "40000 or higher"}
          ]
        }
      ]
    };

    const IDRenderer = 
    {
      type: "simple",
      symbol: 
      {
        type: "simple-marker",
        style: "circle",
        color: [250, 250, 250],
        outline: 
        {
          color: [255, 255, 255, 0.5],
          width: 0
        },
        size: "8px"
      },
      label: "Suggestion for stops that needs ",
      visualVariables: 
      [{
        type: "color",
        field: "Pressure",
        stops: 
        [
          { value: 1, color: SPColor[0] },
          { value: 3000, color: SPColor[3] },
          { value: 9000, color: SPColor[6] },
          { value: 20000, color: SPColor[9] },
          { value: 40000, color: SPColor[12] }
        ]
      }]
    };
    

//--------------------------------------Data Class-----------------------------------------------------------------------------------------------------
    const Isochronous_Area = new FeatureLayer
    ({
      url: "https://services5.arcgis.com/KiRa9d9aHfdXiCqt/arcgis/rest/services/Isochronous_Area/FeatureServer/0",
      renderer: IARenderer,
      opacity: 0.9
    });
    const Stop_Pressure = new FeatureLayer
    ({
      url: "https://services5.arcgis.com/KiRa9d9aHfdXiCqt/arcgis/rest/services/Stop_Pressure/FeatureServer/0",
      renderer: SPRenderer
    });
    const Service_Coverage_Rate = new FeatureLayer
    ({
      url: "https://services5.arcgis.com/KiRa9d9aHfdXiCqt/arcgis/rest/services/Service_Coverage_Rate/FeatureServer/0",
      renderer: SCRenderer,
      opacity: 0.9
    });
    const Vulnerable_Group = new FeatureLayer
    ({
      url: "https://services5.arcgis.com/KiRa9d9aHfdXiCqt/arcgis/rest/services/Vulnerable_Group/FeatureServer/0",
      renderer: VGRenderer,
      opacity: 0.9
    });
    const Increasing_Density_Suggestion = new FeatureLayer
    ({
      url: "https://services5.arcgis.com/KiRa9d9aHfdXiCqt/arcgis/rest/services/Increasing_Density_Suggestion/FeatureServer/0",
      renderer: IDRenderer,
      opacity: 1
    });

    function myLayer(whetherLoaded, id, layerName, seq)  // 构造一个对象把所有的url、service等等联系起来
    {
      this.whetherLoaded = whetherLoaded;
      this.id = id;
      this.layerName = layerName;
      this.add = function () 
      {
        map.add(layerName, seq);
      };
      this.remove = function () 
      {
        map.remove(layerName)
      }
    };
    var IA = new myLayer(false, "Isochronous", Isochronous_Area, 1);
    var SP = new myLayer(false, "Stop", Stop_Pressure, 1);
    var SCR = new myLayer(false, "Service", Service_Coverage_Rate, 0);
    var VG = new myLayer(false, "Vulnerable", Vulnerable_Group, 0);
    var IDS = new myLayer(false, "Increasing", Increasing_Density_Suggestion, 2);
    var allMyLayer = [IA, SP, SCR, VG, IDS];

//------------------------------------Dropdown Menu-------------------------------------------------------------------------------------------------------

    function generateData()  // 两步走，第一把被选中了的加上，第二把没选中的删掉
    {  // 初始化状态，如果被加载了就会被改成true
      for(var i = 0; i < allMyLayer.length; i++)
      {
        allMyLayer[i].whetherLoaded = false;
      };
      for (var i = 0; i < dataSelect.selectedItems.length; i++)  // 这步是把被选中了对象的给加载上去
      {
        for (var j = 0; j < allMyLayer.length; j++)
        {
          if (dataSelect.selectedItems[i].id == allMyLayer[j].id)  //遍历allMyLayer里的所有对象，如果有和被选中的匹配的，就进入操作
          {
            if (allMyLayer[j].whetherLoaded == false)  // 判断是否图层已经被添加过了，节约渲染资源
            {
              allMyLayer[j].add();
              allMyLayer[j].whetherLoaded = true;
            }
          }
        }
      };
      for (var i = 0; i < allMyLayer.length; i++)
      {
        if (allMyLayer[i].whetherLoaded == false)
        {
          allMyLayer[i].remove();
          allMyLayer[i].whetherLoaded = false
        }
      }
    }
    var dataSelect = document.getElementById("dropdown");
    dataSelect.addEventListener("calciteDropdownSelect", generateData);

//------------------------------------------------Delete Map-------------------------------------------------------------------------------------------

    document.getElementById("delete").onclick = function deletemap()
    {
      for (var i = 0; i < allMyLayer.length; i++)
      {
        if (allMyLayer[i].whetherLoaded == true)
        {
          allMyLayer[i].remove();
          allMyLayer[i].whetherLoaded = false
        }
      }
    }
  }
)

// 判断一个图层是否有被加载：layerName.loaded

