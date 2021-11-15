/*
An array of viewers
[
    [],
    [],
    [],
    []
]

A viewer contains
{
    "layerNum": 0,
    "location": "http://129.49.255.69/iiif/?iiif=http://129.49.255.69/HalcyonStorage/TCGA-2J-AAB1-01Z-00-DX1.F3B4818F-9C3B-4C66-8241-0570B2873EC9.svs/info.json",
    "opacity": 0.3
},
{
    "layerNum": 1,
    "location": "http://129.49.255.69/halcyon/?iiif=file:///data/HalcyonStorage/hovernet.zip/info.json",
    "opacity": 0.3,
    "colors": [
        { "color": "rgba(255, 140, 0, 255)", "low": 206, "high": 255 },
        { "color": "rgba(255, 140, 0, 255)", "low": 206, "high": 255 },
        { "color": "rgba(255, 140, 0, 255)", "low": 206, "high": 255 }
    ]
}
 */

let viewer = [
  [{
    "layerNum": 0,
    "location": "//openseadragon.github.io/example-images/duomo/duomo.dzi",
    "opacity": 0.3
  },
    {
      "layerNum": 1,
      "location": "//openseadragon.github.io/example-images/duomo/duomo.dzi",
      "opacity": 0.3,
      "colors": [
        {
          "value": 1,
          "label": "Tumor",
          "color": "rgba(255, 255, 0, 255)",
          "low": 206,
          "high": 255
        },
        {
          "value": 2,
          "label": "Miscellaneous",
          "color": "rgba(0, 0, 255, 255)",
          "low": 160,
          "high": 205
        },
        {
          "value": 3,
          "label": "Lymphocyte",
          "color": "rgba(255, 0, 0, 255)",
          "low": 151,
          "high": 159
        },
        {
          "value": 4,
          "label": "https://null.com/background",
          "color": "rgba(255, 165, 0, 255)",
          "low": 106,
          "high": 150
        }
      ]
    }]
]

pageSetup('contentDiv', viewer, 1, 1, 1, 640, 480, {
  toolbarOn: true,
  paintbrushColor: '#0ff'
})
