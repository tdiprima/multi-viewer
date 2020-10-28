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
// I want that webCenterPt to be the webCenterPt of this box that I'm gonna draw
// What's the size of the box?
let size = size1 / 2 // webCenterPt
// So that means shift upper-left of box by 'size' amount
// We're still working in web pixels
x = x - size
y = y - size

// NOW WE NEED IMAGE COORDINATES, x, y, w, h, FOR THAT BOX
let upLeftWeb = new OpenSeadragon.Point(x, y)
let botRightWeb = new OpenSeadragon.Point(x + size, y + size)

// USING POINT FROM PIXEL
// let upLeftVpt = viewer.viewport.pointFromPixel(upLeftWeb)
// let botRightVpt = viewer.viewport.pointFromPixel(botRightWeb)
// let upLeftImg = viewer.viewport.viewportToImageCoordinates(upLeftVpt)
// let botRightImg = viewer.viewport.viewportToImageCoordinates(botRightVpt)

// USING WINDOW TO IMAGE
let upLeftImg = viewer.viewport.windowToImageCoordinates(upLeftWeb)
let botRightImg = viewer.viewport.windowToImageCoordinates(botRightWeb)

let imageRect = {
  x: upLeftImg.x,
  y: upLeftImg.y,
  w: botRightImg.x - upLeftImg.x,
  h: botRightImg.y - upLeftImg.y
}
console.log('imageRect', imageRect)

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

  // Try them both!
  let point = vpt.viewerElementToViewportCoordinates(webCenterPt) // VE

  let point1 = vpt.windowToImageCoordinates(webCenterPt) // WI
  point1 = vpt.imageToViewportCoordinates(point1) // IV

  console.log(point + ' versus ' + point1)

  vpt.panTo(point)
  vpt.zoomTo(vpt.getMaxZoom())

  // GET MUG
  const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
  const mugSize = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  let url = infoUrl + '/' +
    Math.round(imageRect.x) + ',' +
    Math.round(imageRect.y) + ',' +
    Math.round(imageRect.w) + ',' +
    Math.round(imageRect.h) + '/' +
    mugSize + '/' +
    rotation + '/' +
    quality + '.' + format

  console.log(url)

}
