/**
 * Clicking the color palette icon brings you here.
 * Create a popup div allowing user to adjust color ranges for that layer,
 * or adjust the colors being used to color each class in that layer.
 * There is a color filter at the bottom of this script - this is the workhorse that colors the layer in OSD.
 *
 * @param paletteBtn: dom element
 * @param prefLabel: string
 * @param colorscheme:
 * @param viewerLayers: Array
 * @param viewer: OpenSeadragon Viewer
 * @returns {*}
 *
 * Popup Div For Color Levels Naming Convention:
 * markerXXX0 <- 0th row elements
 * lowXXX0 <- 0th row elements
 * hiXXX0 <- 0th row elements
 * iXXX0 <- 0th row elements
 */
const filters = (paletteBtn, prefLabel, colorscheme, viewerLayers, viewer) => {
  colorscheme.colors.map(a => a.checked = true)
  colorscheme.colorspectrum.forEach((element, index) => {
    element.checked = true;
    element.classid = index; // overloading 'classid' (to have 1 checkbox handler)
  })

  const uniqueId = getRandomInt(100, 999)
  const widgetId = `filters${uniqueId}`
  const rect = paletteBtn.getBoundingClientRect()
  const title = `${prefLabel} color levels`
  const div = createDraggableDiv(widgetId, title, rect.left, rect.top)
  const widgetBody = div.lastChild // known

  let divA = e('div', {'id': `divA${uniqueId}`})
  let divB = e('div', {'id': `divB${uniqueId}`})
  let divC = e('div', {'id': `divC${uniqueId}`})
  let msg = 'Color gradient where reddish colors<br>correspond to sureness and<br>bluish colors to unsureness.'
  divC.innerHTML = `<p style="color: #ffffff; background: -webkit-linear-gradient(#FF0000, #0000FF);">${msg}</p>`

  // <select>
  let selectList = createDropdown(uniqueId, [divA, divB, divC], viewerLayers, viewer)
  widgetBody.appendChild(selectList)

  // By class
  divA.style.display = (renderType === 'byClass') ? 'block' : 'none'
  widgetBody.appendChild(divA)
  createUI(1, uniqueId, divA, colorscheme.colors, viewerLayers, viewer)

  // By probability
  divB.style.display = (renderType === 'byProbability') ? 'block' : 'none'
  widgetBody.appendChild(divB)
  createUI(2, uniqueId, divB, colorscheme.colorspectrum, viewerLayers, viewer)

  // By heatmap
  divC.style.display = (renderType === 'byHeatmap') ? 'block' : 'none'
  widgetBody.appendChild(divC)

  return div
}

function checkboxHandler(element, arr, l, v) {
  element.addEventListener('click', () => {
    // look up color by 'classid', set 'checked' to the state of the checkbox
    arr.find(x => x.classid === parseInt(element.value)).checked = element.checked
    setFilter(l, v)
  })
}

function createDropdown(uniqueId, divArr, allLayers, viewer) {
  let selectDiv = e('div', {'style': 'display: block;'})
  let listId = `select${uniqueId}`
  selectDiv.innerHTML = `<label for="${listId}">Color by:</label>&nbsp;`
  // Array of options to be added
  let array = ['Class', 'Probability', 'Blue to Red Heatmap']
  let myList = e('select')
  myList.id = listId
  selectDiv.appendChild(myList)

  // Append the options
  array.forEach((option, i) => {
    const element = document.createElement('option')
    element.setAttribute('value', choix[i])
    element.text = option
    myList.appendChild(element)
  });

  myList.addEventListener('change', function () {
    // set global type
    renderType = myList.options[myList.selectedIndex].value
    // no outline for you
    outlineFlag = false // <-- for now todo

    // Shut all off...
    divArr.forEach(div => {
      div.style.display = 'none'
    })

    // ...and turn one on.
    if (renderType === 'byClass') {
      divArr[0].style.display = 'block'
    } else if (renderType === 'byProbability') {
      divArr[1].style.display = 'block'
    } else {
      // byHeatmap
      divArr[2].style.display = 'block'
    }
    // repaint the screen
    setFilter(allLayers, viewer)
  })

  return selectDiv
}

