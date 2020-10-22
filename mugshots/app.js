(function () {
  window.addEventListener('load', function () {
    // Image service Loris
    const imgUrl = 'https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
    // Image service SBU
    // const imgUrl = 'https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'

    const size = 256
    let viewer, canvas, vpt

    fetch(imgUrl + '/info.json')
      .then(response => response.json())
      .then(data => {
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

      const overlay = viewer.fabricjsOverlay({
        scale: 1000
      })
      canvas = overlay.fabricCanvas()
    }

    function createScroller (data) {
      const length = 1
      let ul, li, span

      const fragment = document.createDocumentFragment()
      ul = document.createElement('ul')
      ul.classList.add('thumbnail-list')
      fragment.appendChild(ul)

      for (let j = 0; j < length; j++) {
        li = document.createElement('li')
        ul.appendChild(li)
        span = document.createElement('span')
        // createThumbnail(data, span, 512, 768) // Image coordinates
        // Get somewhere in the middle of the image
        createThumbnail(data, span, Math.round(data.width / 2), Math.round(data.height / 2)) // Image coordinates
        li.appendChild(span)
      }
      document.getElementById('thumbnail-container').appendChild(fragment)
    }

    function getRandomRect (data) {
      const left = Math.floor(Math.random() * (data.width / 2)) + 1
      const top = Math.floor(Math.random() * (data.height / 2)) + 1

      return new OpenSeadragon.Rect(left, top, size, size)
    }

    function xyExist (x, y) {
      return (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0)
    }

    function createThumbnail (data, span, x, y) {
      let rect // it's a rectangle
      if (xyExist) {
        rect = new OpenSeadragon.Rect(x, y, size, size)
      } else {
        rect = getRandomRect(data) // get random
      }
      this.__rect = rect // DEBUG PURPOSES

      const imgElement = document.createElement('IMG')
      imgElement.alt = 'mugshot'
      imgElement.classList.add('thumbnail-image')

      imgElement.src = getImageSrc(imgUrl, rect)

      span.appendChild(imgElement)

      imgElement.addEventListener('click', function () {
        showThumbnailOnImage(rect)
      })
    }

    function convertToImageCoordinates (rect) {
      const webPoint = rect.getTopLeft()

      const viewportPoint = viewer.viewport.pointFromPixel(webPoint)

      let imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint)
      console.log('imagePoint', imagePoint) // That's not image coords

      rect.x = imagePoint.x
      rect.y = imagePoint.y
    }

    function getImageSrc (imgUrl, rect) {
      convertToImageCoordinates(rect)
      console.log('rect', rect)
      return imgUrl + '/' +
        rect.getTopLeft().x + ',' +
        rect.getTopLeft().y + ',' +
        rect.width + ',' +
        rect.height + '/full/0/default.jpg'

    }

    function showThumbnailOnImage (rect) {
      zoomToLocation(rect)
      highlightLocation(rect)
    }

    function zoomToLocation (rect) {
      const center = rect.getCenter()
      const vptCenter = vpt.imageToViewportCoordinates(center)
      vpt.panTo(vptCenter)
      vpt.zoomTo(vpt.getMaxZoom())
    }

    function highlightLocation (rect) {
      const topLeft = rect.getTopLeft() // OK.

      const newSize = size / vpt.getMaxZoom()
      const newRect = new fabric.Rect({
        left: topLeft.x,
        top: topLeft.y,
        stroke: 'yellow',
        strokeWidth: 1,
        fill: '',
        width: newSize,
        height: newSize
      })
      this.__newRect = newRect // DEBUG PURPOSES
      canvas.add(newRect)
    }
  })
})()
