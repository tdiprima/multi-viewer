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
const filterPopup = (paletteBtn, prefLabel, colorscheme, viewerLayers, viewer) => {
  // colorscheme.colors: is an array of class-colors objects
  // Now, add a flag called 'checked', and set it to true for use later:
  colorscheme.colors.map(function (a) {
    return a.checked = true
  })

  // colorscheme.colorspectrum: is an array of color objects for probability
  // Add 'checked'. Add 'classid' - set value to current index in array.
  colorscheme.colorspectrum.forEach(function (element, index) {
    element.checked = true
    element.classid = index // 'classid' also exists in colorscheme.colors.  We're overloading the variable, so we can have 1 checkbox handler for both.
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
  divA.style.display = (STATE.renderType === 'byClass') ? 'block' : 'none'
  widgetBody.appendChild(divA)
  createUI(1, uniqueId, divA, colorscheme.colors, viewerLayers, viewer)

  // By probability
  divB.style.display = (STATE.renderType === 'byProbability') ? 'block' : 'none'
  widgetBody.appendChild(divB)
  createUI(2, uniqueId, divB, colorscheme.colorspectrum, viewerLayers, viewer)

  // By heatmap
  divC.style.display = (STATE.renderType === 'byHeatmap') ? 'block' : 'none'
  widgetBody.appendChild(divC)

  return div
}

function checkboxHandler(checkboxElement, displayColors, layers, viewer) {
  checkboxElement.addEventListener('click', function () {
    // look up color by 'classid', set 'checked' to the state of the checkbox
    displayColors.find(x => x.classid === parseInt(checkboxElement.value)).checked = checkboxElement.checked
    setFilter(layers, viewer)
  })
}

function createDropdown(uniqueId, divArr, allLayers, viewer) {
  let selectDiv = e('div', {'style': 'display: block;'})
  let listId = `select${uniqueId}`
  selectDiv.innerHTML = `<label for="${listId}">Color by:</label>&nbsp;`
  // Array of options to be added
  let myList = e('select')
  myList.id = listId
  selectDiv.appendChild(myList)

  // Append the options
  RENDER_TYPES.forEach((option, i) => {
    const element = document.createElement('option')
    element.setAttribute('value', option)
    element.text = option.startsWith('by') ? option.replace('by', '') : option
    myList.appendChild(element)
  })

  myList.addEventListener('change', function () {
    // set global type
    STATE.renderType = myList.options[myList.selectedIndex].value
    // no outline for you
    STATE.outline = false

    // Shut all off...
    divArr.forEach(div => {
      div.style.display = 'none'
    })

    // ...and turn one on.
    if (STATE.renderType === 'byClass') {
      divArr[0].style.display = 'block'
    } else if (STATE.renderType === 'byProbability') {
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
  const table = e('table', {'class': 'popupBody'})
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
    console.warn('Layer colors?', layerColors)
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
function createNumericInput (id, table, uniq, layers, colorObject, colors, viewer) {
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
  let idx
  const nums = seq(colors) // Use 'const'.
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
