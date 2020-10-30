/*
STARTING WITH IMAGE COORDINATES
 */
let myTiles = 'https://openseadragon.github.io/example-images/duomo/duomo.dzi'
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

let size = 256 // In image coordinates
let topLeft
let bottomRight
let centerPoint
let image1
let rectangle
let small = 15

// DRAW RECT, ZOOM, and GET MUG
function drawRect () {

  // Initializing some variables
  getImageRect()

  // CONVERT
  convertWinCoords()
  convertRectangle()
  convertElemCoords()
  coords()
  coords1()
  // Green, blue, and cyan (ToViewerElement)
  // Red, magenta (ToWindow)
  canvas.renderAll()

  // PAN, ZOOM
  panZoom(vpt.imageToViewportRectangle(rectangle))

  // GET MUG
  // getMug()
}

function getMug () {
  const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
  const mugSize = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  let url = infoUrl + '/' +
    Math.ceil(rectangle.x) + ',' +
    Math.ceil(rectangle.y) + ',' +
    Math.ceil(rectangle.width) + ',' +
    Math.ceil(rectangle.height) + '/' +
    mugSize + '/' +
    rotation + '/' +
    quality + '.' + format

  console.log(url)
}

function panZoom (vptRect) {
  vpt.panTo(vptRect.getCenter())
  vpt.zoomTo(vpt.getMaxZoom())
}

function shiftPoint (centerPoint, size) {
  // Half
  const size1 = size / 2

  // Shift upper-left of by 'size' amount
  const x = centerPoint.x - size1
  const y = centerPoint.y - size1

  // Make sure we have whole numbers
  return new OpenSeadragon.Point(Math.ceil(x), Math.ceil(y))
}

function convertToViewport (point) {
  return vpt.viewerElementToViewportCoordinates(point)
}

function convertWinCoords () {
  // 1 STEP
  let z = vpt.imageToWindowCoordinates(rectangle.getTopLeft())
  canvas.add(new fabric.Rect({
    stroke: '#f00',
    strokeWidth: 1,
    fill: '',
    left: z.x,
    top: z.y,
    width: small,
    height: small
  }))
}

function convertRectangle () {
  // 2 STEPS
  let vptRect = vpt.imageToViewportRectangle(rectangle)
  let webRect = vpt.viewportToViewerElementRectangle(vptRect)

  canvas.add(rect = new fabric.Rect({
    stroke: '#0f0',
    strokeWidth: 1,
    fill: '',
    left: webRect.x,
    top: webRect.y,
    width: webRect.width,
    height: webRect.height
  }))
}

function convertElemCoords () {
  // 1 STEP
  let z = vpt.imageToViewerElementCoordinates(rectangle.getTopLeft())
  canvas.add(new fabric.Rect({
    stroke: '#00f',
    strokeWidth: 1,
    fill: '',
    left: z.x,
    top: z.y,
    width: small,
    height: small
  }))
}

function coords () {
  // 2 STEPS
  let z = vpt.imageToViewportCoordinates(rectangle.getTopLeft())
  let q = vpt.viewportToWindowCoordinates(z)
  canvas.add(new fabric.Rect({
    stroke: '#f0f',
    strokeWidth: 1,
    fill: '',
    left: q.x,
    top: q.y,
    width: small,
    height: small
  }))
}

function coords1 () {
  // 2 STEPS
  let z = vpt.imageToViewportCoordinates(rectangle.getTopLeft())
  let q = vpt.viewportToViewerElementCoordinates(z)
  canvas.add(new fabric.Rect({
    stroke: '#0ff',
    strokeWidth: 1,
    fill: '',
    left: q.x,
    top: q.y,
    width: small,
    height: small
  }))
}

function getImageRect () {
  image1 = viewer.world.getItemAt(0)
  let imgDimensions = image1.source.dimensions

  // Center of image
  centerPoint = getCenter(imgDimensions)

  // Top left of bounding box (for mug)
  // topLeft = shiftPoint(centerPoint, size) // skip
  topLeft = centerPoint
  bottomRight = new OpenSeadragon.Point(topLeft.x + size, topLeft.y + size)
  rectangle = new OpenSeadragon.Rect(topLeft.x, topLeft.y, size, size)
}

function getCenter (dims) {
  // Get centerPoint of image
  let x = dims.x / 2
  let y = dims.y / 2

  return new OpenSeadragon.Point(x, y)
}
