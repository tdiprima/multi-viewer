/**
 * pageSetup
 * Set up web page for multi-viewer.
 * @param divId: Main div id.
 * @param images: Items to be displayed in viewer.
 * @param numViewers: Total number of viewers.
 * @param rows: LAYOUT: Number of rows (of viewers)
 * @param columns: LAYOUT: Number of columns (of viewers)
 * @param width: Viewer width
 * @param height: Viewer height
 * @param opts: Multi-viewer options; paintbrush, etc.
 */
const pageSetup = (divId, images, numViewers, rows, columns, width, height, opts) => {
  // images = images.slice(0, 1)
  // images = [[{"layerNum":0,"location":"http://129.49.255.69:8888/iiif/?iiif=http://129.49.255.69:8888/HalcyonStorage/demo1/TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.svs/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":1,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/dysplasia.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":2,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/epithelium.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"}],"colorspectrum":[{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":3,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/incep-heatmap_TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}}]]
  // images = [[{"layerNum":0,"location":"http://129.49.255.69:8888/iiif/?iiif=http://129.49.255.69:8888/HalcyonStorage/demo1/TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.svs/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":1,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/dysplasia.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":2,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/epithelium.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"}],"colorspectrum":[{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":3,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/incep-heatmap_TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":4,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/inceptNEW-heatmap_TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"}],"colorspectrum":[{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":5,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/necrosis.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":6,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/stroma.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"}],"colorspectrum":[{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":7,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/tumor.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"}],"colorspectrum":[{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":8,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/tumor_heatmap_TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"}],"colorspectrum":[{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(44, 131, 186, 255)","high":99,"low":0}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}},{"layerNum":9,"location":"http://129.49.255.69:8888/halcyon/?iiif=file:///data/HalcyonStorage/demo1/vgg-heatmap_TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.zip/info.json","opacity":1,"colorscheme":{"@type":"ColorScheme","name":"Default Color Scheme","colors":[{"name":"Lymphocyte","classid":3,"color":"rgba(255, 0, 0, 255)"},{"name":"Misc","classid":2,"color":"rgba(255, 255, 0, 255)"},{"name":"Background","classid":4,"color":"rgba(0, 0, 255, 255)"},{"name":"Tumor","classid":1,"color":"rgba(0, 255, 0, 255)"}],"colorspectrum":[{"color":"rgba(44, 131, 186, 255)","high":99,"low":0},{"color":"rgba(171, 221, 164, 255)","high":100,"low":51},{"color":"rgba(246, 173, 96, 255)","high":200,"low":151},{"color":"rgba(216, 63, 42, 255)","high":255,"low":201},{"color":"rgba(254, 251, 191, 255)","high":150,"low":101}],"@context":[{"so":"https://schema.org/","hal":"https://www.ebremer.com/halcyon/ns/","name":{"@id":"so:name"},"classid":{"@id":"hal:classid"},"color":{"@id":"hal:color"},"colors":{"@id":"hal:colors"},"low":{"@id":"hal:low"},"high":{"@id":"hal:high"},"ColorByCertainty":{"@id":"hal:ColorByCertainty"},"ColorByClassID":{"@id":"hal:ColorByClassID"},"colorspectrum":{"@id":"hal:colorspectrum"},"ColorScheme":{"@id":"hal:ColorScheme"}}]}}]];
  // const div = document.createElement('div')
  // div.innerText = JSON.stringify(images)
  // document.body.appendChild(div)
  // for (const [key, value] of Object.entries(images[0])) {
  //   let urlObj = new URL(value.location)
  //   let url = urlObj.searchParams.get('iiif')
  //   const sections = (url).split('/')
  //   console.log(`${sections[sections.length - 2]}`);
  // }
  // numViewers = 1
  // rows = 1
  // columns = 1

  // When the 'images' parameter becomes an array with null elements,
  // it means that the session timed out or is in the process of timeout.
  // So log the user out and have them start again.
  if (!isRealValue(images) || images[0] === null) {
    // logout & redirect
    document.write("<script>window.alert('Session timeout. Click OK to continue...');window.location=`${window.location.origin}/auth/realms/Halcyon/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;</script>")
  }

  let viewers = [] // eslint-disable-line prefer-const
  document.addEventListener('DOMContentLoaded', () => {
    new Promise(resolve => {
      return resolve(opts)
    }).then(opts => {
      document.body.classList.add('theme--default')
      // dark-mode
      let awesome = e('i', {'class': 'fas fa-moon moon'})

      // Slide name
      let name
      let slide = images[0][0].location // layer 0 location
      if (slide.includes('TCGA')) {
        const str = slide.match(/TCGA-[^%.]+/)[0]
        name = `Slide: ${str}`
      } else {
        const arr = slide.split('/')
        name = `Slide: ${arr[arr.length - 1]}`
      }

      let top = e('div', {'style': 'display: flex'}, [
        e('div', {'style': 'flex: 1'}, [awesome]),
        e('div', {'style': 'flex: 1; text-align: right;'}, [name])
      ])

      let referenceNode = document.querySelector(`#${divId}`)
      referenceNode.before(top)

      awesome.addEventListener('click', () => {
        toggleButton(awesome, 'fa-moon', 'fa-sun')
        toggleButton(awesome, 'moon', 'sun')
        document.body.classList.toggle('theme--dark')
      })

      // CREATE TABLE FOR VIEWERS
      const mainDiv = document.getElementById(divId)
      const table = e('table', {'id': 'myTable'})
      mainDiv.appendChild(table) // TABLE ADDED TO PAGE

      // CREATE ROWS & COLUMNS
      let r
      const num = rows * columns
      let count = 0
      for (r = 0; r < rows; r++) {
        const tr = table.insertRow(r)
        let c
        for (c = 0; c < columns; c++) {
          const td = tr.insertCell(c)
          const osdId = makeId(11) // DIV ID REQUIRED FOR OSD
          // CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
          let idx = count
          count++

          if (numViewers < num && (count - 1 === numViewers)) {
            // we've done our last viewer
            break
          }

          let container = e('div', {'class': 'divSquare'})
          container.style.width = `${width}px`
          td.appendChild(container) // ADD CONTAINER TO CELL

          let htm = ''

          // NAVIGATION TOOLS
          if (numViewers > 1) {
            htm += `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
<input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`
          }

          if (opts && opts.toolbarOn) {
            htm += `<div class="controls showDiv" id="hideTools${idx}"><div id="tools${idx}" class="showHover">`

            // ANNOTATION TOOLS
            htm += '<div class="floated">'

            if (opts && opts.paintbrushColor) {
              htm += `<mark id="mark${idx}">${opts.paintbrushColor}</mark>&nbsp;`
            } else {
              htm += `<mark id="mark${idx}">#00f</mark>&nbsp;`
            }

            htm += `<button id="btnDraw${idx}" class="btn hover-light" title="Draw"><i class="fas fa-pencil-alt"></i></button>&nbsp;
<button id="btnEdit${idx}" class="btn hover-light" title="Edit"><i class="fas fa-draw-polygon"></i></button>&nbsp;
<button id="btnGrid${idx}" class="btn hover-light" title="Grid"><i class="fas fa-border-all"></i></button>&nbsp;
<button id="btnGridMarker${idx}" class="btn hover-light" title="Mark grid"><i class="fas fa-paint-brush"></i></button>&nbsp;
<button id="btnRuler${idx}" class="btn hover-light" title="Measure in microns"><i class="fas fa-ruler"></i></button>&nbsp;
<button id="btnShare${idx}" class="btn hover-light" title="Share this link"><i class="fas fa-share-alt"></i></button>&nbsp;
<button id="btnCam${idx}" class="btn hover-light" title="Snapshot"><i class="fas fa-camera"></i></button>&nbsp;
<button id="btnBlender${idx}" class="btn hover-light" title="Blend-modes"><i class="fas fa-blender"></i></button>&nbsp;
<button id="btnCrosshairs${idx}" class="btn hover-light" title="Crosshairs"><i class="fas fa-crosshairs"></i></button>&nbsp;
<button id="btnSave${idx}" class="btn hover-light" title="Save"><i class="fas fa-save"></i></button>&nbsp;
<div class="mag" style="display: inline">
  <button class="btn hover-light">
  <i class="fas fa-search"></i>
  </button>
  <div class="mag-content">
    <a href="#" data-value="0.025" id="1">1x</a>
    <a href="#" data-value="0.05" id="2">2x</a>
    <a href="#" data-value="0.1" id="4">4x</a>
    <a href="#" data-value="0.2" id="8">8x</a>
    <a href="#" data-value="0.25" id="10">10x</a>
    <a href="#" data-value="0.5" id="20">20x</a>
    <a href="#" data-value="1.0" id="40">40x</a>
  </div>
</div>
<button id="btnMapMarker" class="btn hover-light" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button>
</div>`

            // END
            htm += '</div></div>'
          }

          // CREATE VIEWER
          htm += `<table><tr><td><div id="${osdId}" class="viewer dropzone" style="width: ${width}px; height: ${height}px;"></div>
</td><td id="layersAndColors${idx}" style="vertical-align: top;"></td>
</tr></table>`
          // <td id="layersAndColors${idx}" style="vertical-align: top; display: inline-block"></td>

          // ADD VIEWER & WIDGETS TO CONTAINING DIV
          container.innerHTML = htm

          // DRAW POLYGON COLOR PICKER
          const colorPicker = new CP(document.getElementById(`mark${idx}`))
          colorPicker.on('change', function (r, g, b, a) {
            this.source.value = this.color(r, g, b, a)
            this.source.innerHTML = this.color(r, g, b, a)
            this.source.style.backgroundColor = this.color(r, g, b, a)
          })

          const vInfo = { 'idx': idx, 'osdId': osdId, 'layers': images[idx]}
          // Create MultiViewer object and add to array
          viewers.push(new MultiViewer(vInfo, numViewers, opts))
        }
      }

      return viewers
    }).then(viewers => {
      // PAN/ZOOM CONTROLLER - accepts array of MultiViewers
      synchronizeViewers(viewers)
    })
  })

  // Hot keys
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLocaleLowerCase()
    // esc: means 'Forget what I said I wanted to do!'; 'Clear'.
    if (key === 'escape' || key === 'esc') {
      e.preventDefault()
      // Button-reset
      let buttons = document.getElementsByClassName('btnOn')
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].click()
      }
    }
    // control-r for 'ruler'
    if (e.ctrlKey && key === 'r') {
      e.preventDefault()
      for (let i = 0; i < viewers.length; i++) {
        document.querySelectorAll('[id^="btnRuler"]').forEach(node => {
          node.click()
        })
      }
    }
  })
}
