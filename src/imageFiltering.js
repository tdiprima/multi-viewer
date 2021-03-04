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
  filters.push(new filterColors(0, 255, 0)) // lime
  filters.push(new filterColors(255, 255, 0)) // yellow
  filters.push(new filterColors(253, 191, 111)) // light orange, #fdbf6f
  filters.push(new filterColors(255, 127, 0)) // orange, #ff7f00
  filters.push(new filterColors(202, 178, 214)) // light violet, #cab2d6
  filters.push(new filterColors(106, 61, 154)) // violet, #6a3d9a
  filters.push(new filterColors(166, 206, 227)) // light blue, #a6cee3
  filters.push(new filterColors(31, 120, 180)) // strong blue, #1f78b4
  filters.push(new filterColors(178, 223, 138)) // light green, #b2df8a
  filters.push(new filterColors(51, 160, 44)) // green, #33a02c
  filters.push(new filterColors(251, 154, 153)) // pink, #fb9a99
  filters.push(new filterColors(255, 255, 153)) // light yellow, #ffff99
  filters.push(new filterColors(177, 89, 40)) // sienna, #b15928

  return {
    getFilter: function () {
      let filter = {}
      filter = OpenSeadragon.Filters.GREYSCALE
      filter.prototype.COLORIZE = function (r, g, b) {
        return function (context, callback) {
          const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
          const pixels = imgData.data
          let i
          for (i = 0; i < pixels.length; i += 4) {
            const avg = pixels[i] / 255
            // If the alpha is set to 255 ("opaque"), the FeatureImage has nuclear material.
            if (pixels[i + 3] === 255) {
              pixels[i] = r * avg
              pixels[i + 1] = g * avg
              pixels[i + 2] = b * avg
              pixels[i + 3] = avg * 255
            } else if (pixels[i] > 0) {
              // If no nuclear material, set to 0 ("transparent").
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
