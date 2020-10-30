/*
STARTING WITH IMAGE COORDINATES
 */
const divId = 'osd-placeholder'

// eslint-disable-next-line no-undef
const viewer = OpenSeadragon({
  id: divId,
  prefixUrl: '//openseadragon.github.io/openseadragon/images/',
  showNavigator: true,
  tileSources: [
    myTiles
  ]
})

const vpt = viewer.viewport

const oly = viewer.fabricjsOverlay({
  scale: 1000
})
const canvas = oly.fabricCanvas()

const size = 256 // In image coordinates
let topLeft
let bottomRight // eslint-disable-line no-unused-vars
let centerPoint
let image1
let rectangle
const small = 15

// DRAW RECT, ZOOM, and GET MUG
// eslint-disable-next-line no-unused-vars
function drawRect () {
  // Initializing some variables
  getImageRect()

  // CONVERT
  imageToWindow()
  viewportToElementR()
  imageToElementC()
  viewportToWindow()
  viewportToElementC()
  // Green, blue, and cyan (toViewerElement)
  // Red, magenta (toWindow)
  canvas.renderAll()

  // PAN, ZOOM
  panZoom(vpt, vpt.imageToViewportRectangle(rectangle))

  // GET MUG
  getMug()
}

// eslint-disable-next-line no-unused-vars
function getMug () {
  const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
  const mugSize = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  const url = infoUrl + '/' +
    Math.ceil(rectangle.x) + ',' +
    Math.ceil(rectangle.y) + ',' +
    Math.ceil(rectangle.width) + ',' +
    Math.ceil(rectangle.height) + '/' +
    mugSize + '/' +
    rotation + '/' +
    quality + '.' + format

  console.log(url)
}

// eslint-disable-next-line no-unused-vars
function shiftPoint (centerPoint, size) {
  // Half
  const size1 = size / 2

  // Shift upper-left of by 'size' amount
  const x = centerPoint.x - size1
  const y = centerPoint.y - size1

  // Make sure we have whole numbers
  return new OpenSeadragon.Point(Math.ceil(x), Math.ceil(y)) // eslint-disable-line no-undef
}

// eslint-disable-next-line no-unused-vars
function convertToViewport (point) {
  return vpt.viewerElementToViewportCoordinates(point)
}

function imageToWindow () {
  // 1 STEP
  const point = vpt.imageToWindowCoordinates(rectangle.getTopLeft())
  // eslint-disable-next-line no-undef
  canvas.add(new fabric.Rect({
    stroke: '#f00',
    strokeWidth: 1,
    fill: '',
    left: point.x,
    top: point.y,
    width: small,
    height: small
  }))
  console.log('to win, R', point.x, point.y)
}

function viewportToElementR () {
  // 2 STEPS
  const rect1 = vpt.imageToViewportRectangle(rectangle)
  const rect = vpt.viewportToViewerElementRectangle(rect1)
  // eslint-disable-next-line no-undef
  canvas.add(new fabric.Rect({
    stroke: '#0f0',
    strokeWidth: 1,
    fill: '',
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height
  }))
  console.log('elem r, G', rect.x, rect.y)
}

function imageToElementC () {
  // 1 STEP
  const point = vpt.imageToViewerElementCoordinates(rectangle.getTopLeft())
  // eslint-disable-next-line no-undef
  canvas.add(new fabric.Rect({
    stroke: '#00f',
    strokeWidth: 1,
    fill: '',
    left: point.x,
    top: point.y,
    width: small,
    height: small
  }))
  console.log('elem c, B', point.x, point.y)
}

function viewportToWindow () {
  // 2 STEPS
  const point1 = vpt.imageToViewportCoordinates(rectangle.getTopLeft())
  const point = vpt.viewportToWindowCoordinates(point1)
  // eslint-disable-next-line no-undef
  canvas.add(new fabric.Rect({
    stroke: '#f0f',
    strokeWidth: 1,
    fill: '',
    left: point.x,
    top: point.y,
    width: small,
    height: small
  }))
  console.log('win c, M', point.x, point.y)
}

function viewportToElementC () {
  // 2 STEPS
  const point1 = vpt.imageToViewportCoordinates(rectangle.getTopLeft())
  const point = vpt.viewportToViewerElementCoordinates(point1)
  // eslint-disable-next-line no-undef
  canvas.add(new fabric.Rect({
    stroke: '#0ff',
    strokeWidth: 1,
    fill: '',
    left: point.x,
    top: point.y,
    width: small,
    height: small
  }))
  console.log('elem cc, C', point.x, point.y)
}

function getImageRect () {
  image1 = viewer.world.getItemAt(0)
  const imgDimensions = image1.source.dimensions
  console.log('image dims', imgDimensions)

  // Center of image
  centerPoint = getCenter(imgDimensions)

  // Top left of bounding box (for mug)
  // topLeft = shiftPoint(centerPoint, size) // TODO: Shift top left from center
  topLeft = centerPoint
  bottomRight = new OpenSeadragon.Point(topLeft.x + size, topLeft.y + size) // eslint-disable-line no-undef
  rectangle = new OpenSeadragon.Rect(topLeft.x, topLeft.y, size, size) // eslint-disable-line no-undef
}

function getCenter (dims) {
  // Get centerPoint of image
  const x = dims.x / 2
  const y = dims.y / 2

  return new OpenSeadragon.Point(x, y) // eslint-disable-line no-undef
}
