/*
STARTING WITH WEB COORDINATES
 */
const myTiles = 'https://openseadragon.github.io/example-images/duomo/duomo.dzi'
const divId = 'osd-placeholder'

document.querySelector('button').innerHTML = 'Draw Rectangle'

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

const size = 26 // In web coordinates

// DRAW RECT, ZOOM, and GET MUG
// eslint-disable-next-line no-unused-vars
function drawRect () {
  const div = document.getElementById(divId)
  const centerPoint = getCenter1(div)
  let topLeft = centerPoint // shiftPoint(centerPoint, size) // TODO: Shift top left from center
  let rect = new OpenSeadragon.Rect(topLeft.x, topLeft.y, size, size) // eslint-disable-line no-undef
  draw(rect, 'red')
  console.log('draw1', rect.x, rect.y)

  topLeft = getCenter2(div)
  rect = new OpenSeadragon.Rect(topLeft.x, topLeft.y, size, size) // eslint-disable-line no-undef
  draw(rect, 'green')
  console.log('draw2', rect.x, rect.y)

  topLeft = getCenter3(div)
  rect = new OpenSeadragon.Rect(topLeft.x, topLeft.y, size, size) // eslint-disable-line no-undef
  draw(rect, 'blue')
  console.log('draw3', rect.x, rect.y)

  // CONVERT
  // const point = convertToViewport(centerPoint) // This...
  // eslint-disable-next-line no-undef
  const vptRect = vpt.viewerElementToViewportRectangle(rect)

  // PAN, ZOOM
  panZoom(vptRect)

  // GET MUG
  const rectangle = vpt.viewportToImageRectangle(vptRect)
  getMug(rectangle)
}

// eslint-disable-next-line no-unused-vars
function draw (rect, color) {
  // eslint-disable-next-line no-undef
  canvas.add(new fabric.Rect({
    stroke: color,
    strokeWidth: 1,
    fill: '',
    left: rect.getTopLeft().x,
    top: rect.getTopLeft().y,
    width: rect.width,
    height: rect.height
  }))
  canvas.renderAll()
}

function getMug (rectangle) {
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

function panZoom (vptRect) {
  vpt.panTo(vptRect.getCenter())
  vpt.zoomTo(vpt.getMaxZoom())
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

// eslint-disable-next-line no-unused-vars
function convertToViewport1 (point) {
  // Tried this; didn't help:
  const image = vpt.windowToImageCoordinates(point)
  return vpt.imageToViewportCoordinates(image)
}

// eslint-disable-next-line no-unused-vars
function getCenter1 (div) {
  // 1. Try: Get plain old dimensions of div
  const w = div.clientWidth
  const h = div.clientHeight
  console.log('start1', w, h)

  return new OpenSeadragon.Point(w / 2, h / 2) // eslint-disable-line no-undef
}

// eslint-disable-next-line no-unused-vars
function getCenter2 (div) {
  // 2. Try: Get div with padding
  const w = div.offsetWidth
  const h = div.offsetHeight
  console.log('start2', w, h)

  return new OpenSeadragon.Point(w / 2, h / 2) // eslint-disable-line no-undef
}

// eslint-disable-next-line no-unused-vars
function getCenter3 (div) {
  // 3. Try: Offset with parent element
  const w = div.clientWidth
  const h = div.clientHeight
  const offPoint = getOffset(div)
  const ww = w + offPoint.x
  const hh = h - offPoint.y
  console.log('start3', ww, hh)

  return new OpenSeadragon.Point(ww / 2, hh / 2) // eslint-disable-line no-undef
}

function getOffset (someElement) {
  const mgm = (element, horizontal = false) => {
    if (!element) return 0
    return mgm(element.offsetParent, horizontal) + (horizontal ? element.offsetLeft : element.offsetTop)
  }

  const X = mgm(someElement)
  const Y = mgm(someElement, true)

  return new OpenSeadragon.Point(X, Y) // eslint-disable-line no-undef
}
