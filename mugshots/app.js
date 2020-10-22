(function () {
  window.addEventListener('load', function () {
    const imgUrl = 'https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
    // const imgUrl = 'https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
    const size = 256
    let viewer, canvas, overlay, vpt

    fetch(imgUrl + '/info.json')
      .then(response => response.json())
      .then(data => {
        console.log(data)
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
        // Give it some number in the middle of the image
        createThumbnail(data, span, Math.round(data.width / 2), Math.round(data.height / 2))
        li.appendChild(span)
      }
      document.getElementById('thumbnail-container').appendChild(fragment)
    }

    function getRandomRect (data) {
      // Give it plenty of room from the edge
      const padding = size * 2 // 512
      const left = getRandomInt(padding, (data.width - padding))
      const top = getRandomInt(padding, (data.height - padding))

      return new OpenSeadragon.Rect(left, top, size, size)
    }

    function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function xyExist (x, y) {
      return (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0)
    }

    function createThumbnail (data, span, x, y) {
      let imageRect // it's a rectangle
      if (xyExist) {
        imageRect = new OpenSeadragon.Rect(x, y, size, size)
      } else {
        imageRect = getRandomRect(data) // get random
      }
      this.__rect = imageRect // DEBUG PURPOSES

      const imgElement = document.createElement('IMG')
      imgElement.alt = 'mugshot'
      imgElement.classList.add('thumbnail-image')

      imgElement.src = getImageSrc(imgUrl, imageRect)

      span.appendChild(imgElement)

      imgElement.addEventListener('click', function () {
        showThumbnailOnImage(imageRect)
      })
    }

    function getImageSrc (imgUrl, imageRect) {
      return imgUrl + '/' +
        imageRect.getTopLeft().x + ',' +
        imageRect.getTopLeft().y + ',' +
        imageRect.width + ',' +
        imageRect.height + '/full/0/default.jpg'
    }

    function showThumbnailOnImage (imageRect) {
      zoomToLocation(imageRect)
      highlightLocation(imageRect)
    }

    function zoomToLocation (imageRect) {
      const center = imageRect.getCenter() // <-- convert to canvas coords here.
      const vptCenter = vpt.imageToViewportCoordinates(center)
      vpt.panTo(vptCenter)
    }

    function highlightLocation (imageRect) {
      const image1 = viewer.world.getItemAt(0)

      const topLeft = imageRect.getTopLeft() // OK.
      const bottomRight = imageRect.getBottomRight()

      const osdRectOfTL = new OpenSeadragon.Point(topLeft.x, topLeft.y)
      const osdRectOfBR = new OpenSeadragon.Point(bottomRight.x, bottomRight.y)

      const imageToWindowCoordinatesTL = image1.imageToWindowCoordinates(osdRectOfTL)
      const imageToWindowCoordinatesBR = image1.imageToWindowCoordinates(osdRectOfBR)

      const width = imageToWindowCoordinatesBR.x - imageToWindowCoordinatesTL.x
      const height = imageToWindowCoordinatesBR.y - imageToWindowCoordinatesTL.y

      const canvasOffset = overlay._canvasdiv.getBoundingClientRect()
      const origin = new OpenSeadragon.Point(0, 0)

      const image1WindowPoint = image1.imageToWindowCoordinates(origin)
      const x = Math.round(image1WindowPoint.x)
      const y = Math.round(image1WindowPoint.y)
      const point = new fabric.Point(canvasOffset.left - x, canvasOffset.top - y)
      const factor = 1 / canvas.getZoom()

      const newRect = new fabric.Rect({
        fill: 'green',
        left: (imageToWindowCoordinatesTL.x + point.x) * factor,
        top: (imageToWindowCoordinatesTL.y + point.y) * factor,
        width: width * factor,
        height: height * factor
      })
      this.__newRect = newRect // DEBUG PURPOSES
      canvas.add(newRect)
      canvas.renderAll()
    }
  })
})()
