(function () {
  window.addEventListener('load', function () {
    // const imgUrl = 'https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
    const imgUrl = 'https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
    const size = 256
    let viewer, canvas, vpt

    fetch(imgUrl + '/info.json')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        createViewer(data)
        createScroller(data)
      })

    function createViewer (tileSourceIIIF) {
      viewer = OpenSeadragon({
        id: 'contentDiv',
        prefixUrl: '//openseadragon.github.io/openseadragon/images/',
        tileSources: [{
          tileSource: tileSourceIIIF
        }]
      })

      vpt = viewer.viewport

      const overlay = viewer.fabricjsOverlay({
        scale: 1000
      })
      canvas = overlay.fabricCanvas()
    }

    function createScroller (imgData) {
      // const length = 1
      const length = 5
      let li, span

      const fragment = document.createDocumentFragment()
      const ul = document.createElement('ul')
      ul.classList.add('thumbnail-list')
      fragment.appendChild(ul)

      for (let j = 0; j < length; j++) {
        li = document.createElement('li')
        ul.appendChild(li)
        span = document.createElement('span')
        createThumbnail(imgData, span)
        // createThumbnail(imgData, span, 500, 500) // TESTING
        li.appendChild(span)
      }
      document.getElementById('thumbnail-container').appendChild(fragment)
    }

    function getRandomRect (imgData) {
      const left = Math.floor(Math.random() * (imgData.width / 2)) + 1
      const top = Math.floor(Math.random() * (imgData.height / 2)) + 1

      return new OpenSeadragon.Rect(left, top, size, size)
    }

    function createThumbnail (imgData, span, x, y) {
      let rect // it's a rectangle

      if (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0) {
        console.log('got x,y')
        // TODO: YOU ARE HERE 500
        rect = new OpenSeadragon.Rect(x, y, size, size) // use them
      } else {
        console.log('random')
        rect = getRandomRect(imgData) // get random
      }

      const imgElement = document.createElement('IMG')
      imgElement.alt = 'mugshot'
      imgElement.classList.add('thumbnail-image')

      imgElement.src = imgUrl + '/' + rect.getTopLeft().x + ',' + rect.getTopLeft().y + ',' + rect.width + ',' + rect.height + '/full/0/default.jpg'

      span.appendChild(imgElement)

      imgElement.addEventListener('click', function () {
        showThumbnailOnImage(rect)
      })
    }

    function showThumbnailOnImage (rect) {
      console.log('rect', rect)
      zoomToLocation(rect)
      highlightLocation(rect)
    }

    function zoomToLocation (rect) {
      const center = rect.getCenter()
      const vptCenter = vpt.imageToViewportCoordinates(center)
      vpt.panTo(vptCenter)
      vpt.zoomTo(vpt.getMaxZoom())
    }

    function getCanvasPosition1 (rect) {
      const topLeft = rect.getTopLeft() // in image coords
      const newPoint = vpt.imageToWindowCoordinates(topLeft) // too far southeast
      console.log('newPoint2', newPoint)

      return newPoint
    }

    function getCanvasPosition (rect) {
      const topLeft = vpt.imageToViewerElementCoordinates(rect.getTopLeft())
      const bottomRight = vpt.imageToViewerElementCoordinates(rect.getBottomRight())
      console.log('rect bounds', rect)
      console.log('topLeft', topLeft)
      console.log('bottomRight', bottomRight)

      return topLeft
    }

    function highlightLocation (rect) {
      const newPoint = getCanvasPosition(rect)

      const newSize = size / vpt.getMaxZoom()

      canvas.add(new fabric.Rect({
        left: newPoint.x,
        top: newPoint.y,
        stroke: 'yellow',
        strokeWidth: 1,
        fill: '',
        width: newSize,
        height: newSize
      }))
    }
  })
})()
