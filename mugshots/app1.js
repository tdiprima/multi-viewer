// STARTING WITH WINDOW COORDINATES
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
let webCenterPt = getCenter(document.getElementById(divId))
console.log('center of div', webCenterPt)

let size = 24
let topLeftWeb = shiftPoint(webCenterPt, size)
console.log('draw rect', topLeftWeb)
console.log('size', size)
// let botRightWeb = new OpenSeadragon.Point(x + size, y + size)

// DRAW RECT, ZOOM, and GET MUG
function drawRect() {

  // TODO: I'm zoomed to the center, but the box is not dead center(?)

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

  // ZOOM

  let point = vpt.viewerElementToViewportCoordinates(webCenterPt) // VE
  vpt.panTo(point)
  vpt.zoomTo(vpt.getMaxZoom())
  console.log('zoom to center', webCenterPt)

  // GET MUG
  let rect1 = new OpenSeadragon.Rect(rect.left, rect.top, rect.width, rect.height)
  let vptRect = vpt.viewerElementToViewportRectangle(rect1)
  let imgRect = vpt.viewportToImageRectangle(vptRect)
  console.log('get this mug', imgRect)

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

function getCenter(div) {
  let x, y
  // 1. Try client width, height
  // x = div.clientWidth / 2
  // y = div.clientHeight / 2

  // 2. Try offsetWidth
  // x = div.offsetWidth / 2
  // y = div.offsetHeight / 2

  x = div.offsetWidth
  y = div.offsetHeight
  console.log(x, y)

  // 3. Try this method
  let offPoint = getOffset(div)
  return new OpenSeadragon.Point((x - offPoint.x) / 2, (y - offPoint.y) / 2)
}

function getOffset(someElement) {
  const m_getOffset = (element, horizontal = false) => {
    if (!element) return 0;
    return m_getOffset(element.offsetParent, horizontal) + (horizontal ? element.offsetLeft : element.offsetTop);
  }

  // calling
  let X = m_getOffset(someElement);
  let Y = m_getOffset(someElement, true);

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
