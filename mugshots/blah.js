// Draft 1 of works_duomo
const divId = 'contentDiv'
// myTiles = "https://openseadragon.github.io/example-images/duomo/duomo.dzi"

const viewer = OpenSeadragon({
  id: divId,
  prefixUrl: '//openseadragon.github.io/openseadragon/images/',
  tileSources: myTiles
})

const vpt = viewer.viewport

const oly = viewer.fabricjsOverlay({
  scale: 1000
})
const canvas = oly.fabricCanvas()

let image1
const size = 256 // In image coordinates
let topLeftImg
let botRightImg
let centerImg
let imageRect
const small = 15

function drawRect () {
  // Initializing some variables
  getImageRect()

  // CONVERT
  // convertWinCoords();
  convertRectangle()
  convertElemCoords()
  // coords();
  coords1()
  // Green, blue, and cyan (ToViewerElement)
  // Red, magenta (ToWindow)
  canvas.renderAll()

  // PAN, ZOOM
  panZoom(vpt.imageToViewportRectangle(imageRect))
}

function panZoom (vptRect) {
  vpt.panTo(vptRect.getCenter())
  vpt.zoomTo(vpt.getMaxZoom())
}

// function convertWinCoords() {
//   // 1 STEP
//   let z = vpt.imageToWindowCoordinates(imageRect.getTopLeft());
//   canvas.add(
//     new fabric.Rect({
//       stroke: "#f00",
//       strokeWidth: 1,
//       fill: "",
//       left: z.x,
//       top: z.y,
//       width: small,
//       height: small
//     })
//   );
// }

function convertRectangle () {
  // 2 STEPS
  const vptRect = vpt.imageToViewportRectangle(imageRect)
  const webRect = vpt.viewportToViewerElementRectangle(vptRect)

  canvas.add(
    (rect = new fabric.Rect({
      stroke: '#0f0',
      strokeWidth: 1,
      fill: '',
      left: webRect.x,
      top: webRect.y,
      width: webRect.width,
      height: webRect.height
    }))
  )
}

function convertElemCoords () {
  // 1 STEP
  const z = vpt.imageToViewerElementCoordinates(imageRect.getTopLeft())
  canvas.add(
    new fabric.Rect({
      stroke: '#00f',
      strokeWidth: 1,
      fill: '',
      left: z.x,
      top: z.y,
      width: small,
      height: small
    })
  )
}

// function coords() {
//   // 2 STEPS
//   let z = vpt.imageToViewportCoordinates(imageRect.getTopLeft());
//   let q = vpt.viewportToWindowCoordinates(z);
//   canvas.add(
//     new fabric.Rect({
//       stroke: "#f0f",
//       strokeWidth: 1,
//       fill: "",
//       left: q.x,
//       top: q.y,
//       width: small,
//       height: small
//     })
//   );
// }

function coords1 () {
  // 2 STEPS
  const z = vpt.imageToViewportCoordinates(imageRect.getTopLeft())
  const q = vpt.viewportToViewerElementCoordinates(z)
  canvas.add(
    new fabric.Rect({
      stroke: '#0ff',
      strokeWidth: 1,
      fill: '',
      left: q.x,
      top: q.y,
      width: small,
      height: small
    })
  )
}

function getCenter (dims) {
  // Get center of image
  const x = dims.x / 2
  const y = dims.y / 2

  return new OpenSeadragon.Point(x, y)
}

function getImageRect () {
  image1 = viewer.world.getItemAt(0)
  const imgDimensions = image1.source.dimensions

  // Center of image
  centerImg = getCenter(imgDimensions)

  // Top left of bounding box (for mug)
  // topLeftImg = shiftPoint(centerImg, size) // skip
  topLeftImg = centerImg
  botRightImg = new OpenSeadragon.Point(
    topLeftImg.x + size,
    topLeftImg.y + size
  )
  imageRect = new OpenSeadragon.Rect(topLeftImg.x, topLeftImg.y, size, size)
}
