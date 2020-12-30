// SmallViewer - superclass
// x,y: location of shape's bounding rectangle
function SmallViewer (viewerDivId) {
  this.viewer = {}
  this.filter = {}
  this.setFilter()
  this.setViewer(viewerDivId)
}

// Superclass method
SmallViewer.prototype.setFilter = function () {
  this.filter = OpenSeadragon.Filters.GREYSCALE
  this.filter.prototype.COLORIZE = function (r, g, b) {
    return function (context, callback) {
      const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
      const pixels = imgData.data
      let i
      for (i = 0; i < pixels.length; i += 4) {
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

SmallViewer.prototype.setViewer = function (viewerDivId) {
  this.viewer = OpenSeadragon({
    id: viewerDivId,
    prefixUrl: 'vendor/openseadragon/images/',
    crossOriginPolicy: 'Anonymous'
  })
}

SmallViewer.prototype.dataCheck = function (url, jqXHR) {
  const message = 'ImageViewer.js: Url for the viewer isn\'t good... please check.'
  console.warn(message)
  console.log('jqXHR object:', jqXHR)
  console.log('URL', url)
  // uglify X template literal
  // document.write(`<h1>${message}</h1><b>URL:</b>&nbsp;${url}<br><br><b>Check the console for any clues.`)
  document.write('<h1>' + message + '</h1><b>URL:</b>&nbsp;' + url + '<br><br><b>Check the console for any clues.')
  throw new Error('Something went wrong.') // Terminates the script.
}

SmallViewer.prototype.getIIIFTileUrl = function (source, level, x, y) {
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

SmallViewer.prototype.getViewer = function () {
  return this.viewer
}

SmallViewer.prototype.setSources = function (imageArray, opacityArray) {
  // Quick check url
  $.get(imageArray[0]).done(function () {
    imageArray.forEach(function (image, index) {
      viewer.addTiledImage({ tileSource: image, opacity: opacityArray ? opacityArray[index] : 0, x: 0, y: 0 })
    })
  }).fail(function (jqXHR, statusText) {
    const url = imageArray[0]
    this.dataCheck(url, jqXHR, statusText)
  })

  this.viewer.world.addHandler('add-item', function (event) {
    if (this.getItemCount() === 2) {
      console.log(this.parent())
      this.viewer.setFilterOptions({
        filters: [{
          items: this.getItemAt(1),
          processors: [
            this.filter.prototype.COLORIZE(0, 255, 0)
          ]
        }]
      })

      this.getItemAt(1).source.getTileUrl = function (level, x, y) {
        return this.getIIIFTileUrl(this, level, x, y)
      }
    }
  })
}
