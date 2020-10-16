(function () {
  window.addEventListener('load', function () {
    // const imgUrl = 'https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
    const imgUrl = 'https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
    const size = 256
    let viewer, canvas, vpt

    fetch(imgUrl + '/info.json')
      .then(response => response.json())
      .then(data => {
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
      const length = 1
      // const length = 5
      let li, span

      const fragment = document.createDocumentFragment()
      const ul = document.createElement('ul')
      ul.classList.add('thumbnail-list')
      fragment.appendChild(ul)

      for (let j = 0; j < length; j++) {
        li = document.createElement('li')
        ul.appendChild(li)
        span = document.createElement('span')
        // createThumbnail(imgData, span)
        createThumbnail(imgData, span, 67584, 52736) // TESTING
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
      console.log('img coord', { x: x, y: y })
      let rect // it's a rectangle
      if (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0) {
        rect = new OpenSeadragon.Rect(x, y, size, size) // use the parameters
      } else {
        rect = getRandomRect(imgData) // get random
      }

      const imgElement = document.createElement('IMG')
      imgElement.alt = 'mugshot'
      imgElement.classList.add('thumbnail-image')

      let parm
      // parm = 'full' // LATER.
      parm = '256,'

      imgElement.src = imgUrl + '/' + rect.getTopLeft().x + ',' + rect.getTopLeft().y + ',' + rect.width + ',' + rect.height + '/' + parm + '/0/default.jpg'
      // console.log(imgElement.src)

      span.appendChild(imgElement)

      imgElement.addEventListener('click', function () {
        showThumbnailOnImage(rect)
      })
    }

    function showThumbnailOnImage (rect) {
      zoomToLocation(rect)
      highlightLocation(rect)
    }

    // This part is correct
    function zoomToLocation (rect) {
      const center = rect.getCenter()
      console.log('Image rect', rect)
      console.log('Image center', center)
      vpt.panTo(vpt.imageToViewportCoordinates(center), false)
      vpt.zoomTo(vpt.getMaxZoom())
    }

    // TODO: This part is not correct
    function highlightLocation (rect) {
      const topLeft = vpt.imageToViewerElementCoordinates(rect.getTopLeft()) // fabric.js is canvas coords ?
      const newSize = size / vpt.getMaxZoom()

      canvas.add(new fabric.Rect({
        left: topLeft.x, // Ends up wayyy too far North.
        top: topLeft.y,
        stroke: 'yellow',
        strokeWidth: 1, // TODO: when it's right, make it 0.1
        fill: '',
        width: newSize,
        height: newSize
      }))
    }
  })
})()
