/**
 * @param divId = where you want to put these viewers
 * @param image = what's the base image
 * @param rois = array of rois (assume we're highlighting 1 per image)
 * @param rows = how many rows of viewers
 * @param columns = how many columns
 * @param width = width of viewers
 * @param height = height of viewers
 */
const roiAlchemy = function (divId, image, rois, rows, columns, width, height) {
  // BUILD TABLE
  const div = document.getElementById(divId)
  const element = document.createElement('table')
  element.id = 'myTable'
  // rows * columns had better equal rois.length!
  let r
  let idArray = []
  for (r = 0; r < rows; r++) {
    const x = element.insertRow(r)
    let c
    for (c = 0; c < columns; c++) {
      const y = x.insertCell(c)
      const id = makeId(11) // DIV ID REQUIRED FOR OSD
      idArray.push(id)
      y.innerHTML = `<div id="${id}" style="width: ${width}px; height: ${height}px">`
    }
  }
  div.appendChild(element)
  // NOW WE CAN INSERT OUR VIEWERS
  let i
  for (i = 0; i < idArray.length; i++) {
    // CREATE OSD VIEWER INSIDE CELL
    const viewer = OpenSeadragon({
      id: idArray[i],
      tileSources: image,
      prefixUrl: 'vendor/openseadragon/images/',
      crossOriginPolicy: 'Anonymous'
    })
    viewer.addHandler('open', function () {
      // PARSE URIs, CREATE OSD RECT
      // rois[i]
      const rect = new OpenSeadragon.Rect(0.2, 0.2, 0.2, 0.2)
      const elt = document.createElement('div')
      elt.id = 'runtime-overlay'
      elt.style.background = 'black'
      viewer.addOverlay({
        element: elt,
        location: rect
      })
      setTimeout(function () {
        viewer.viewport.fitBounds(rect)
      }, 1000)
    })
  }
}

function makeId(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let i
  for (i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
