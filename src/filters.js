let filters = function (button, layer, layers, viewer) {
  let div
  if (isRealValue(button)) {
    let id = makeId(5, 'filters')
    let rect = button.getBoundingClientRect()
    div = createDraggableDiv(id, 'Color Levels', rect.left, rect.top)
    createWidget(document.getElementById(`${id}Body`), layer, layers, viewer)
  } else {
    console.log('tba')
  }
  return div
}

// SET LAYERS' COLOR FILTER
let setFilter = function (layers, viewer) {
  let itemCount = viewer.world.getItemCount()
  let filterOpts = []
  for (let i = 0; i < itemCount; i++) {
    if (i > 0) {
      filterOpts.push({
        items: viewer.world.getItemAt(i),
        processors: [
          colorFilter.prototype.COLORLEVELS(layers[i].colors)
        ]
      })
    }
  }
  viewer.setFilterOptions({
    filters: filterOpts,
    loadMode: 'sync'
  })
}

// COLOR RANGES UI
let createWidget = function (div, layer, layers, viewer) {
  const table = document.createElement('table')
  div.appendChild(table)

  if (!layer.colors) {
    if (layer.layerNum && layer.layerNum > 0) {
      table.innerHTML = 'None'
      console.warn(`viewer ${viewer.id} layer ${layer.layerNum} colors: ${layer.colors}`)
    }
  } else {
    // Sort intervals in decreasing order of low value
    layer.colors.sort((a, b) => b.low - a.low)

    const uniq = makeId(5) // create it outside of loop
    // Display a row of tools for each layer
    layer.colors.forEach(function (c, cIdx) {
      // calling it 'c' because 'color' is already taken
      let tr = table.insertRow(-1)
      table.appendChild(tr)

      let td = tr.insertCell(-1)
      let colorCode = c.color

      // COLOR PICKER
      let m = document.createElement('mark')
      m.id = makeId(5, 'marker')
      m.innerHTML = "#" + rgba2hex(colorCode)
      m.style.backgroundColor = colorCode
      td.appendChild(m)

      // COLOR PICKER HANDLER
      const picker = new CP(m)
      picker.on('change', function (r, g, b, a) {
        // set cp widget
        this.source.value = this.color(r, g, b, a)
        this.source.innerHTML = this.color(r, g, b, a)
        this.source.style.backgroundColor = this.color(r, g, b, a)
        // set new color
        c.color = `rgba(${r}, ${g}, ${b}, ${a * 255})` // "color picker" alpha needs to be 1.  "osd" alpha needs to be 255.
        // set filter to new color
        setFilter(layers, viewer)
      })

      // LOW
      td = tr.insertCell(-1)
      td.appendChild(createNumericInput(`low${uniq}${cIdx}`, uniq, layers, c, layer.colors, viewer))

      // HIGH
      td = tr.insertCell(-1)
      td.appendChild(createNumericInput(`hi${uniq}${cIdx}`, uniq, layers, c, layer.colors, viewer))

    })
  }

}

function rgba2hex(orig) {
  let a,
    arr = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = (arr && arr[4] || "").trim(),
    hex = arr ?
      (arr[1] | 1 << 8).toString(16).slice(1) +
      (arr[2] | 1 << 8).toString(16).slice(1) +
      (arr[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 0x0;
  }
  a = (a | 1 << 8).toString(16).slice(1)
  hex = hex + a
  return hex
}

// USER INPUTS to set color threshold values
function createNumericInput(id, uniq, layers, color, colors, viewer) {
  let x = document.createElement('input')
  x.id = id
  x.setAttribute('type', 'number')
  x.min = '0'
  x.max = '255'
  x.step = '1'
  x.value = id.includes('low') ? color.low.toString() : color.hi.toString()
  x.size = 5

  x.addEventListener('change', function () {
    isIntersect(uniq, colors.length)
  })

  // this event happens whenever the value changes
  x.addEventListener('input', function () {
    let intVal = parseInt(this.value)

    // If they set it to something outside of 0-255, reset it
    if (intVal > 255) this.value = '255'
    if (intVal < 0) this.value = '0'

    if (this.id.startsWith('low')) {
      color.low = parseInt(this.value)
    } else {
      color.hi = parseInt(this.value)
    }

    setFilter(layers, viewer)
  })
  return x
}

function isIntersect(uniq, len) {

  // Clear all previous errors
  for (let i = 0; i < len; i++) {
    clearError(document.getElementById('low' + uniq + i), document.getElementById('hi' + uniq + i))
  }

  // Validation
  for (let i = 1; i < len; i++) {
    // If low of an interval, is less than the high value of the 'previous' (next) interval, then error
    let low = document.getElementById('low' + uniq + (i - 1))
    let high = document.getElementById('hi' + uniq + i)
    if (parseInt(low.value) < parseInt(high.value)) {
      setError(low, high)
      return true
    }
    // If high ends up being less than its low, then error
    let high1 = document.getElementById('hi' + uniq + (i - 1))
    if (parseInt(high1.value) < parseInt(low.value)) {
      setError(low, high1)
      return true
    }
  }

  // If we reach here, then no overlap
  return false
}

function setError(a, b) {
  a.style.outlineStyle = 'solid'
  a.style.outlineColor = 'red'
  b.style.outlineStyle = 'solid'
  b.style.outlineColor = 'red'
}

function clearError(a, b) {
  a.style.outlineStyle = ''
  a.style.outlineColor = ''
  b.style.outlineStyle = ''
  b.style.outlineColor = ''
}

let colorFilter = OpenSeadragon.Filters.GREYSCALE
colorFilter.prototype.COLORLEVELS = data => (context, callback) => {
  if (context.canvas.width > 0 && context.canvas.height > 0) {
    // Read the canvas pixels
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    if (typeof imgData !== undefined) {
      try {
        const pxl = imgData.data // Uint8ClampedArray
        let j
        for (j = 0; j < pxl.length; j += 4) {
          if (pxl[j + 3] === 255) {
            let rgba = levels(pxl[j], data) // r = g = b
            if (typeof rgba === 'undefined') {
              console.warn('rgba undefined', pxl[j])
            }
            pxl[j] = rgba[0]
            pxl[j + 1] = rgba[1]
            pxl[j + 2] = rgba[2]
            pxl[j + 3] = rgba[3]
          } else {
            // No nuclear material: set to transparent.
            pxl[j + 3] = 0
          }
        }
      } catch (err) {
        console.warn('1:', err.message)
      }

      function levels(value, _colors) {
        try {
          let i
          let retVal
          for (i = 0; i < _colors.length; i++) {
            let low = _colors[i].low
            let hi = _colors[i].hi
            let color = _colors[i].color
            if (value >= low && value <= hi) {
              retVal = parseColor(color)
            }
          }

          if (typeof retVal === 'undefined') {
            return value
          } else {
            return retVal
          }
        } catch (err) {
          console.warn('2:', err.message)
        }
      }

      function parseColor(input) {
        // Input: rgba(r, g, b, a) => Output: [r, g, b, a]
        return input.replace(/[a-z%\s\(\)]/g, '').split(',')
      }

      try {
        context.putImageData(imgData, 0, 0)
        callback()
      } catch (err) {
        console.warn('3:', err.message)
      }

    } else {
      console.warn('imgData undefined')
    }
  } else {
    colorFilter = null
    console.warn('Canvas width and height are 0. Setting filter to null')
  }
}
