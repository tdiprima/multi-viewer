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
  let topLeft
  let rectangle

  // eslint-disable-next-line no-undef
  fetch(infoUrl + '/info.json')
    .then(response => response.json())
    .then(data => {
      dims = new OpenSeadragon.Point(data.width, data.height) // eslint-disable-line no-undef
      center = new OpenSeadragon.Point(data.width / 2, data.height / 2) // eslint-disable-line no-undef
      topLeft = center // shiftPoint(center, thumbnailSize) // TODO: Shift top left from center
      console.log('image dims', dims)
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
      createThumbnail(data, span, topLeft.x, topLeft.y) // Center
      // createThumbnail(data, span) // Random
      li.appendChild(span)
    }
    document.getElementById('thumbnail-container').appendChild(fragment)
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

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function xyExist (x, y) {
    return (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0)
  }

  function createThumbnail (data, span, x, y) {
    if (xyExist(x, y)) {
      rectangle = new OpenSeadragon.Rect(x, y, thumbnailSize, thumbnailSize) // eslint-disable-line no-undef
    } else {
      rectangle = randomImageRectangle(data)
    }

    const imgElement = document.createElement('IMG')
    imgElement.alt = 'mugshot'
    imgElement.classList.add('thumbnail-image')

    imgElement.src = getImageUrl(infoUrl, rectangle)

    span.appendChild(imgElement)

    imgElement.addEventListener('click', function () {
      showThumbnailOnImage(rectangle)
    })
  }

  function getImageUrl (infoUrl, rectangle) {
    // IIIF wants whole numbers
    const url = infoUrl + '/' +
      Math.ceil(rectangle.getTopLeft().x) + ',' +
      Math.ceil(rectangle.getTopLeft().y) + ',' +
      Math.ceil(rectangle.width) + ',' +
      Math.ceil(rectangle.height) + '/' +
      size + '/' +
      rotation + '/' +
      quality + '.' + format

    // console.log(url)
    return url
  }

  function showThumbnailOnImage (rectangle) {
    panZoom(vpt, vpt.imageToViewportRectangle(rectangle))
    drawRect(rectangle)
  }

  function drawRect (rectangle) {
    imageToWindow(rectangle)
    viewportToElementR(rectangle)
    canvas.renderAll()
  }

  function imageToWindow (rectangle) {
    // TEST Point => point
    const imageTL = new OpenSeadragon.Point(rectangle.getTopLeft().x, rectangle.getTopLeft().y) // eslint-disable-line no-undef
    const imageBR = new OpenSeadragon.Point(rectangle.getBottomRight().x, rectangle.getBottomRight().y) // eslint-disable-line no-undef
    const windowTL = vpt.imageToWindowCoordinates(imageTL)
    const windowBR = vpt.imageToWindowCoordinates(imageBR)
    // eslint-disable-next-line no-undef
    canvas.add(new fabric.Rect({
      stroke: '#f00',
      fill: '',
      left: windowTL.x,
      top: windowTL.y,
      width: windowBR.x - windowTL.x,
      height: windowBR.y - windowTL.y
    }))
    console.log('to win, R', windowTL.x, windowTL.y)
  }

  function viewportToElementR (rectangle) {
    // TEST Rectangle => rectangle
    const viewerElemRect = vpt.viewportToViewerElementRectangle(vpt.imageToViewportRectangle(rectangle))
    // eslint-disable-next-line no-undef
    canvas.add(new fabric.Rect({
      stroke: '#0f0',
      fill: '',
      left: viewerElemRect.getTopLeft().x,
      top: viewerElemRect.getTopLeft().y,
      width: viewerElemRect.width,
      height: viewerElemRect.height
    }))
    console.log('elem r, G', viewerElemRect.getTopLeft().x, viewerElemRect.getTopLeft().y)
  }

  function randomImageRectangle (data) {
    // Give it plenty of room from the edge
    const padding = thumbnailSize * 2
    const left = getRandomInt(padding, (data.width - padding))
    const top = getRandomInt(padding, (data.height - padding))

    return new OpenSeadragon.Rect(left, top, thumbnailSize, thumbnailSize) // eslint-disable-line no-undef
  }
})
