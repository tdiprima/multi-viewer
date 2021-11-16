/**
 * Clicking the color palette icon brings you here.
 * Create a popup div allowing user to adjust color ranges for that layer,
 * or adjust the colors being used to color each class in that layer.
 * There is a color filter at the bottom of this script - this is the workhorse that colors the layer in OSD.
 *
 * @param paletteBtn: dom element
 * @param prefLabel: string
 * @param layerColors: Array
 * @param allLayers: Array
 * @param viewer: OpenSeadragon Viewer
 * @returns {*}
 *
 * Popup Div For Color Levels Naming Convention:
 * markerXXX0 <- 0th row elements
 * lowXXX0 <- 0th row elements
 * hiXXX0 <- 0th row elements
 * iXXX0 <- 0th row elements
 */
const filters = function (paletteBtn, prefLabel, layerColors, allLayers, viewer) {
  const uniqueId = getRandomInt(100, 999)
  const widgetId = `filters${uniqueId}`
  const rect = paletteBtn.getBoundingClientRect()
  let title
  if (renderType === 'byClass') title = `Classifications by color`;
  if (renderType === 'byProbability') title = `${prefLabel} color levels`;
  const div = createDraggableDiv(widgetId, title, rect.left, rect.top)
  const widgetBody = div.lastChild
  createUI(uniqueId, widgetBody, renderType, layerColors, allLayers, viewer)

  return div
}

/*
 ~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
          FOR TESTING - COLOR BY CLASS
 ~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
*/
function renderByClass(uniq, div, layerColors, layers, viewer) {
  const table = e('table')
  div.appendChild(table)
  table.appendChild(createHeaderRow(['Color', 'Label']))

  for (let cIdx = 0; cIdx < layerColors.length; cIdx++) {
    const colorObject = layerColors[cIdx]
    const cpEl = createColorPicker(cIdx, uniq, colorObject, layers, viewer)
    const tr = e('tr', {}, [
      e('td', {}, [cpEl]),
      e('td', {}, [e('span', {}, [
        colorObject.name
      ])])
    ])
    table.appendChild(tr)
  }
}

// Create user interface
function createUI(uniq, div, renderType, layerColors, layers, viewer) {
  if (renderType === 'byClass') {
    renderByClass(uniq, div, layerColors, layers, viewer)
  }

  if (renderType === 'byProbability') {
    const table = e('table')
    div.appendChild(table)

    if (layerColors) {
      // Sort list
      layerColors.sort((a, b) => b.low - a.low)

      table.appendChild(createHeaderRow(['Color', 'Low', 'High']))

      // Create table row for each color rgba and range (low to high)
      // with UI to adjust color, low, high, and a button to add or remove a range.
      layerColors.forEach(function (colorObject, cIdx) {
        const cpEl = createColorPicker(cIdx, uniq, colorObject, layers, viewer)
        const num1 = createNumericInput(`low${uniq}${cIdx}`, table, uniq, layers, colorObject, layerColors, viewer)
        const num2 = createNumericInput(`high${uniq}${cIdx}`, table, uniq, layers, colorObject, layerColors, viewer)
        const buttonId = `i${uniq}${cIdx}`
        const removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})

        const tr = e('tr', {}, [
          e('td', {}, [cpEl]),
          e('td', {}, [num1]),
          e('td', {}, [num2]),
          e('td', {}, [removeBtn])
        ])
        table.appendChild(tr)

        removeBtn.addEventListener('click', removeColor.bind(null, removeBtn, layerColors, tr, layers, viewer), {passive: true})
      })

      table.appendChild(extraRow(uniq, layerColors, layers, viewer))
    }
  }
}

function removeColor(el, ourRanges, tr, layers, viewer) {
  const str = el.id
  const n = str.charAt(str.length - 1)
  // remove from list
  ourRanges.splice(parseInt(n), 1)
  // reflect changes in viewer
  setFilter(layers, viewer)
  tr.remove()
}

