const filters = function (paletteBtn, layer, layers, viewer) {
  const identifier = getRandomInt(100, 999)
  const id = `filters${identifier}`
  const rect = paletteBtn.getBoundingClientRect()
  const div = createDraggableDiv(id, 'Color Levels', rect.left, rect.top)
  createUI(identifier, div.lastChild, layer, layers, viewer)
  return div
}

// CREATE USER INTERFACE
function createUI(uniq, div, layer, layers, viewer) {
  const table = e('table')
  div.appendChild(table)

  if (!layer.colors) {
    if (layer.layerNum && layer.layerNum > 0) {
      table.innerHTML = 'None'
      console.warn(`viewer ${viewer.id} layer ${layer.layerNum} colors: ${layer.colors}`)
    }
  } else {
    layer.colors.sort((a, b) => b.low - a.low)

    table.appendChild(createHeaderRow())

    layer.colors.forEach(function (colorLowHi, cIdx) {
      let cpEl = createColorPicker(cIdx, uniq, colorLowHi, layers, viewer)
      let num1 = createNumericInput(`low${uniq}${cIdx}`, uniq, layers, colorLowHi, layer.colors, viewer)
      let num2 = createNumericInput(`hi${uniq}${cIdx}`, uniq, layers, colorLowHi, layer.colors, viewer)
      let removeBtn = e('i', {class: 'fas fa-minus pointer'})

      let tr = e('tr', {}, [
        e('td', {}, [cpEl]),
        e('td', {}, [num1]),
        e('td', {}, [num2]),
        e('td', {}, [removeBtn])
      ])
      table.appendChild(tr)

      let modRgb = cpEl.style.backgroundColor
      let modNum1 = num1.value
      let modNum2 = num2.value
      let ourRanges = layer.colors
      removeBtn.addEventListener('click', function () {
        for (let i = 0; i < ourRanges.length; i++) {
          let r = ourRanges[i]
          let a = parseColor(r.color)
          let a1 = [a[0], a[1], a[2]]
          let b = parseColor(modRgb)
          if (arraysEqual(a1, b) && r.low === parseInt(modNum1) && r.hi === parseInt(modNum2)) {
            // that's the one; remove it
            layer.colors.splice(i, 1)
            break
          }
        }
        tr.remove()
      })

    })

    table.appendChild(extraRow(uniq, layer.colors, layers, viewer))
  }
}

// CREATE SORTABLE HEADER ROW
function createHeaderRow() {
  const row = e('tr')
  const tableHeaders = ['Color', 'Low', 'High']

  for (let i = 0; i < tableHeaders.length; i++) {
    const th = e('th', {class: 'pointer'})
    th.innerHTML = tableHeaders[i]
    row.appendChild(th)

    th.addEventListener('click', () => {
      const table = th.closest('table')
      Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
        .forEach(tr => table.appendChild(tr))
    })
  }

  return row
}

const getCellValue = (tr, idx) => {
  const td = tr.children[idx]
  if (td.children[0].type === 'number') {
    return td.children[0].value
  } else {
    return td.innerText || td.textContent
  }
}

const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
)(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx))

// CREATE COLOR PICKER INPUT
function createColorPicker(cIdx, uniq, colorLowHi, layers, viewer) {
  const m = e('mark', {id: `marker${uniq}${cIdx}`})
  let colorCode
  if (colorLowHi !== null) {
    colorCode = colorLowHi.color
  } else {
    colorCode = 'rgba(255, 255, 255, 255)'
  }
  m.innerHTML = `#${rgba2hex(colorCode)}` // hex
  m.style.backgroundColor = colorCode // rgba

  const picker = new CP(m)
  picker.on('change', function (r, g, b, a) {
    this.source.value = this.color(r, g, b, a)
    this.source.innerHTML = this.color(r, g, b, a)
    this.source.style.backgroundColor = this.color(r, g, b, a)
    if (colorLowHi !== null) {
      // alpha value is between 0 and 1
      // convert to 0 to 255 for openseadragon
      colorLowHi.color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
    }
    setFilter(layers, viewer)
  })

  // return e('td', {}, [m])
  return m
}

function rgba2hex(orig) {
  let a
  const arr = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
  const alpha = ((arr && arr[4]) || '').trim()
  let hex = arr
    ? (arr[1] | 1 << 8).toString(16).slice(1) +
    (arr[2] | 1 << 8).toString(16).slice(1) +
    (arr[3] | 1 << 8).toString(16).slice(1)
    : orig

  if (alpha !== '') {
    a = alpha
  } else {
    a = 1
  }
  a = (a | 1 << 8).toString(16).slice(1)
  hex = hex + a
  return hex
}

