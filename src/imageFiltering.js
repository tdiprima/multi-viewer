/**
 * Image filtering
 */
const imageFiltering = function () {
  function filterColors(r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }

  let filters = []
  filters.push(new filterColors(0, 255, 0)) // lime 00ff00
  filters.push(new filterColors(255, 255, 0)) // yellow ffff00
  filters.push(new filterColors(0, 255, 255)) // cyan 00ffff
  filters.push(new filterColors(255, 0, 0)) // red ff0000
  filters.push(new filterColors(255, 165, 0)) // orange ffa500
  filters.push(new filterColors(0, 128, 0)) // dark green 008000
  filters.push(new filterColors(0, 0, 255)) // blue 0000ff
  filters.push(new filterColors(75, 0, 130)) // indigo 4b0082
  filters.push(new filterColors(28, 28, 28)) // dark gray #1c1c1c
  filters.push(new filterColors(167, 226, 46)) // leaf green #a7e22e
  filters.push(new filterColors(31, 120, 180)) // strong blue, #1f78b4
  filters.push(new filterColors(255, 210, 4)) // goldenrod #ffd204

  // EXPERIMENTAL!!!
  OpenSeadragon.Filters.GREYSCALE.prototype.COLORLEVELS = function (some_object) {
    return function (context, callback) {
      const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
      const pxl = imgData.data
      let i
      for (i = 0; i < pxl.length; i += 4) {
        if (pxl[i + 3] === 255) {
          // PRETEND!!!
          var v = (pxl[i] + pxl[i + 1] + pxl[i + 2]) / 3 | 0
          let rgba = levels(v)
          pxl[i] = rgba.r
          pxl[i + 1] = rgba.g
          pxl[i + 2] = rgba.b
          pxl[i + 3] = rgba.a
        } else {
          pxl[i + 3] = 0
        }
      }
      function levels(val) {
        if (val > 0 && val <= 30) {
          return { r: 255, g: 255, b: 255, a: 0 }
        }

        if (val > 30 && val <= 75) {
          return { r: 135, g: 19, b: 172, a: 255 }
        }

        if (val > 75 && val <= 100) {
          return { r: 0, g: 0, b: 255, a: 255 }
        }

        if (val > 100 && val <= 140) {
          return { r: 1, g: 185, b: 245, a: 255 }
        }

        if (val > 140 && val <= 170) {
          return { r: 255, g: 255, b: 0, a: 255 }
        }

        if (val > 170 && val <= 200) {
          return { r: 255, g: 153, b: 0, a: 255 }
        }

        if (val > 200) {
          return { r: 255, g: 0, b: 0, a: 255 }
        }

      }
      context.putImageData(imgData, 0, 0)
      callback()
    }
  }


  return {
    getFilter: function () {
      let filter = {}
      filter = OpenSeadragon.Filters.GREYSCALE
      filter.prototype.COLORIZE = function (color) {
        // console.log('color', color)
        return function (context, callback) {
          // Read the canvas pixels
          const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
          const pixels = imgData.data
          let i
          // Run the filter on them
          for (i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 255) {
              // Alpha channel = 255 ("opaque"): nuclear material here.
              pixels[i] = color.r
              pixels[i + 1] = color.g
              pixels[i + 2] = color.b
              pixels[i + 3] = 255
            } else {
              // No nuclear material: set to transparent.
              pixels[i + 3] = 0
            }
          }
          // Write the result back onto the canvas
          context.putImageData(imgData, 0, 0)
          callback()
        }
      }
      return filter
    },
    getColor: function (num) {
      if (num >= filters.length) {
        // random 0 - N
        return filters[Math.floor(Math.random() * filters.length - 1)]
      } else {
        return filters[num]
      }
    },
    getLength: function () {
      return filters.length
    }
  }
}
