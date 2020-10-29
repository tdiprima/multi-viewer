/*
STARTING WITH WEB COORDINATES
 */

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

// Get center of div
let centerWeb = getCenter(document.getElementById(divId))
// console.log('center', centerWeb)

let size = 24
let topLeftWeb = shiftPoint(centerWeb, size)
console.log('top left', topLeftWeb)
// console.log('size', size)
// let botRightWeb = new OpenSeadragon.Point(x + size, y + size)

// DRAW RECT, ZOOM, and GET MUG
function drawRect() {

  let rect = new fabric.Rect({
    stroke: '#8a00ff',
    strokeWidth: 1,
    fill: '',
    left: topLeftWeb.x,
    top: topLeftWeb.y,
    width: size,
    height: size
  })
  canvas.add(rect)
  canvas.renderAll()

  // CONVERT
  // let point = convertToViewport(centerWeb) // Try this.
  let rect1 = new OpenSeadragon.Rect(rect.left, rect.top, rect.width, rect.height) // Try this.
  let vptRect = vpt.viewerElementToViewportRectangle(rect1)
  // PAN, ZOOM
  vpt.panTo(vptRect.getCenter())
  vpt.zoomTo(vpt.getMaxZoom())

  // GET MUG
  let imgRect = vpt.viewportToImageRectangle(vptRect)
  // console.log('get this mug', imgRect)
  
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

  // console.log(url)

}

function getCenter(div) {
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

function getOffset(someElement) {
  const m_getOffset = (element, horizontal = false) => {
    if (!element) return 0;
    return m_getOffset(element.offsetParent, horizontal) + (horizontal ? element.offsetLeft : element.offsetTop);
  }

  let X = m_getOffset(someElement);
  let Y = m_getOffset(someElement, true)

  return new OpenSeadragon.Point(X, Y)
}

function shiftPoint(centerPoint, size) {
  // Half the box
  const size1 = size / 2
  // Shift upper-left of box by 'size' amount
  const x = centerPoint.x - size1
  const y = centerPoint.y - size1
  return new OpenSeadragon.Point(x, y)
}

function convertToViewport(point) {
  return vpt.viewerElementToViewportCoordinates(point)

  // What if we did it like this?
  // let image = vpt.windowToImageCoordinates(point)
  // return vpt.imageToViewportCoordinates(image)

}
