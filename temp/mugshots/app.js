(function () {
  window.addEventListener('load', function () {
    // Image service Loris
    const imgUrl = 'https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
    // Image service SBU
    // const imgUrl = 'https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs'
    const size = 256
    let viewer, canvas, vpt

    // Fetch image metadata
    fetch(imgUrl + '/info.json')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        createViewer(data)
        createScroller(data)
      })

    // Set up OSD viewer with info that we fetched
    function createViewer (tileSourceIIIF) {
      // Create viewer
      viewer = OpenSeadragon({
        id: 'contentDiv',
        prefixUrl: '//openseadragon.github.io/openseadragon/images/',
        tileSources: [{
          tileSource: tileSourceIIIF
        }]
      })

      // Initialize global variables
      vpt = viewer.viewport

      const overlay = viewer.fabricjsOverlay({
        scale: 1000
      })
      // canvas = this.__canvas = overlay.fabricCanvas()
      canvas = overlay.fabricCanvas()
    }

    // Create thumbnail scroller
    function createScroller (imgData) {
      const length = 1
      // const length = 5
      let ul, li, span

      const fragment = document.createDocumentFragment()
      ul = document.createElement('ul')
      ul.classList.add('thumbnail-list')
      fragment.appendChild(ul)

      // Set up unordered list (thumbnails, css magic)
      for (let j = 0; j < length; j++) {
        li = document.createElement('li')
        ul.appendChild(li)
        span = document.createElement('span')
        // Create thumbnail
        // createThumbnail(imgData, span)
        createThumbnail(imgData, span, 500, 500) // TESTING
        // TODO: Proper scaling conversion
        // createThumbnail(imgData, span, 0, 0)
        // Append thumbnail
        li.appendChild(span)
      }
      document.getElementById('thumbnail-container').appendChild(fragment)
    }

    // Generate location points for random thumbnail
    function getRandomRect (imgData) {
      // Stay within bounds
      const left = Math.floor(Math.random() * (imgData.width / 2)) + 1
      const top = Math.floor(Math.random() * (imgData.height / 2)) + 1
      // Experiment:
      // let left = Math.floor(Math.random() * (imgData.width - size))
      // let top = Math.floor(Math.random() * (imgData.height - size))

      return new OpenSeadragon.Rect(left, top, size, size)
    }

    function createThumbnail (imgData, span, x, y) {
      let rect // it's a rectangle

      // check x, y variables
      if (typeof (x) !== 'undefined' && typeof (y) !== 'undefined' && x >= 0 && y >= 0) {
        rect = new OpenSeadragon.Rect(x, y, size, size) // use the parameters
        console.log('given x,y', rect)
      } else {
        rect = getRandomRect(imgData) // get random
        console.log('random', rect)
      }

      const imgElement = document.createElement('IMG')
      imgElement.alt = 'mugshot'
      imgElement.classList.add('thumbnail-image')

      // Using the iiif service for thumbnail image
      // const parm = '256,'
      // const parm = 'full,'
      imgElement.src = imgUrl + '/' + rect.getTopLeft().x + ',' + rect.getTopLeft().y + ',' + rect.width + ',' + rect.height + '/full/0/default.jpg'
      // imgElement.src = imgUrl + '/' + rect.getTopLeft().x + ',' + rect.getTopLeft().y + ',' + rect.width + ',' + rect.height + '/' + parm + '/0/default.jpg'
      // console.log(imgElement.src)

      // Append thumbnail
      span.appendChild(imgElement)

      // Thumbnail event listener
      imgElement.addEventListener('click', function () {
        showThumbnailOnImage(rect)
      })
    }

    // Show thumbnail's location in image & highlight the location
    function showThumbnailOnImage (rect) {
      console.log('rect', rect)
      zoomToLocation(rect)
      highlightLocation(rect)
    }

    function zoomToLocation (rect) {
      // Get the center, for panTo()
      const center = rect.getCenter()
      // Convert to viewport
      const vptCenter = vpt.imageToViewportCoordinates(center)
      // Pan there and magnify
      vpt.panTo(vptCenter, false) // False ok, default, right?
      vpt.zoomTo(vpt.getMaxZoom())
    }

    // Create rectangle
    function highlightLocation (rect) {
      // 1. Coordinates.  Convert to canvas-ish coordinates, for fabric.js
      const topLeft = vpt.imageToViewerElementCoordinates(rect.getTopLeft()) // fabric.js is canvas coords ?
      // 2. Zoom. We're magnifying by X, so that square gotta be that many times smaller.

      // make bounding box small for hi-res
      const newSize = size / vpt.getMaxZoom()
      // add rectangle onto canvas
      canvas.add(new fabric.Rect({
        left: topLeft.x, // Still too far North?
        top: topLeft.y,
        stroke: 'yellow',
        strokeWidth: 1, // TODO: convert to scale.
        fill: '',
        width: newSize,
        height: newSize
      }))
    }
  })
})()
