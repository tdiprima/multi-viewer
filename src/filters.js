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
    let val
    if (!colorObject.low && !colorObject.high) {
      val = ''
    } else {
      val = id.includes('low') ? colorObject.low.toString() : colorObject.high.toString()
    }

  const numEl = e('input', {
    id: id,
    type: 'number',
    min: '0',
    max: '255',
    step: '1',
    size: '5',
    value: val
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
      // console.log('byProbability')
      for (let j = 0; j < pixels.length; j += 4) {
        if (pixels[j + 3] === 255) {
          const g = pixels[j + 1]
          const rgba = inRange(g, layerColors, colorArr)
          setPix(j, rgba, g)
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

    if (renderType === 'byHeatmap') {
      // blue to red osd-filter routine
      const cmap = [[1, 0, 255], [1, 0, 253], [2, 0, 253], [4, 0, 252], [4, 0, 251], [5, 0, 250], [7, 0, 248], [7, 0, 248], [9, 0, 247], [10, 0, 246], [11, 0, 245], [12, 0, 244], [13, 0, 243], [13, 0, 241], [14, 1, 241], [15, 0, 239], [17, 0, 239], [18, 0, 238], [18, 0, 236], [20, 0, 235], [21, 0, 235], [22, 0, 234], [23, 0, 233], [24, 0, 232], [25, 0, 230], [25, 0, 230], [27, 0, 228], [28, 0, 228], [28, 0, 227], [30, 0, 225], [30, 0, 224], [31, 0, 224], [32, 0, 222], [34, 0, 222], [35, 0, 220], [35, 0, 220], [36, 0, 218], [37, 0, 218], [39, 0, 216], [39, 0, 216], [40, 0, 214], [42, 0, 213], [42, 0, 213], [43, 0, 212], [45, 0, 210], [45, 0, 210], [46, 0, 208], [47, 0, 208], [48, 0, 206], [50, 0, 206], [50, 0, 204], [51, 0, 204], [52, 0, 202], [53, 0, 201], [54, 0, 200], [56, 0, 199], [56, 0, 198], [57, 0, 198], [58, 0, 197], [60, 0, 196], [61, 0, 195], [62, 0, 193], [62, 0, 193], [63, 0, 191], [64, 0, 191], [65, 0, 190], [66, 0, 189], [68, 1, 188], [69, 0, 186], [69, 0, 186], [71, 0, 184], [71, 0, 184], [73, 0, 183], [73, 0, 182], [75, 0, 180], [75, 0, 180], [77, 0, 178], [78, 0, 178], [78, 0, 177], [80, 0, 175], [80, 1, 174], [81, 0, 174], [83, 0, 173], [84, 0, 171], [84, 0, 171], [85, 0, 170], [86, 0, 169], [88, 0, 167], [88, 0, 167], [89, 0, 165], [91, 0, 164], [91, 0, 163], [92, 0, 163], [93, 0, 162], [94, 0, 161], [96, 0, 160], [96, 0, 159], [97, 0, 158], [98, 0, 157], [99, 0, 156], [100, 0, 155], [101, 0, 153], [103, 0, 153], [103, 0, 152], [104, 0, 150], [105, 0, 150], [106, 0, 148], [107, 0, 148], [108, 0, 147], [110, 0, 146], [110, 0, 145], [111, 0, 143], [112, 0, 142], [113, 0, 142], [114, 0, 141], [115, 0, 140], [117, 0, 139], [118, 0, 138], [118, 0, 136], [119, 0, 136], [120, 0, 135], [121, 0, 134], [122, 0, 133], [124, 0, 132], [124, 0, 131], [125, 0, 130], [126, 0, 129], [127, 0, 128], [129, 0, 126], [129, 0, 125], [130, 0, 125], [131, 0, 124], [132, 0, 123], [133, 0, 122], [135, 0, 121], [135, 0, 120], [137, 0, 119], [138, 1, 118], [138, 0, 116], [139, 0, 116], [141, 0, 114], [141, 0, 113], [143, 0, 113], [144, 0, 112], [144, 0, 111], [146, 0, 109], [146, 0, 108], [147, 0, 108], [148, 0, 107], [149, 0, 106], [150, 0, 105], [152, 0, 104], [153, 0, 103], [153, 0, 101], [154, 0, 101], [155, 0, 100], [157, 0, 99], [157, 0, 98], [158, 0, 97], [160, 0, 96], [161, 0, 94], [161, 0, 94], [163, 0, 93], [163, 0, 92], [164, 0, 91], [165, 0, 89], [166, 0, 88], [167, 0, 88], [169, 0, 87], [169, 0, 86], [170, 0, 85], [171, 0, 83], [172, 0, 83], [173, 0, 82], [175, 0, 81], [176, 0, 80], [177, 0, 79], [178, 0, 77], [179, 0, 77], [179, 0, 75], [180, 0, 75], [181, 0, 74], [182, 0, 73], [184, 0, 72], [184, 0, 71], [185, 0, 70], [186, 0, 69], [187, 0, 68], [188, 0, 67], [189, 0, 66], [191, 0, 65], [191, 0, 64], [193, 0, 63], [193, 0, 61], [194, 0, 61], [195, 0, 60], [197, 0, 59], [197, 0, 58], [198, 0, 57], [199, 0, 56], [200, 0, 54], [201, 0, 53], [202, 0, 53], [203, 0, 52], [205, 0, 51], [205, 0, 50], [206, 1, 49], [207, 0, 47], [208, 0, 47], [209, 0, 46], [210, 0, 45], [211, 0, 43], [213, 0, 43], [213, 0, 42], [214, 0, 41], [215, 0, 39], [216, 0, 39], [217, 0, 37], [218, 0, 37], [220, 0, 36], [220, 0, 35], [221, 0, 34], [222, 0, 33], [223, 0, 32], [224, 0, 31], [225, 0, 30], [226, 0, 29], [227, 0, 27], [228, 0, 27], [229, 0, 26], [231, 0, 25], [231, 0, 24], [233, 0, 23], [233, 0, 22], [234, 0, 21], [235, 0, 20], [236, 0, 19], [237, 0, 18], [238, 0, 17], [239, 0, 16], [240, 0, 15], [241, 0, 14], [242, 0, 13], [243, 0, 12], [244, 0, 11], [245, 0, 10], [246, 0, 9], [247, 0, 8], [248, 0, 7], [249, 0, 6], [250, 0, 5], [252, 0, 4], [252, 0, 3], [253, 0, 2], [254, 0, 1], [255, 0, 0]]
      const resampledCmap = cmap.slice(0)
      const ctr = 128
      const diff = 255 - ctr
      for (let i = 0; i < 256; i++) {
        let position = 0
        if (i > ctr) {
          position = Math.min((i - ctr) / diff * 128 + 128, 255) | 0
        } else {
          position = Math.max(0, i / (ctr / 128)) | 0
        }
        resampledCmap[i] = cmap[position]
      }
      const pxl = imgData.data
      for (let i = 0; i < pxl.length; i += 4) {
        if (pxl[i + 3] === 255) {
          let v = (pxl[i + 1]) // green channel
          const c = resampledCmap[v]
          pxl[i] = c[0]
          pxl[i + 1] = c[1]
          pxl[i + 2] = c[2]
          pxl[i + 3] = 255
        } else {
          pxl[i + 3] = 0
        }
      }
    }

    context.putImageData(imgData, 0, 0)
    callback()
  }
}
