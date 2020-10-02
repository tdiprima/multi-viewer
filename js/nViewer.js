// Wrapper object for the osd viewers
function nViewer (viewerDivId, sliderElements, options) {
  const idx = viewerDivId.replace('viewer', '')
  let myFilter = {}
  let viewer = {}

  // Checkboxes
  let chkPan = {}
  let chkZoom = {}
  if (numDivs > 1 && options.toolbarOn) {
    chkPan = document.getElementById('chkPan' + idx)
    chkZoom = document.getElementById('chkZoom' + idx)
  }

  setFilter()
  setViewer(viewerDivId)

  this.getViewer = function () {
    return viewer
  }

  this.getChkPan = function () {
    if (typeof chkPan.checked !== 'undefined') {
      return chkPan.checked // user decision
    } else {
      // If 1 div; then, nothing to synchronize.
      return numDivs !== 1
    }
  }

  this.getChkZoom = function () {
    if (typeof chkZoom.checked !== 'undefined') {
      return chkZoom.checked // user decision
    } else {
      return numDivs !== 1
    }
  }

  // The url will return an image for the region specified by the given x, y, and level.
  function getIIIFTileUrl (source, level, x, y) {
    const scale = Math.pow(0.5, source.maxLevel - level)
    const levelWidth = Math.ceil(source.width * scale)
    const levelHeight = Math.ceil(source.height * scale)

    const tileSize = source.getTileWidth(level) // width == height
    let tileSizeWidth
    const tileSizeHeight = tileSizeWidth = Math.ceil(tileSize / scale)

    const ROTATION = '0'
    const quality = 'default.png'

    let region, tileX, tileY, tileW, tileH, size

    if (levelWidth < tileSize && levelHeight < tileSize) {
      size = levelWidth + ','
      region = 'full'
    } else {
      tileX = x * tileSizeWidth
      tileY = y * tileSizeHeight
      tileW = Math.min(tileSizeWidth, source.width - tileX)
      tileH = Math.min(tileSizeHeight, source.height - tileY)
      size = Math.ceil(tileW * scale) + ','
      region = [tileX, tileY, tileW, tileH].join(',')
    }
    return [source['@id'], region, size, ROTATION, quality].join('/')
  }

  // Set viewer's source images
  this.setSources = function (imageArray, opacityArray) {
    imageArray.forEach(function (image, index) {
      // console.log(image)
      // add images to viewer
      viewer.addTiledImage({ tileSource: image, opacity: opacityArray ? opacityArray[index] : 0, x: 0, y: 0 })
    })

    viewer.world.addHandler('add-item', (event) => {
      if (viewer.world.getItemCount() === 2) {
        // colorize layer 2
        viewer.setFilterOptions({
          filters: [{
            items: viewer.world.getItemAt(1),
            processors: [
              myFilter.prototype.COLORIZE(0, 255, 0)
            ]
          }]
        })

        // get image tile
        viewer.world.getItemAt(1).source.getTileUrl = function (level, x, y) {
          return getIIIFTileUrl(this, level, x, y)
        }
      }
    })
  }

  // Initialize viewer
  function setViewer (viewerDivId) {
    // console.log(viewerDivId);

    viewer = OpenSeadragon({
      id: viewerDivId,
      prefixUrl: 'js/vendor/openseadragon/images/',
      showFullPageControl: options.viewerOpts.showFullPageControl,
      showHomeControl: options.viewerOpts.showHomeControl,
      showZoomControl: options.viewerOpts.showZoomControl,
      crossOriginPolicy: 'Anonymous'
    })

    // Markup tools event listeners
    if (options.toolbarOn) {
      markupTools(idx, viewer)
    }

    // Sliders event listeners
    if (options.slidersOn) {
      for (let i = 0; i < sliderElements.length; i++) {
        sliderElements[i].addEventListener('input', function () {
          if (viewer.world.getItemAt(i) !== undefined) {
            viewer.world.getItemAt(i).setOpacity(sliderElements[i].value / 100)
          } else {
            sliderElements[i].hidden = true
          }
        })
      }
    }

    // Filtering
    if (options.filterOn) {
      viewer.setFilterOptions({
        filters: [{
          items: viewer.world.getItemAt(1),
          processors: [
            myFilter.prototype.COLORIZE(0, 255, 0)
          ]
        }]
      })
    }
  }

  function setFilter () {
    myFilter = OpenSeadragon.Filters.GREYSCALE
    myFilter.prototype.COLORIZE = function (r, g, b) {
      return function (context, callback) {
        const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
        const pixels = imgData.data
        for (let i = 0; i < pixels.length; i += 4) {
          const avg = pixels[i] / 255
          if (pixels[i + 3] === 255) {
            pixels[i] = r * avg
            pixels[i + 1] = g * avg
            pixels[i + 2] = b * avg
            pixels[i + 3] = avg * 255
          } else if (pixels[i] > 0) {
            pixels[i + 3] = 0
          }
        }
        context.putImageData(imgData, 0, 0)
        callback()
      }
    }
  }
}
