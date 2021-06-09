// TODO: layer now has layerNum
let filters = function (viewer, layer, layers, button) {
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

let resetFilter = function (layer, layers, viewer) {
  // One does not simply set the layer that changed:
  // viewer.setFilterOptions({
  //   filters: [{
  //     items: viewer.world.getItemAt(layer.layerNum),
  //     processors: [
  //       colorFilter.prototype.COLORLEVELS(layer.colors) // (The layer should have the updated color values)
  //     ]
  //   }],
  //   loadMode: 'sync'
  // })

  // One needs to set ALL the layers
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

  // layer.colors.sort((a, b) => b.low - a.low) // ORDER BY LOW DESC

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

    const picker = new CP(m)
    picker.on('change', function (r, g, b, a) {
      // set cp widget
      this.source.value = this.color(r, g, b, a)
      this.source.innerHTML = this.color(r, g, b, a)
      this.source.style.backgroundColor = this.color(r, g, b, a)
      // set new color
      c.color = `rgba(${r}, ${g}, ${b}, ${a * 255})` // "color picker" alpha needs to be 1.  "osd" alpha needs to be 255.
      // set filter to new color
      resetFilter(layer, layers, viewer)
    })

    const uniq = makeId(5)

    // LOW
    td = tr.insertCell(-1)
    td.appendChild(createNumericInput(`low${uniq}${cIdx}`, uniq, layer, layers, c, layer.colors, viewer))

    // HIGH
    td = tr.insertCell(-1)
    td.appendChild(createNumericInput(`hi${uniq}${cIdx}`, uniq, layer, layers, c, layer.colors, viewer))

  })
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
function createNumericInput(id, uniq, layer, layers, color, colors, viewer) {
  // console.log('\nlayer', layer)
  // console.log('\nlayers', layers)
  // console.log('\ncolor', color)
  // console.log('\ncolors', colors)
  let x = document.createElement('input')
  x.id = id
  x.setAttribute('type', 'number')
  x.min = '0'
  x.max = '255'
  x.step = '1'
  x.value = id.includes('low') ? color.low.toString() : color.hi.toString()
  x.size = 5

  x.addEventListener('change', function () {
    isIntersect(uniq, colors, colors.length)
  })

  // this event happens whenever the value changes
  x.addEventListener('input', function () {
    let intVal = parseInt(this.value)

    // If they set it to something outside of 0-255, reset it
    if (intVal > 255) this.value = '255'
    if (intVal < 0) this.value = '0'

    if (this.id.startsWith('low')) {
      color[layer.layerNum].low = parseInt(this.value)
    } else {
      color[layer.layerNum].hi = parseInt(this.value)
      resetFilter(layer, layers, viewer)
    }
  })
  return x
}

function isIntersect(uniq, colors, len) {

  for (let i = 0; i < len; i++) {
    // Clear all previous errors
    clearError(document.getElementById('low' + uniq + i), document.getElementById('hi' + uniq + i))
  }

  for (let i = 1; i < len; i++) {
    // Validate
    if (parseInt(colors[i - 1].hi) < parseInt(colors[i].low)) {
      setError(document.getElementById('low' + uniq + i), document.getElementById('hi' + uniq + (i - 1)))
      return true
    }
    if (parseInt(colors[i - 1].low) < parseInt(colors[i].hi)) {
      setError(document.getElementById('low' + uniq + (i - 1)), document.getElementById('hi' + uniq + i))
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
