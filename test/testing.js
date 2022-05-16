let appImages = 'images/';
// let appImages = '/multi-viewer/images/'

let baseUrl;
let layer;

layer = '//openseadragon.github.io/example-images/duomo/duomo.dzi';
baseUrl = '//openseadragon.github.io/example-images/highsmith/highsmith.dzi';

// baseUrl = "http://openseadragon.github.io/example-images/duomo/duomo.dzi"
// baseUrl = '/images/grand-canyon-landscape-overlooking.jpg'

// layer = `${appImages}transparent.png`
// layer = `${appImages}default.png`

// multi-layer
function do_slides() {
  let arr = [[{"layerNum":0,"location":baseUrl,"opacity":0.5,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":1,"location":layer,"opacity":0.5,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"}],"colorspectrum":[{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}}],[{"layerNum":0,"location":baseUrl,"opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":1,"location":layer,"opacity":0.5,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"}],"colorspectrum":[{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}}]];
  pageSetup('contentDiv', arr, 2, 1, 2, 480, 640, {
    toolbarOn: true,
    paintbrushColor: '#0ff'
  });
}
// do_slides()

function one_slide() {
  let arr = [[{"layerNum":0,"location":baseUrl,"opacity":0.5,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(0, 0, 255, 255)","high":159,"low":101},{"color":"rgba(0, 255, 0, 255)","high":205,"low":160},{"color":"rgba(255, 255, 0, 255)","high":100,"low":0},{"color":"rgba(255, 0, 0, 255)","high":255,"low":206}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":1,"location":layer,"opacity":0.5,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 255, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 255, 255, 255)"}],"colorspectrum":[{"color":"rgba(0, 255, 0, 255)","high":205,"low":160},{"color":"rgba(255, 255, 0, 255)","high":100,"low":0},{"color":"rgba(0, 0, 255, 255)","high":159,"low":101},{"color":"rgba(255, 0, 0, 255)","high":255,"low":206}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}}]];
  pageSetup('contentDiv', arr, 1, 1, 1, 600, 800, {
    toolbarOn: true,
    paintbrushColor: '#0ff'
  });
}
one_slide()

/**
 * Using one slide
 * Comment out where layer > 0
 * 1. commonFunctions.setFilter(): // if (i > 0)
 * 2. layerUI.addRow(): // if (layerNum > 0)
 */