function setFilter(layers, viewer) {
  const itemCount = viewer.world.getItemCount()
  const filterOpts = []
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

// CREATE NUMERIC INPUT
function createNumericInput(id, uniq, layers, colorLowHi, colors, viewer) {
  let x = e('input', {
    id: id,
    'type': 'number',
    'min': '0',
    'max': '255',
    step: '1',
    value: id.includes('low') ? colorLowHi.low.toString() : colorLowHi.hi.toString(),
    size: 5
  })

  // todo: Validation needs to be revised
  // x.addEventListener('change', function () {
  //   isIntersect(uniq, colors.length)
  // })

  x.addEventListener('input', function () {
    const intVal = parseInt(this.value)

    // If they set it to something outside of 0-255, reset it
    if (intVal > 255) this.value = '255'
    if (intVal < 0) this.value = '0'

    if (this.id.startsWith('low')) {
      colorLowHi.low = intVal
    } else {
      colorLowHi.hi = intVal
    }

    setFilter(layers, viewer)
  })
  return x
}

/*
// todo: needs to be revised
function isIntersect(uniq, len) {
  // Clear all previous errors
  for (let i = 0; i < len; i++) {
    clearError(document.getElementById('low' + uniq + i), document.getElementById('hi' + uniq + i))
  }

  // Validation
  for (let i = 1; i < len; i++) {
    // If low of an interval, is less than the high value of the 'previous' (next) interval, then error
    const low = document.getElementById('low' + uniq + (i - 1))
    const high = document.getElementById('hi' + uniq + i)
    if (parseInt(low.value) < parseInt(high.value)) {
      setError(low, high)
      return true
    }
    // If high ends up being less than its low, then error
    const high1 = document.getElementById('hi' + uniq + (i - 1))
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
 */
function clearError(a, b) {
  a.style.outlineStyle = ''
  a.style.outlineColor = ''
  b.style.outlineStyle = ''
  b.style.outlineColor = ''
}

// EXTRA ROW FOR ADDING COLOR AND RANGE VALUES
function extraRow(uniq, colors, layers, viewer) {
  let idx = colors.length
  let cpEl = createColorPicker(idx, uniq, null, layers, viewer)
  // todo: evt handlers
  let num1 = e('input', {id: `low${uniq}${idx}`, type: 'number', min: '0', max: '255', step: '1', size: '5'})
  let num2 = e('input', {id: `hi${uniq}${idx}`, type: 'number', min: '0', max: '255', step: '1', size: '5'})
  let addBtn = e('i', {class: 'fas fa-plus pointer'})

  let tr = e('tr', {}, [
    e('td', {}, [cpEl]),
    e('td', {}, [num1]),
    e('td', {}, [num2]),
    e('td', {}, [addBtn])
  ])

  addBtn.addEventListener('click', function () {
    clearError(num1, num2)
    if (num1.value === '' || num2.value === '') {
      if (num1.value === '') {
        num1.style.outlineStyle = 'solid'
        num1.style.outlineColor = 'red'
      }
      if (num2.value === '') {
        num2.style.outlineStyle = 'solid'
        num2.style.outlineColor = 'red'
      }
    } else {
      // add to list
      let a = cpEl.style.backgroundColor
      let a1 = a.replace('rgb', 'rgba')
      a1 = a1.replace(')', ', 255)')
      colors.push({'color': a1, 'low': parseInt(num1.value), 'hi': parseInt(num2.value)})
    }

  })
  return tr
}

// CUSTOM FILTER IMPLEMENTATION
let colorFilter = OpenSeadragon.Filters.GREYSCALE
colorFilter.prototype.COLORLEVELS = data => (context, callback) => {
  if (context.canvas.width > 0 && context.canvas.height > 0) {
    // Read the canvas pixels
    const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    if (typeof imgData !== 'undefined') {
      try {
        const pxl = imgData.data // Uint8ClampedArray
        let j
        for (j = 0; j < pxl.length; j += 4) {
          if (pxl[j + 3] === 255) {
            const rgba = levels(pxl[j], data) // r = g = b
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
            const low = _colors[i].low
            const hi = _colors[i].hi
            const color = _colors[i].color
            // console.log('%ccolor', 'color: lime', color)
            if (value >= low && value <= hi) {
              retVal = analizarElColor(color)
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

      function analizarElColor(input) {
        // Input: rgba(r, g, b, a) => Output: [r, g, b, a]
        return input.replace(/[a-z%\s()]/g, '').split(',')
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
