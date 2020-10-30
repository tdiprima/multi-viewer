/*
STARTING WITH WEB COORDINATES
 */
let myTiles = 'https://openseadragon.github.io/example-images/duomo/duomo.dzi'
let divId = 'osd-placeholder'

document.querySelector('button').innerHTML = 'Draw Rectangle'

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

let size = 26 // In web coordinates
let centerPoint = getCenter(document.getElementById(divId))
let topLeft = centerPoint //shiftPoint(centerPoint, size)
let bottomRight = new OpenSeadragon.Point(topLeft.x + size, topLeft.y + size)
let rectangle

// DRAW RECT, ZOOM, and GET MUG
function drawRect () {

  let rect = new fabric.Rect({
    stroke: '#8a00ff',
    strokeWidth: 1,
    fill: '',
    left: topLeft.x,
    top: topLeft.y,
    width: size,
    height: size
  })
  canvas.add(rect)
  canvas.renderAll()

  // CONVERT
  // let point = convertToViewport(centerPoint)
  let rect1 = new OpenSeadragon.Rect(rect.left, rect.top, rect.width, rect.height) // Try this.
  let vptRect = vpt.viewerElementToViewportRectangle(rect1)

  // PAN, ZOOM
  panZoom(vptRect)

  // GET MUG
  rectangle = vpt.viewportToImageRectangle(vptRect)
  // getMug(rectangle)
}

function getMug (rectangle) {
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

function convertToViewport1 (point) {
  // Tried this; didn't help:
  let image = vpt.windowToImageCoordinates(point)
  return vpt.imageToViewportCoordinates(image)
}

function getCenter (div) {
  let w, h
  // 1. Try: Get plain old dimensions of div
  w = div.clientWidth
  h = div.clientHeight
  // console.log('client w,h', w, h)

  // 2. Try: Get div with padding
  // w = div.offsetWidth
  // h = div.offsetHeight
  // // console.log('with padding w,h', w, h)

  // This is what we would return:
  // return new OpenSeadragon.Point(w / 2, h / 2)

  // 3. Try: Offset with parent element
  let offPoint = getOffset(div)
  let ww = w + offPoint.x
  let hh = h - offPoint.y
  // console.log('offset w,h', ww, hh)

  // Using offset, this is what we would return:
  return new OpenSeadragon.Point(ww / 2, hh / 2)
}

function getOffset (someElement) {
  const m_getOffset = (element, horizontal = false) => {
    if (!element) return 0
    return m_getOffset(element.offsetParent, horizontal) + (horizontal ? element.offsetLeft : element.offsetTop)
  }

  let X = m_getOffset(someElement)
  let Y = m_getOffset(someElement, true)

  return new OpenSeadragon.Point(X, Y)
}
