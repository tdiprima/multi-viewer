function f() {
  /*
  let url, url1
  // url = 'http://129.49.255.69/iiif/?iiif=http://129.49.255.69/HalcyonStorage/TCGA-2J-AAB1-01Z-00-DX1.F3B4818F-9C3B-4C66-8241-0570B2873EC9.svs/info.json'
  // url1 = 'http://129.49.255.69/halcyon/?iiif=file:///data/HalcyonStorage/hovernet.zip/info.json'
  url = url1 = '//openseadragon.github.io/example-images/duomo/duomo.dzi'
  let arr = [[{"layerNum":0,"location":url,"opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(0, 0, 255, 255)","high":159,"low":101},{"color":"rgba(0, 255, 0, 255)","high":205,"low":160},{"color":"rgba(255, 255, 0, 255)","high":100,"low":0},{"color":"rgba(255, 0, 0, 255)","high":255,"low":206}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":1,"location":url1,"opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 255, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 255, 255, 255)"}],"colorspectrum":[{"color":"rgba(0, 255, 0, 255)","high":205,"low":160},{"color":"rgba(255, 255, 0, 255)","high":100,"low":0},{"color":"rgba(0, 0, 255, 255)","high":159,"low":101},{"color":"rgba(255, 0, 0, 255)","high":255,"low":206}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}}]]
  */
  let image = '//openseadragon.github.io/example-images/duomo/duomo.dzi'
  // let image = '/images/grand-canyon-landscape-overlooking.jpg'

  /**
   * Using one slide
   * Comment out where layer > 0
   * 1. commonFunctions.setFilter(): // if (i > 0) {
   * 2. layerUI.addRow(): // if (layerNum > 0) {
   */
  let arr = [[{
    "layerNum": 0,
    "location": image,
    "opacity": 1,
    "colorscheme": {
      "@type": "ColorScheme",
      "name": "Default Color Scheme",
      "colors": [{"name": "Tumor", "classid": 1, "color": "rgba(0, 255, 0, 255)"}, {
        "name": "Background",
        "classid": 4,
        "color": "rgba(0, 0, 255, 255)"
      }, {"name": "Lymphocyte", "classid": 3, "color": "rgba(255, 0, 0, 255)"}, {
        "name": "Misc",
        "classid": 2,
        "color": "rgba(255, 255, 0, 255)"
      }],
      "colorspectrum": [{"color": "rgba(0, 0, 255, 255)", "high": 159, "low": 101}, {
        "color": "rgba(0, 255, 0, 255)",
        "high": 205,
        "low": 160
      }, {"color": "rgba(255, 255, 0, 255)", "high": 100, "low": 0}, {
        "color": "rgba(255, 0, 0, 255)",
        "high": 255,
        "low": 206
      }],
      "@context": [{
        "so": "https://schema.org/",
        "hal": "https://www.ebremer.com/halcyon/ns/",
        "name": {"@id": "so:name"},
        "classid": {"@id": "hal:classid"},
        "color": {"@id": "hal:color"},
        "colors": {"@id": "hal:colors"},
        "low": {"@id": "hal:low"},
        "high": {"@id": "hal:high"},
        "ColorByCertainty": {"@id": "hal:ColorByCertainty"},
        "ColorByClassID": {"@id": "hal:ColorByClassID"},
        "colorspectrum": {"@id": "hal:colorspectrum"},
        "ColorScheme": {"@id": "hal:ColorScheme"}
      }]
    }
  }]]

  pageSetup('contentDiv', arr, 1, 1, 1, 800, 600, {
    toolbarOn: true,
    paintbrushColor: '#0ff'
  })
}

f()

function f1() {
  const arr = getViewersInfos()
  arr.forEach(item => {
    console.log('%c\nViewer:', 'color: #997fff;', item.viewer)
    console.log('%cInfo:', 'color: #997fff;', item.vInfo)

    console.log('%c\nInfo details:', 'color: blue')
    const object = item.vInfo
    for (const property in object) {
      console.log(`${property}:`, object[property])
    }

    console.log('%c\nLayers:', 'color: lime')
    const layers = object.layers
    Array.isArray(layers)
    layers.forEach(layer => {
      console.log(layer)
      console.log('%c\nLayer details:', 'color: orange')
      for (const item in layers[0]) {
        console.log(`${item}:`, layers[0][item])
      }
    });

    console.log('%c\nColor schemes:', 'color: #ff00cc;')
  });

}
