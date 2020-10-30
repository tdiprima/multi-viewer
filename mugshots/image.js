// THE MAIN APP
document.addEventListener('DOMContentLoaded', function (event) {
  // Image service Loris
  const infoUrl = 'https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
  const divId = 'osd-placeholder'

  // Image service SBU
  // const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'

  // For testing
  document.getElementById('btnDiv').style.display = 'none'

  const thumbnailSize = 256
  // const scrollerLength = 5
  const scrollerLength = 1

  let viewer, canvas, overlay, vpt

  const size = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'
  let dims
  let center
  let upperLeft

  // eslint-disable-next-line no-undef
  fetch(infoUrl + '/info.json')
    .then(response => response.json())
    .then(data => {
      dims = new OpenSeadragon.Point(data.width, data.height) // eslint-disable-line no-undef
      center = new OpenSeadragon.Point(data.width / 2, data.height / 2) // eslint-disable-line no-undef
      upperLeft = center // shiftPoint(center, thumbnailSize) // TODO: Shift top left from center
      console.log('Image dims:', dims)
      console.log('Center:', center)
      console.log('upperLeft:', upperLeft)
      createViewer(data)
      createScroller(data)
    })

  function createViewer (data) {
    // eslint-disable-next-line no-undef
    viewer = OpenSeadragon({
      id: divId,
      prefixUrl: '//openseadragon.github.io/openseadragon/images/',
      tileSources: [{
        tileSource: data
      }]
    })
    vpt = viewer.viewport

    overlay = viewer.fabricjsOverlay({
      scale: 1000
    })
    canvas = this.__canvas = overlay.fabricCanvas()
  }

  function createScroller (data) {
    let ul, li, span

    const fragment = document.createDocumentFragment()
    // eslint-disable-next-line prefer-const
    ul = document.createElement('ul')
    ul.classList.add('thumbnail-list')
    fragment.appendChild(ul)

    for (let j = 0; j < scrollerLength; j++) {
      li = document.createElement('li')
      ul.appendChild(li)
      span = document.createElement('span')
      // Giving it some number in the middle of the image
      createThumbnail(data, span, upperLeft.x, upperLeft.y) // Image coordinates
      // createThumbnail(data, span)
      li.appendChild(span)
    }
    document.getElementById('thumbnail-container').appendChild(fragment)
  }

  function shiftPoint (centerPoint, size) {
    // Half
    const size1 = size / 2

    // Shift upper-left of by 'size' amount
    const x = centerPoint.x - size1
    const y = centerPoint.y - size1

    // Make sure we have whole numbers
    return new OpenSeadragon.Point(Math.ceil(x), Math.ceil(y)) // eslint-disable-line no-undef
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function xyExist (x, y) {
    return (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0)
  }

  function createThumbnail (data, span, x, y) {
    let rectangle // it's a rectangle
    if (xyExist(x, y)) {
      // x,y,w,h
      rectangle = new OpenSeadragon.Rect(x, y, thumbnailSize, thumbnailSize) // eslint-disable-line no-undef
    } else {
      rectangle = randomImageRectangle(data)
    }
    console.log('draw', rectangle.x, rectangle.y)
    checkWholeNumbers(rectangle)

    const imgElement = document.createElement('IMG')
    imgElement.alt = 'mugshot'
    imgElement.classList.add('thumbnail-image')

    imgElement.src = getImageUrl(infoUrl, rectangle)

    span.appendChild(imgElement)

    imgElement.addEventListener('click', function () {
      showThumbnailOnImage(rectangle)
    })
  }

  function checkWholeNumbers (rectangle) {
    // IIIF wants whole numbers
    const imagePoint = rectangle.getTopLeft()
    if (imagePoint.x % 1 !== 0) {
      console.warn(imagePoint.x, 'not a whole number')
    }
    if (imagePoint.y % 1 !== 0) {
      console.warn(imagePoint.y, 'not a whole number')
    }
  }

  function getImageUrl (infoUrl, rectangle) {
    const url = infoUrl + '/' +
      rectangle.getTopLeft().x + ',' +
      rectangle.getTopLeft().y + ',' +
      rectangle.width + ',' +
      rectangle.height + '/' +
      size + '/' +
      rotation + '/' +
      quality + '.' + format

    console.log(url)
    return url
  }

  function showThumbnailOnImage (rectangle) {
    zoomToLocation(rectangle)
    highlightLocation(rectangle)
  }

  function zoomToLocation (rectangle) {
    const vptRect = vpt.imageToViewportRectangle(rectangle)
    // console.log('zoom', vptRect)
    vpt.panTo(vptRect.getCenter())
    vpt.zoomTo(vpt.getMaxZoom())
  }

  function highlightLocation (rectangle) {
    // console.log('rectangle', rectangle)
    // console.log('getTopLeft', rectangle.getTopLeft())
    // console.log('getBottomRight', rectangle.getBottomRight())
    const viewerElemRect = vpt.viewportToViewerElementRectangle(vpt.imageToViewportRectangle(rectangle))
    // console.log('viewer element:', viewerElemRect)

    // TEST Rectangle => rectangle
    // eslint-disable-next-line no-undef
    canvas.add(new fabric.Rect({
      stroke: 'red', // TOO FAR NORTH.
      fill: '',
      left: viewerElemRect.getTopLeft().x,
      top: viewerElemRect.getTopLeft().y,
      width: viewerElemRect.width,
      height: viewerElemRect.height
    }))

    // TEST Point => point
    const imageTL = new OpenSeadragon.Point(rectangle.getTopLeft().x, rectangle.getTopLeft().y) // eslint-disable-line no-undef
    const imageBR = new OpenSeadragon.Point(rectangle.getBottomRight().x, rectangle.getBottomRight().y)  // eslint-disable-line no-undef
    const windowTL = vpt.imageToWindowCoordinates(imageTL)
    const windowBR = vpt.imageToWindowCoordinates(imageBR)
    // console.log('window:', windowTL.x, windowTL.y, windowBR.x - windowTL.x, windowBR.y - windowTL.y)

    // eslint-disable-next-line no-undef
    canvas.add(new fabric.Rect({
      stroke: 'yellow', // A LITTLE NORTH AND FAR EAST.
      fill: '',
      left: windowTL.x,
      top: windowTL.y,
      width: windowBR.x - windowTL.x,
      height: windowBR.y - windowTL.y
    }))
    canvas.renderAll()
  }

  function randomImageRectangle (data) {
    // Give it plenty of room from the edge
    const padding = thumbnailSize * 2
    const left = getRandomInt(padding, (data.width - padding))
    const top = getRandomInt(padding, (data.height - padding))

    return new OpenSeadragon.Rect(left, top, thumbnailSize, thumbnailSize) // eslint-disable-line no-undef
  }
})
