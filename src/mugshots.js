const mugshots = function (options) {
  // Expect options:
  // {
  //   divId: options.divId,
  //   thumbId: options.thumbId,
  //   infoUrl: options.infoUrl,
  //   imgDims: options.imgDims,
  //   thumbnailSize: options.thumbnailSize,
  //   scrollerLength: options.scrollerLength,
  //   viewerIndex: options.viewerIndex,
  //   mugshotArray: options.mugshotArray,
  //   overlay: options.overlay,
  //   viewer: options.viewer
  // }

  const canvas = this.__canvas = options.overlay.fabricCanvas()
  const vpt = options.viewer.viewport

  const size = '256,'
  const rotation = '0'
  const quality = 'default'
  const format = 'jpg'

  createScroller(options.imgDims)

  function createScroller (data) {
    let ul, li, span

    const fragment = document.createDocumentFragment()
    ul = document.createElement('ul')
    ul.classList.add('thumbnail-list')
    fragment.appendChild(ul)

    let j
    for (j = 0; j < options.scrollerLength; j++) {
      li = document.createElement('li')
      ul.appendChild(li)
      span = document.createElement('span')
      // Giving it some number in the middle of the image
      // console.log('Target (upper-left):', Math.round(data.width / 2), Math.round(data.height / 2))
      // createThumbnail(data, span, Math.round(data.width / 2), Math.round(data.height / 2)) // Image coordinates
      createThumbnail(data, span)
      li.appendChild(span)
    }
    document.getElementById(options.thumbId).appendChild(fragment)
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
      imageRect = new OpenSeadragon.Rect(x, y, options.thumbnailSize, options.thumbnailSize)
    } else {
      imageRect = randomImageRectangle(data)
    }
    checkWholeNumbers(imageRect)

    const imgElement = document.createElement('IMG')
    imgElement.alt = 'mugshot'
    imgElement.classList.add('thumbnail-image')

    imgElement.src = getImageUrl(options.infoUrl, imageRect)

    span.appendChild(imgElement)

    // highlightLocation(imageRect)

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
    // console.log('imageRect', imageRect.getTopLeft())
  }

  function getImageUrl (infoUrl, imageRect) {
    // console.log('iiif req', imageRect.getTopLeft().x, imageRect.getTopLeft().y, imageRect.width, imageRect.height)
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
    const vptRect = vpt.imageToViewportRectangle(imageRect)
    const webRect = vpt.viewportToViewerElementRectangle(vptRect)

    canvas.add(
      new fabric.Rect({
        stroke: '#0f0',
        strokeWidth: 1,
        fill: '',
        left: webRect.x,
        top: webRect.y,
        width: webRect.width,
        height: webRect.height
      })
    )

    canvas.renderAll()
  }

  function randomImageRectangle (data) {
    // Give it plenty of room from the edge
    const padding = options.thumbnailSize * 2 // 512
    const left = getRandomInt(padding, (data.width - padding))
    const top = getRandomInt(padding, (data.height - padding))

    return new OpenSeadragon.Rect(left, top, options.thumbnailSize, options.thumbnailSize)
  }
}
