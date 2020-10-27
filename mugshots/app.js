document.addEventListener('DOMContentLoaded', function (event) {
  // Image service Loris
  // const infoUrl = 'https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
  // Image service SBU
  const infoUrl = window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'

  const thumbnailSize = 256
  // const scrollerLength = 5
  const scrollerLength = 1

  let viewer, canvas, overlay, vpt

  const size = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  fetch(infoUrl + '/info.json')
    .then(response => response.json())
    .then(data => {
      console.log('Image w,h:', data.width, data.height)
      createViewer(data)
      createScroller(data)
    })

  function createViewer (data) {
    viewer = OpenSeadragon({
      id: 'contentDiv',
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
    ul = document.createElement('ul')
    ul.classList.add('thumbnail-list')
    fragment.appendChild(ul)

    for (let j = 0; j < scrollerLength; j++) {
      li = document.createElement('li')
      ul.appendChild(li)
      span = document.createElement('span')
      // Giving it some number in the middle of the image
      console.log('Target (upper-left):', Math.round(data.width / 2), Math.round(data.height / 2))
      createThumbnail(data, span, Math.round(data.width / 2), Math.round(data.height / 2)) // Image coordinates
      // createThumbnail(data, span)
      li.appendChild(span)
    }
    document.getElementById('thumbnail-container').appendChild(fragment)
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function xyExist (x, y) {
    return (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0)
  }

  function createThumbnail (data, span, x, y) {
    let imageRect // it's a rectangle
    if (xyExist(x, y)) {
      // x,y,w,h
      imageRect = new OpenSeadragon.Rect(x, y, thumbnailSize, thumbnailSize)
    } else {
      imageRect = randomImageRectangle(data)
    }
    checkWholeNumbers(imageRect)

    const imgElement = document.createElement('IMG')
    imgElement.alt = 'mugshot'
    imgElement.classList.add('thumbnail-image')

    imgElement.src = getImageUrl(infoUrl, imageRect)

    span.appendChild(imgElement)

    imgElement.addEventListener('click', function () {
      showThumbnailOnImage(imageRect)
    })
  }

  function checkWholeNumbers (imageRect) {
    // IIIF wants whole numbers
    const imagePoint = imageRect.getTopLeft()
    if (imagePoint.x % 1 !== 0) {
      console.warn(imagePoint.x, 'not a whole number')
    }
    if (imagePoint.y % 1 !== 0) {
      console.warn(imagePoint.y, 'not a whole number')
    }
  }

  function getImageUrl (infoUrl, imageRect) {
    console.log('iiif req', imageRect.getTopLeft().x, imageRect.getTopLeft().y, imageRect.width, imageRect.height)
    return infoUrl + '/' +
      imageRect.getTopLeft().x + ',' +
      imageRect.getTopLeft().y + ',' +
      imageRect.width + ',' +
      imageRect.height + '/' +
      size + '/' +
      rotation + '/' +
      quality + '.' + format
  }

  function showThumbnailOnImage (imageRect) {
    zoomToLocation(imageRect)
    highlightLocation(imageRect)
  }

  function zoomToLocation (imageRect) {
    const vptRect = vpt.imageToViewportRectangle(imageRect)
    vpt.panTo(vptRect.getCenter())
    vpt.zoomTo(vpt.getMaxZoom())
  }

  function highlightLocation (imageRect) {
    // Translate coordinates => image to viewport coordinates.
    // TODO: Needs to be more y, less x. But we're using OpenSeadragon's coordinate translation!
    // TODO: Test in other browsers
    const imageTL = new OpenSeadragon.Point(imageRect.getTopLeft().x, imageRect.getTopLeft().y)
    const imageBR = new OpenSeadragon.Point(imageRect.getBottomRight().x, imageRect.getBottomRight().y)
    console.log('Image coords:', imageRect.getTopLeft().x, imageRect.getTopLeft().y, imageRect.width, imageRect.height)

    // TRY THIS:
    const vptRect = vpt.imageToViewportRectangle(imageRect)
    const VER = vpt.viewportToViewerElementRectangle(vptRect)
    console.log('viewport rectangle coords:', VER.getTopLeft().x, VER.getTopLeft().y, VER.width, VER.height)

    canvas.add(new fabric.Rect({
      stroke: 'red', // TOO FAR NORTH.
      fill: '',
      left: VER.getTopLeft().x,
      top: VER.getTopLeft().y,
      width: VER.width,
      height: VER.height
    }))

    // TRY THIS:
    const windowTL = vpt.imageToWindowCoordinates(imageTL)
    const windowBR = vpt.imageToWindowCoordinates(imageBR)
    console.log('viewport point coordinates', windowTL.x, windowTL.y, windowBR.x - windowTL.x, windowBR.y - windowTL.y)

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
    const padding = thumbnailSize * 2 // 512
    const left = getRandomInt(padding, (data.width - padding))
    const top = getRandomInt(padding, (data.height - padding))

    return new OpenSeadragon.Rect(left, top, thumbnailSize, thumbnailSize)
  }
})
