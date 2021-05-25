let filters = function (divName, viewer, data, button) {
  let div
  if (isRealValue(button)) {
    let id = makeId(5, 'filters')
    let rect = button.getBoundingClientRect()
    div = createDraggableDiv(id, 'Color Levels', rect.left, rect.top)
    createWidget(document.getElementById(`${id}Body`), viewer, data)
  } else {
    console.log('tba')
  }
  return div
}

let createWidget = function (div, viewer, data) {
  const table = document.createElement('table')
  div.appendChild(table)
  // data.sort((a, b) => b.low - a.low) // ORDER BY LOW DESC
  data.forEach(function (elem, ind) {
    let tr = table.insertRow(-1)
    table.appendChild(tr)

    let td = tr.insertCell(-1)
    let colorCode = elem.color

    // COLOR PICKER
    let m = document.createElement('mark')
    m.id = makeId(5, 'marker')
    m.innerHTML = "#" + rgba2hex(colorCode)
    m.style.backgroundColor = colorCode
    td.appendChild(m)

    const picker = new CP(m)
    picker.on('change', function (r, g, b, a) {
      this.source.value = this.color(r, g, b, a)
      this.source.style.backgroundColor = this.color(r, g, b, a)
      data[ind].color = `rgba(${r}, ${g}, ${b}, ${a * 255})` // "color picker" alpha needs to be 1.  "osd" alpha needs to be 255.
      setViewerFilter(data, viewer)
    })

    // LOW
    td = tr.insertCell(-1)
    td.appendChild(createNumericInput({
      id: makeId(5, 'low'),
      val: data[ind].low
    }, viewer, data))

    // HIGH
    td = tr.insertCell(-1)
    td.appendChild(createNumericInput({
      id: makeId(5, 'hi'),
      val: data[ind].hi
    }, viewer, data))

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

// NUMBER INPUT to let user set threshold values
function createNumericInput({id, val}, viewer, data) {
  let x = document.createElement('input')
  x.id = id
  x.setAttribute('type', 'number')
  x.min = '0'
  x.max = '255'
  x.step = '1'
  x.value = val.toString()
  x.size = 5

  // x.addEventListener('change', function () {
  //   isIntersect(data, data.length)
  // })

  // this event happens whenever the value changes
  x.addEventListener('input', function () {
    let intVal = parseInt(this.value)

    // If they set it to something outside of 0-255, reset it
    if (intVal > 255) this.value = '255'
    if (intVal < 0) this.value = '0'

    if (this.id.startsWith('low')) {
      data[index].low = parseInt(this.value)
    } else {
      data[index].hi = parseInt(this.value)
      setViewerFilter(data, viewer) // triggered by high value input
    }
  })
  return x
}

// TODO: handle the IDs
/*
function isIntersect(arr, n) {
  // Clear any previous errors
  arr.forEach((element, index) => {
    clearError(document.getElementById('low' + index), document.getElementById('hi' + index))
  })
  // Validate
  for (let i = 1; i < n; i++) {
    if (parseInt(arr[i - 1].hi) < parseInt(arr[i].low)) {
      setError(document.getElementById('low' + i), document.getElementById('hi' + (i - 1)))
      return true
    }
    if (parseInt(arr[i - 1].low) < parseInt(arr[i].hi)) {
      setError(document.getElementById('low' + (i - 1)), document.getElementById('hi' + i))
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
 */

function setViewerFilter(cr, viewer) {
  try {
    let itemCount = viewer.world.getItemCount()
    let i
    let filterOpts = []
    for (i = 0; i < itemCount; i++) {
      // if (i > 0) {
        filterOpts.push({
          items: viewer.world.getItemAt(i),
          processors: [
            colorFilter.prototype.COLORLEVELS(cr)
          ]
        })
      // }
    }
    viewer.setFilterOptions({
      filters: filterOpts,
      loadMode: 'sync'
    })

  } catch (err) {
    console.error(`setViewerFilter ${err.message}`)
    console.error('cr:', cr, 'viewer:', viewer)
  }
}

let colorFilter = OpenSeadragon.Filters.GREYSCALE
colorFilter.prototype.COLORLEVELS = data => (context, callback) => {
  if (context.canvas.width > 0 && context.canvas.height > 0) {
    // Read the canvas pixels
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    if (typeof imgData !== undefined) {
      try {
        const pxl = imgData.data
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