// Create sortable header row
function createHeaderRow(tableHeaders) {
  const row = e('tr')

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

// Create color picker input
function createColorPicker(cIdx, uniq, colorObject, layers, viewer) {
  let init = true
  const m = e('mark', {id: `marker${uniq}${cIdx}`})
  const colorCode = colorObject.color
  m.style.backgroundColor = colorCode
  m.innerHTML = `#${rgba2hex(colorCode)}`

  const picker = new CP(m)
  // Set up the event listener
  picker.on('change', function (r, g, b, a) {
    if (init) {
      init = false // Update the state
      return
    }
    // console.log([r, g, b, a])
    this.source.value = this.color(r, g, b, a)
    this.source.innerHTML = this.color(r, g, b, a)
    this.source.style.backgroundColor = this.color(r, g, b, a)
    colorObject.color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
    setFilter(layers, viewer)
  })

  return m
}

// Our colors are in rgba - convert to hex for color picker element
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

// Last stop before "set filter"
function numericEvent(numEl, colorObject, layers, viewer) {
  const intVal = parseInt(numEl.value)

  // If they set it to something outside of 0-255, reset it
  if (intVal > 255) numEl.value = '255'
  if (intVal < 0) numEl.value = '0'

  if (numEl.id.startsWith('low')) colorObject.low = intVal
  if (numEl.id.startsWith('high')) colorObject.high = intVal

  setFilter(layers, viewer)
}

// Create numeric input
function createNumericInput(id, table, uniq, layers, colorObject, colors, viewer) {
  const numEl = e('input', {
    id: id,
    type: 'number',
    min: '0',
    max: '255',
    step: '1',
    size: '5',
    value: id.includes('low') ? colorObject.low.toString() : colorObject.high.toString()
  })
  // Event listeners
  numEl.addEventListener('change', isIntersect.bind(null, table), {passive: true})
  numEl.addEventListener('input', numericEvent.bind(null, numEl, colorObject, layers, viewer), {passive: true})
  return numEl
}

// An interval has low value and high value
// Check to see if any two intervals overlap
function isIntersect(table) {
  const arr = []
  const cells = table.getElementsByTagName('td')
  for (const cell of cells) {
    const elem = cell.children[0]
    if (elem.type === 'number') {
      elem.style.outlineStyle = ''
      elem.style.outlineColor = ''
      if (elem.id.startsWith('low')) {
        arr.push({low: elem, lowVal: parseInt(elem.value)})
      }
      if (elem.id.startsWith('high')) {
        const el = arr[arr.length - 1] // get last array elem
        el.high = elem
        el.highVal = parseInt(elem.value)
      }
    }
  }

  // Sort DESC
  arr.sort((a, b) => {
    return b.lowVal - a.lowVal
  })
  const n = arr.length - 1
  for (let i = 0; i < n; i++) {
    const notZeroes = (arr[i].lowVal !== 0 && arr[i + 1].highVal !== 0)
    // If low <= high of next, then overlap
    if ((arr[i].lowVal <= arr[i + 1].highVal) && notZeroes) {
      setOutlineStyle(arr[i].low, arr[i + 1].high, 'solid', 'red')
      return true
    }
  }

  return false
}

// The outline around the inputs for numbers - red for error, clear for default
function setOutlineStyle(a, b, style, color) {
// For numeric element pair
  if (isRealValue(a)) {
    a.style.outlineStyle = style
    a.style.outlineColor = color
  }
  if (isRealValue(b)) {
    b.style.outlineStyle = style
    b.style.outlineColor = color
  }
}

// The "Add color range" event
function addEvent(num1, num2, cpEl, uniq, tr, colors, layers, viewer) {
  setOutlineStyle(num1, num2, '', '') // clear error
  if (num1.value === '0' && num2.value === '0') {
    setOutlineStyle(num1, num2, 'solid', 'red') // set error
  } else {
    // add to list
    const rgb = cpEl.style.backgroundColor // we get rgb back from CP
    let rgba = rgb.replace('rgb', 'rgba') // we need rgba
    rgba = rgba.replace(')', ', 255)') // give it default alpha
    const blah = num1.id.replace('low', '') // borrowing element id
    const buttonId = `i${blah}`
    const colorObject = {color: rgba, low: parseInt(num1.value), high: parseInt(num2.value)}
    colors.push(colorObject) // add it to our list
    // sort
    colors.sort((a, b) => b.low - a.low)
    // reflect changes in viewer
    setFilter(layers, viewer)

    const removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})
    // Replace + with -
    tr.lastChild.firstChild.remove() // last element in row is modifier
    tr.lastChild.appendChild(removeBtn) // replace old modifier with new one
    removeBtn.addEventListener('click', removeColor.bind(null, colors, cpEl.style.backgroundColor, num1.value, num2.value, tr, layers, viewer), {passive: true})

    // add another empty row
    const table = tr.closest('table')
    table.appendChild(extraRow(uniq, colors, layers, viewer))
  }
}

