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

// Get center of div
let box = document.getElementById(divId)
let x = box.clientWidth / 2
let y = box.clientHeight / 2
let webCenterPt = new OpenSeadragon.Point(x, y)
console.log('webCenterPt', webCenterPt)

let size1 = 30
// Get center
let size = size1 / 2 // webCenterPt
// Shift upper-left of box by 'size' amount
x = x - size
y = y - size

// NOW WE NEED IMAGE COORDINATES, x, y, w, h, FOR THAT BOX
let upLeftWeb = new OpenSeadragon.Point(x, y)
let botRightWeb = new OpenSeadragon.Point(x + size, y + size)

// DRAW RECT, ZOOM, and GET MUG
function drawRect() {

  let rect = new fabric.Rect({
    stroke: '#8a00ff',
    strokeWidth: 1,
    fill: '',
    left: upLeftWeb.x,
    top: upLeftWeb.y,
    width: size1,
    height: size1
  })
  canvas.add(rect)
  canvas.renderAll()

  // ZOOM

  let point = vpt.viewerElementToViewportCoordinates(webCenterPt) // VE
  vpt.panTo(point)
  vpt.zoomTo(vpt.getMaxZoom())

  // GET MUG
  let rect1 = new OpenSeadragon.Rect(rect.left, rect.top, rect.width, rect.height)
  let vptRect = vpt.viewerElementToViewportRectangle(rect1)
  let imgRect = vpt.viewportToImageRectangle(vptRect)
  console.log('img', imgRect)

  const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
  const mugSize = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  let url = infoUrl + '/' +
    Math.ceil(imgRect.x) + ',' +
    Math.ceil(imgRect.y) + ',' +
    Math.ceil(imgRect.width) + ',' +
    Math.ceil(imgRect.height) + '/' +
    mugSize + '/' +
    rotation + '/' +
    quality + '.' + format

  console.log(url)

}
