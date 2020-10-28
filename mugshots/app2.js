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
let size = 256 // In image coordinates
let topLeftImg
let botRightImg
let centerImg
let imageRect

// DRAW RECT, ZOOM, and GET MUG
function drawRect() {

  // CONVERT
  // imageToWindowCoordinates
  // imageToViewerElementCoordinates
  let vptRect = vpt.imageToViewportRectangle(imageRect)
  let webRect = vpt.viewportToViewerElementRectangle(vptRect)
  console.log('webRect', webRect)

  let rect = new fabric.Rect({
    stroke: '#8a00ff',
    strokeWidth: 1,
    fill: '',
    left: webRect.x,
    top: webRect.y,
    width: webRect.width,
    height: webRect.height
  })
  canvas.add(rect)
  canvas.renderAll()

  // PAN, ZOOM
  vpt.panTo(vptRect.getCenter())
  vpt.zoomTo(vpt.getMaxZoom())

  // GET MUG

  // This info url is temporary - we have it already.
  const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
  const mugSize = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  let url = infoUrl + '/' +
    Math.ceil(imageRect.x) + ',' +
    Math.ceil(imageRect.y) + ',' +
    Math.ceil(imageRect.width) + ',' +
    Math.ceil(imageRect.height) + '/' +
    mugSize + '/' +
    rotation + '/' +
    quality + '.' + format

  console.log(url)

}

function getImage1() {
  // I already have this data
  image1 = viewer.world.getItemAt(0)
  let imgDimensions = image1.source.dimensions

  // Center of image
  centerImg = getCenter(imgDimensions)

  // Top left of bounding box (for mug)
  topLeftImg = shiftPoint(centerImg, size)
  botRightImg = new OpenSeadragon.Point(topLeftImg.x + size, topLeftImg.y + size)
  imageRect = new OpenSeadragon.Rect(topLeftImg.x, topLeftImg.y, size, size)

}

function getCenter(dims) {
  // Get center of image
  let x = dims.x / 2
  let y = dims.y / 2

  return new OpenSeadragon.Point(x, y)

}

function shiftPoint(centerPoint, size) {
  // Half
  const size1 = size / 2

  // Shift upper-left of by 'size' amount
  const x = centerPoint.x - size1
  const y = centerPoint.y - size1

  // Make sure we have whole numbers
  return new OpenSeadragon.Point(Math.ceil(x), Math.ceil(y))
}

function convertToViewport(point) {
  return vpt.viewerElementToViewportCoordinates(point)
}