// Extra row for adding color and range values
function extraRow(uniq, colors, layers, viewer) {
  const idx = colors.length
  const generic = {color: 'rgba(255, 255, 255, 255)', low: 0, high: 0}
  const cpEl = createColorPicker(idx, uniq, generic, layers, viewer)
  const b = document.getElementById(`filters${uniq}Body`)
  const t = b.firstChild
  const num1 = createNumericInput(`low${uniq}${idx}`, t, uniq, layers, generic, colors, viewer)
  const num2 = createNumericInput(`high${uniq}${idx}`, t, uniq, layers, generic, colors, viewer)
  const addBtn = e('i', {id: `i${uniq}${idx}`, class: 'fas fa-plus pointer'})

  const tr = e('tr', {}, [
    e('td', {}, [cpEl]),
    e('td', {}, [num1]),
    e('td', {}, [num2]),
    e('td', {}, [addBtn])
  ])

  addBtn.addEventListener('click', addEvent.bind(null, num1, num2, cpEl, uniq, tr, colors, layers, viewer), {passive: true})

  return tr
}

// Custom color filter
const colorFilter = OpenSeadragon.Filters.GREYSCALE
colorFilter.prototype.COLORLEVELS = function (layerColors) {
  return function (context, callback) {
    const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    const pixels = imgData.data

    const colorArr = layerColors.map(function (element) {
      return colorToArray(element.color) // Save the [r, g, b, a]'s for access later
    })



    function inRange(value, _colors, colorArr) {
      for (let k = 0; k < _colors.length; k++) {
        if (value >= _colors[k].low && value <= _colors[k].high) {
          return colorArr[k] // return color
        }
      }
      return 0
    }

    function inClass(value, _classes, classArr) {
      for (let l = 0; l < _classes.length; l++) {
        if (value === _classes[l].classid) {
          return classArr[l] // return color
        }
      }
      return 0
    }

    // set pixels
    function setPix(idx, model, prob) {
      if (attenuateFlag) {
        model[3] = prob // alpha = prob
      }
      pixels[idx] = model[0]
      pixels[idx + 1] = model[1]
      pixels[idx + 2] = model[2]
      pixels[idx + 3] = model[3]
    }

    if (renderType === 'byClass') {
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 255) {
          const classId = pixels[i] // class
          const prob = pixels[i + 1] // prob
          let rgba = inClass(classId, layerColors, colorArr)
          setPix(i, rgba, prob)
        } else {
          pixels[i + 3] = 0
        }
      }
    }

    if (renderType === 'byProbability') {
      let temp = [
        {
          "color": "rgba(255, 0, 0, 255)",
          "low": 231,
          "high": 255
        },
        {
          "color": "rgba(195, 0, 61, 255)",
          "low": 205,
          "high": 230
        },
        {
          "color": "rgba(163, 0, 93, 255)",
          "low": 179,
          "high": 204
        },
        {
          "color": "rgba(106, 0, 150, 255)",
          "low": 154,
          "high": 178
        },
        {
          "color": "rgba(58, 0, 197, 255)",
          "low": 129,
          "high": 153
        },
        {
          "color": "rgba(0, 0, 255, 255)",
          "low": 0,
          "high": 128
        }
      ]

      const tempArr = temp.map(function (element) {
        return colorToArray(element.color)
      })

      for (let j = 0; j < pixels.length; j += 4) {
        if (pixels[j + 3] === 255) {
          const prob = pixels[j + 1] // prob
          const rgba = inRange(prob, temp, tempArr)
          setPix(j, rgba, prob)
        } else {
          // No nuclear material: set to transparent.
          pixels[j + 3] = 0
        }
      }

      // Temporarily shade it purple
      // for (let j = 0; j < pixels.length; j += 4) {
      //   if (pixels[j + 3] === 255) {
      //     pixels[j] = 65
      //     pixels[j + 1] = 1
      //     pixels[j + 2] = 147
      //   } else {
      //     pixels[j + 3] = 0
      //   }
      // }
    }

    context.putImageData(imgData, 0, 0)
    callback()
  }
}