// Create user interface
function createUI(type, uniq, div, layerColors, layers, viewer) {
  let byProb = type === 2
  const table = e('table')
  div.appendChild(table)

  if (layerColors) {
    if (byProb) {
      // Sort DESC
      layerColors.sort((a, b) => b.low - a.low)
      table.appendChild(createHeaderRow(['', 'Color', 'Low', 'High']))
    } else {
      table.appendChild(createHeaderRow(['', 'Color', 'Label']))
    }

    // Create table row for each color rgba; allow user to adjust color
    layerColors.forEach((colorObject, cIdx) => {
      const chk = e('input', {'type': 'checkbox', 'name': `classes${uniq}`, 'value': colorObject.classid})
      chk.checked = colorObject.checked
      const cpEl = createColorPicker(cIdx, uniq, colorObject, layers, viewer)

      let tr, num1, num2, removeBtn
      if (byProb) {
        // adjust range (low to high)
        num1 = createNumericInput(`low${uniq}${cIdx}`, table, uniq, layers, colorObject, layerColors, viewer)
        num2 = createNumericInput(`high${uniq}${cIdx}`, table, uniq, layers, colorObject, layerColors, viewer)
        const buttonId = `i${uniq}${cIdx}`
        // button to add or remove a range
        removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})

        tr = e('tr', {}, [
          e('td', {}, [chk]),
          e('td', {}, [cpEl]),
          e('td', {}, [num1]),
          e('td', {}, [num2]),
          e('td', {}, [removeBtn])
        ])
      } else {
        tr = e('tr', {}, [
          e('td', {}, [chk]),
          e('td', {}, [cpEl]),
          e('td', {}, [e('span', {}, [
            colorObject.name
          ])])
        ])
      }
      table.appendChild(tr)

      checkboxHandler(chk, layerColors, layers, viewer)

      if (byProb) {
        removeBtn.addEventListener('click', removeColor.bind(null, removeBtn, layerColors, tr, layers, viewer), {passive: true})
      }
    })

    if (byProb) {
      table.appendChild(extraRow(uniq, layerColors, layers, viewer))
    }
  } else {
    console.log(`%clayer colors?`, 'color: #ff6a5a;', layerColors)
  }
}

function removeColor(el, ourRanges, tr, layers, viewer) {
  const str = el.id
  const n = str.charAt(str.length - 1)
  ourRanges.splice(parseInt(n), 1) // remove from list
  tr.remove() // remove table row
  setFilter(layers, viewer) // reflect changes in viewer
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
    // console.log('colorObject', colorObject)
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

  // If they set it to something outside 0-255, reset it
  if (intVal > 255) numEl.value = '255'
  if (intVal < 0) numEl.value = '0'

  if (numEl.id.startsWith('low')) colorObject.low = intVal
  if (numEl.id.startsWith('high')) colorObject.high = intVal

  setFilter(layers, viewer)
}

