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
  filters.push(new filterColors(28,28,28)) // dark gray #1c1c1c
  filters.push(new filterColors(167,226,46)) // leaf green #a7e22e
  filters.push(new filterColors(31, 120, 180)) // strong blue, #1f78b4
  filters.push(new filterColors(255,210,4)) // goldenrod #ffd204

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
        // console.log('here', num)
        // random 0 - N
        return filters[Math.floor(Math.random() * filters.length - 1)]
      } else {
        // console.log(num, filters[num])
        return filters[num]
      }
    },
    getLength: function () {
      return filters.length
    }
  }
}
