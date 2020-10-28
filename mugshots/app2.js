// STARTING WITH IMAGE COORDINATES
// let myTiles = 'https://openseadragon.github.io/example-images/duomo/duomo.dzi'

let divId = 'osd-placeholder'

let viewer = OpenSeadragon({
  id: divId,
  prefixUrl: '//openseadragon.github.io/openseadragon/images/',
  showNavigator: true,
  tileSources: [
    myTiles
  ]
})

let vpt = viewer.viewport

let oly = viewer.fabricjsOverlay({
  scale: 1000
})
let canvas = oly.fabricCanvas()

let image1
// let size1 = 256 // can see from outer space, but we need smaller
let size1 = 128
let imageTL
let imageBR
let center

function getImage1() {
  // I already have this data
  image1 = viewer.world.getItemAt(0)
  let imgDimensions = image1.source.dimensions
  console.log('imgDimensions', imgDimensions)

  // Get center of image
  let x = imgDimensions.x / 2
  let y = imgDimensions.y / 2
  center = new OpenSeadragon.Point(x, y)
  console.log('center', center)

  // Get center
  let size = size1 / 2
  // Shift upper-left of box by 'size' amount
  x = x - size
  y = y - size

  // Just guarantee that we have whole numbers
  imageTL = new OpenSeadragon.Point(Math.ceil(x), Math.ceil(y))
  imageBR = new OpenSeadragon.Point(Math.ceil(x) + size1, Math.ceil(y) + size1)

  console.log('imageTL', imageTL)
  console.log('imageBR', imageBR)

}

// DRAW RECT, ZOOM, and GET MUG
function drawRect() {

  let windowTL = vpt.imageToWindowCoordinates(imageTL)
  let windowBR = vpt.imageToWindowCoordinates(imageBR)
  // let windowTL = vpt.imageToViewerElementCoordinates(imageTL)
  // let windowBR = vpt.imageToViewerElementCoordinates(imageBR)
  console.log('windowTL', windowTL)
  console.log('windowBR', windowBR)

  let rect = new fabric.Rect({
    stroke: '#8a00ff',
    strokeWidth: 1,
    fill: '',
    left: windowTL.x,
    top: windowTL.y,
    width: windowBR.x - windowTL.x,
    height: windowBR.y - windowTL.y
  })
  canvas.add(rect)
  canvas.renderAll()

  // ZOOM

  // let point = vpt.imageToViewportCoordinates(center) // VE
  // vpt.panTo(point)
  // vpt.zoomTo(vpt.getMaxZoom())

  // // GET MUG
  // let rect1 = new OpenSeadragon.Rect(rect.left, rect.top, rect.width, rect.height)
  // let vptRect = vpt.viewerElementToViewportRectangle(rect1)
  // let imgRect = vpt.viewportToImageRectangle(vptRect)
  // console.log('img', imgRect)
  //
  // const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
  // const mugSize = '256,'
  // const rotation = '0'
  // const quality = 'default'
  // const format = 'jpg'
  //
  // let url = infoUrl + '/' +
  //   Math.ceil(imgRect.x) + ',' +
  //   Math.ceil(imgRect.y) + ',' +
  //   Math.ceil(imgRect.width) + ',' +
  //   Math.ceil(imgRect.height) + '/' +
  //   mugSize + '/' +
  //   rotation + '/' +
  //   quality + '.' + format
  //
  // console.log(url)

}