// Create numeric input
function createNumericInput(m_id, table, uniq, layers, colorObject, colors, viewer) {
  let val
  if (!colorObject.low && !colorObject.high) {
    val = ''
  } else {
    val = m_id.includes('low') ? colorObject.low.toString() : colorObject.high.toString()
  }

  const numEl = e('input', {
    id: m_id,
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

  // Sort before validate
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
function addColor(idx, num1, num2, cpEl, chkEl, uniq, tr, colors, layers, viewer) {
  setOutlineStyle(num1, num2, '', '') // clear any error
  if (num1.value === '0' && num2.value === '0') {
    // indicate 0 and 0 not allowed
    setOutlineStyle(num1, num2, 'solid', 'red')
  } else {
    // Now replace + with - in UI
    const buttonId = `i${num1.id.replace('low', '')}` // borrowing element id
    const removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})
    tr.lastChild.firstChild.remove() // last element in row is modifier
    tr.lastChild.appendChild(removeBtn) // replace old modifier with new one
    removeBtn.addEventListener('click', removeColor.bind(null, removeBtn, colors, tr, layers, viewer), {passive: true})

    chkEl.disabled = false // enable checkbox
    checkboxHandler(chkEl, colors, layers, viewer)

    // add another empty row
    const table = tr.closest('table')
    table.appendChild(extraRow(uniq, colors, layers, viewer))
  }
}

// sequence
function seq(objArray) {
  let arr = objArray.map(a => a.classid)
  arr.sort()
  let [min, max] = [Math.min(...arr), Math.max(...arr)]
  return Array.from(Array(max - min), (v, i) => i + min).filter(i => !arr.includes(i))
}

// Extra row for adding color and range values
function extraRow(uniq, colors, layers, viewer) {
  let idx, nums
  nums = seq(colors)
  if (!nums || isEmpty(nums)) {
    idx = colors.length
  } else {
    idx = Array.isArray(nums) ? nums[0] : nums
  }

  const colorObject = {
    'color': 'rgba(255, 255, 255, 255)',
    'low': 0,
    'high': 0,
    'checked': true,
    'classid': idx // overloading 'classid'
  }
  colors.push(colorObject)

  const chkEl = e('input', {
    'type': 'checkbox', 'name': `classes${uniq}`, 'checked': true,
    'disabled': true, 'value': idx
  })

  const cpEl = createColorPicker(idx, uniq, colorObject, layers, viewer)
  const b = document.getElementById(`filters${uniq}Body`)
  const t = b.firstChild
  const num1 = createNumericInput(`low${uniq}${idx}`, t, uniq, layers, colorObject, colors, viewer)
  const num2 = createNumericInput(`high${uniq}${idx}`, t, uniq, layers, colorObject, colors, viewer)
  const addBtn = e('i', {id: `i${uniq}${idx}`, class: 'fas fa-plus pointer'})

  const tr = e('tr', {}, [
    e('td', {}, [chkEl]),
    e('td', {}, [cpEl]),
    e('td', {}, [num1]),
    e('td', {}, [num2]),
    e('td', {}, [addBtn])
  ])

  addBtn.addEventListener('click', addColor.bind(null, idx, num1, num2, cpEl, chkEl, uniq, tr, colors, layers, viewer), {passive: true})

  return tr
}

// Custom color filters
const colorFilter = OpenSeadragon.Filters.GREYSCALE
colorFilter.prototype.PROBABILITY = (data) => {
  return (context, callback) => {
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    let pixels = imgData.data

    if (data.type === 'inside') {
      for (let i = 0; i < pixels.length; i += 4) {
        let probability = pixels[i + 1]
        // has to be gt zero (not >=)
        if (probability > data.min && probability <= data.max) {
          pixels[i] = 0
          pixels[i + 1] = 255
          pixels[i + 2] = 255
          pixels[i + 3] = 255
        } else {
          pixels[i + 3] = 0
        }
      }
    } else if (data.type === 'outside') {
      for (let i = 0; i < pixels.length; i += 4) {
        let probability = pixels[i + 1]
        // has to be gt zero (not >=), zero is background
        if ((probability > 0 && probability <= data.min) || (probability <= 255 && probability >= data.max)) {
          pixels[i] = 0
          pixels[i + 1] = 255
          pixels[i + 2] = 255
          pixels[i + 3] = 255
        } else {
          pixels[i + 3] = 0
        }
      }
    }

    context.putImageData(imgData, 0, 0)
    callback()
  }
}

colorFilter.prototype.COLORLEVELS = layerColors => {
  return (context, callback) => {
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    let imageData = imgData.data

    // Make background completely transparent (currently [64, 0, 64])
    for (let i = 0; i < imageData.length; i += 4) {
      // If green=0, turn it off.
      if (imageData[i + 1] === 0) {
        imageData[i + 3] = 0
      }
    }

    // Reduce data to 2D array of pixels
    // (easier to work with)
    let data = imageData.reduce(
      (pixel, key, index) =>
        (index % 4 === 0
          ? pixel.push([key])
          : pixel[pixel.length - 1].push(key)) && pixel,
      []
    )

    if (outlineFlag) {
      // Color the edge of the Polygons blue
      let n = 1 // nth channel
      for (let i = 0; i < data.length; i++) {
        if (data[i][3] === 255) {
          // If we have a color, but the pixel next to it is transparent, we have an edge pixel
          try {
            if (data[i][n] !== 0 && data[i + 1][3] === 0) {
              data[i][0] = 0
              data[i][1] = 0
              data[i][2] = 255
              data[i][3] = 255
            }
          } catch (e) {
            // this may fail when zoomed in
          }

          try {
            if (data[i][n] !== 0 && data[i - 1][3] === 0) {
              data[i][0] = 0
              data[i][1] = 0
              data[i][2] = 255
              data[i][3] = 255
            }
          } catch (e) {
            // ditto
          }

          try {
            if (data[i][n] !== 0 && data[i - context.canvas.width][3] === 0) {
              data[i][0] = 0
              data[i][1] = 0
              data[i][2] = 255
              data[i][3] = 255
            }
          } catch (e) {
            // catch
          }

          try {
            if (data[i][n] !== 0 && data[i + context.canvas.width][3] === 0) {
              data[i][0] = 0
              data[i][1] = 0
              data[i][2] = 255
              data[i][3] = 255
            }
          } catch (e) {
            // catch
          }
        } else {
          data[i][0] = 0
          data[i][1] = 0
          data[i][2] = 0
          data[i][3] = 0
        }
      }

      // Change all green pixels in middle of polygon to transparent
      data.forEach((px) => {
        if (px[n] > 0) {
          // Set each pixel!
          // It is not enough to set px=[0,0,0,0]
          px[0] = 0
          px[1] = 0
          px[2] = 0
          px[3] = 0
        }
      })

    } else {
      const arr = layerColors.filter(x => x.checked === true)
      const colorArr = arr.map(element => {
        return colorToArray(element.color) // Save the [r, g, b, a]'s for access later
      })

      const inRange = function (value, _colors, colorArr) {
        for (let i = 0; i < _colors.length; i++) {
          if (value >= _colors[i].low && value <= _colors[i].high) {
            return colorArr[i] // return color
          }
        }
        return [0, 0, 0, 0]
      }

      const inClass = function (value, _classes, classArr) {
        for (let i = 0; i < _classes.length; i++) {
          if (value === _classes[i].classid) {
            return classArr[i] // return color
          }
        }
        return [0, 0, 0, 0]
      }

      function setPix(fun, cmap) {
        for (let i = 0; i < data.length; i++) {
          // 255 = nuclear material exists here
          if (data[i][3] === 255) {
            const r = data[i][0] // red channel = class
            const g = data[i][1] // green channel = probability
            let rgba
            if (renderType === 'byClass') {
              rgba = fun(r, arr, colorArr)
            } else if (renderType === 'byProbability') {
              rgba = fun(g, arr, colorArr)
            } else if (renderType === 'byHeatmap') {
              rgba = cmap[g]
            } else {
              console.error('renderType?', renderType)
              return
            }
            // Set
            data[i][0] = rgba[0]
            data[i][1] = rgba[1]
            data[i][2] = rgba[2]
            data[i][3] = rgba[3]
            if (rgba[3] > 0) {
              // If attenuation is on,
              // then use green channel value for the alpha value
              data[i][3] = attenuateFlag ? g : 255
            }
          } else {
            // No nuclear material
            data[i][0] = 0
            data[i][1] = 0
            data[i][2] = 0
            data[i][3] = 0
          }
        }
      }

      if (renderType === 'byClass') {
        setPix(inClass)
      }

      if (renderType === 'byProbability') {
        setPix(inRange)
      }

      if (renderType === 'byHeatmap') {
        // 256 colors - blue to red gradient
        setPix({}, [[0, 0, 255, 255], [1, 0, 254, 255], [2, 0, 253, 255], [3, 0, 252, 255], [4, 0, 251, 255], [5, 0, 250, 255], [6, 0, 249, 255], [7, 0, 248, 255], [8, 0, 247, 255], [9, 0, 246, 255], [10, 0, 245, 255], [11, 0, 244, 255], [12, 0, 243, 255], [13, 0, 242, 255], [14, 0, 241, 255], [15, 0, 240, 255], [16, 0, 239, 255], [17, 0, 238, 255], [18, 0, 237, 255], [19, 0, 236, 255], [20, 0, 235, 255], [21, 0, 234, 255], [22, 0, 233, 255], [23, 0, 232, 255], [24, 0, 231, 255], [25, 0, 230, 255], [26, 0, 229, 255], [27, 0, 228, 255], [28, 0, 227, 255], [29, 0, 226, 255], [30, 0, 225, 255], [31, 0, 224, 255], [32, 0, 223, 255], [33, 0, 222, 255], [34, 0, 221, 255], [35, 0, 220, 255], [36, 0, 219, 255], [37, 0, 218, 255], [38, 0, 217, 255], [39, 0, 216, 255], [40, 0, 215, 255], [41, 0, 214, 255], [42, 0, 213, 255], [43, 0, 212, 255], [44, 0, 211, 255], [45, 0, 210, 255], [46, 0, 209, 255], [47, 0, 208, 255], [48, 0, 207, 255], [49, 0, 206, 255], [50, 0, 205, 255], [51, 0, 204, 255], [52, 0, 203, 255], [53, 0, 202, 255], [54, 0, 201, 255], [55, 0, 200, 255], [56, 0, 199, 255], [57, 0, 198, 255], [58, 0, 197, 255], [59, 0, 196, 255], [60, 0, 195, 255], [61, 0, 194, 255], [62, 0, 193, 255], [63, 0, 192, 255], [64, 0, 191, 255], [65, 0, 190, 255], [66, 0, 189, 255], [67, 0, 188, 255], [68, 0, 187, 255], [69, 0, 186, 255], [70, 0, 185, 255], [71, 0, 184, 255], [72, 0, 183, 255], [73, 0, 182, 255], [74, 0, 181, 255], [75, 0, 180, 255], [76, 0, 179, 255], [77, 0, 178, 255], [78, 0, 177, 255], [79, 0, 176, 255], [80, 0, 175, 255], [81, 0, 174, 255], [82, 0, 173, 255], [83, 0, 172, 255], [84, 0, 171, 255], [85, 0, 170, 255], [86, 0, 169, 255], [87, 0, 168, 255], [88, 0, 167, 255], [89, 0, 166, 255], [90, 0, 165, 255], [91, 0, 164, 255], [92, 0, 163, 255], [93, 0, 162, 255], [94, 0, 161, 255], [95, 0, 160, 255], [96, 0, 159, 255], [97, 0, 158, 255], [98, 0, 157, 255], [99, 0, 156, 255], [100, 0, 155, 255], [101, 0, 154, 255], [102, 0, 153, 255], [103, 0, 152, 255], [104, 0, 151, 255], [105, 0, 150, 255], [106, 0, 149, 255], [107, 0, 148, 255], [108, 0, 147, 255], [109, 0, 146, 255], [110, 0, 145, 255], [111, 0, 144, 255], [112, 0, 143, 255], [113, 0, 142, 255], [114, 0, 141, 255], [115, 0, 140, 255], [116, 0, 139, 255], [117, 0, 138, 255], [118, 0, 137, 255], [119, 0, 136, 255], [120, 0, 135, 255], [121, 0, 134, 255], [122, 0, 133, 255], [123, 0, 132, 255], [124, 0, 131, 255], [125, 0, 130, 255], [126, 0, 129, 255], [127, 0, 128, 255], [128, 0, 127, 255], [129, 0, 126, 255], [130, 0, 125, 255], [131, 0, 124, 255], [132, 0, 123, 255], [133, 0, 122, 255], [134, 0, 121, 255], [135, 0, 120, 255], [136, 0, 119, 255], [137, 0, 118, 255], [138, 0, 117, 255], [139, 0, 116, 255], [140, 0, 115, 255], [141, 0, 114, 255], [142, 0, 113, 255], [143, 0, 112, 255], [144, 0, 111, 255], [145, 0, 110, 255], [146, 0, 109, 255], [147, 0, 108, 255], [148, 0, 107, 255], [149, 0, 106, 255], [150, 0, 105, 255], [151, 0, 104, 255], [152, 0, 103, 255], [153, 0, 102, 255], [154, 0, 101, 255], [155, 0, 100, 255], [156, 0, 99, 255], [157, 0, 98, 255], [158, 0, 97, 255], [159, 0, 96, 255], [160, 0, 95, 255], [161, 0, 94, 255], [162, 0, 93, 255], [163, 0, 92, 255], [164, 0, 91, 255], [165, 0, 90, 255], [166, 0, 89, 255], [167, 0, 88, 255], [168, 0, 87, 255], [169, 0, 86, 255], [170, 0, 85, 255], [171, 0, 84, 255], [172, 0, 83, 255], [173, 0, 82, 255], [174, 0, 81, 255], [175, 0, 80, 255], [176, 0, 79, 255], [177, 0, 78, 255], [178, 0, 77, 255], [179, 0, 76, 255], [180, 0, 75, 255], [181, 0, 74, 255], [182, 0, 73, 255], [183, 0, 72, 255], [184, 0, 71, 255], [185, 0, 70, 255], [186, 0, 69, 255], [187, 0, 68, 255], [188, 0, 67, 255], [189, 0, 66, 255], [190, 0, 65, 255], [191, 0, 64, 255], [192, 0, 63, 255], [193, 0, 62, 255], [194, 0, 61, 255], [195, 0, 60, 255], [196, 0, 59, 255], [197, 0, 58, 255], [198, 0, 57, 255], [199, 0, 56, 255], [200, 0, 55, 255], [201, 0, 54, 255], [202, 0, 53, 255], [203, 0, 52, 255], [204, 0, 51, 255], [205, 0, 50, 255], [206, 0, 49, 255], [207, 0, 48, 255], [208, 0, 47, 255], [209, 0, 46, 255], [210, 0, 45, 255], [211, 0, 44, 255], [212, 0, 43, 255], [213, 0, 42, 255], [214, 0, 41, 255], [215, 0, 40, 255], [216, 0, 39, 255], [217, 0, 38, 255], [218, 0, 37, 255], [219, 0, 36, 255], [220, 0, 35, 255], [221, 0, 34, 255], [222, 0, 33, 255], [223, 0, 32, 255], [224, 0, 31, 255], [225, 0, 30, 255], [226, 0, 29, 255], [227, 0, 28, 255], [228, 0, 27, 255], [229, 0, 26, 255], [230, 0, 25, 255], [231, 0, 24, 255], [232, 0, 23, 255], [233, 0, 22, 255], [234, 0, 21, 255], [235, 0, 20, 255], [236, 0, 19, 255], [237, 0, 18, 255], [238, 0, 17, 255], [239, 0, 16, 255], [240, 0, 15, 255], [241, 0, 14, 255], [242, 0, 13, 255], [243, 0, 12, 255], [244, 0, 11, 255], [245, 0, 10, 255], [246, 0, 9, 255], [247, 0, 8, 255], [248, 0, 7, 255], [249, 0, 6, 255], [250, 0, 5, 255], [251, 0, 4, 255], [252, 0, 3, 255], [253, 0, 2, 255], [254, 0, 1, 255], [255, 0, 0, 255]])
      }

    }

    let newImage = context.createImageData(context.canvas.width, context.canvas.height)
    newImage.data.set(data.flat())
    context.putImageData(newImage, 0, 0)
    callback()
  }
}
