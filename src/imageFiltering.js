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
  filters.push(new filterColors(0, 255, 0)) // lime #00ff00
  filters.push(new filterColors(255, 255, 0)) // yellow #ffff00
  filters.push(new filterColors(28,28,28)) // dark gray #1c1c1c
  filters.push(new filterColors(251,38,8)) // bright red/orange #fb2608
  filters.push(new filterColors(255,121,30)) // orange #ff791e
  filters.push(new filterColors(167,226,46)) // leaf green #a7e22e
  filters.push(new filterColors(102,217,238)) // light blue #66d9ee
  filters.push(new filterColors(31, 120, 180)) // strong blue, #1f78b4
  filters.push(new filterColors(255,210,4)) // goldenrod #ffd204
  filters.push(new filterColors(0, 190, 184)) // teal #00beb8
  filters.push(new filterColors(51, 160, 44)) // green, #33a02c

  return {
    getFilter: function () {
      let filter = {}
      filter = OpenSeadragon.Filters.GREYSCALE
      filter.prototype.COLORIZE = function (color) {
        return function (context, callback) {
          const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
          const pixels = imgData.data
          let i
          for (i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 255) {
              // Alpha channel = 255 ("opaque"): nuclear material here.
              pixels[i] = color.r
              pixels[i + 1] = color.g
              pixels[i + 2] = color.b
              pixels[i + 3] = 255
            } else {
              // Set to transparent.
              pixels[i + 3] = 0
            }
          }
          context.putImageData(imgData, 0, 0)
          callback()
        }
      }
      return filter
    },
    getColor: function (num) {
      if (num === 0 || num >= filters.length) {
        // random 0 - N
        return filters[Math.floor(Math.random() * filters.length - 1)]
      } else {
        return filters[num]
      }
    }
  }
}
