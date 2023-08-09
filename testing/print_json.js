let baseUrl = '//openseadragon.github.io/base/highsmith/highsmith.dzi';
let layer = '//openseadragon.github.io/feature/duomo/duomo.dzi';
// testing.js
let arr = [[{"layerNum":0,"location":baseUrl,"opacity":0.5,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(0, 0, 255, 255)","high":159,"low":101},{"color":"rgba(0, 255, 0, 255)","high":205,"low":160},{"color":"rgba(255, 255, 0, 255)","high":100,"low":0},{"color":"rgba(255, 0, 0, 255)","high":255,"low":206}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":1,"location":layer,"opacity":0.5,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 255, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 255, 255, 255)"}],"colorspectrum":[{"color":"rgba(0, 255, 0, 255)","high":205,"low":160},{"color":"rgba(255, 255, 0, 255)","high":100,"low":0},{"color":"rgba(0, 0, 255, 255)","high":159,"low":101},{"color":"rgba(255, 0, 0, 255)","high":255,"low":206}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}}]];
console.log(JSON.stringify(arr, null, 4));