/**
 * Clicking the color palette icon brings you here.
 * Create a popup div allowing user to adjust color ranges for that layer,
 * or adjust the colors being used to color each class in that layer.
 * There is a color filter at the bottom of this script - this is the workhorse that colors the layer in OSD.
 * 
 * POPUP DIV FOR COLOR LEVELS: NAMING CONVENTION
 * filtersXXX
 * filtersXXXHeader
 * filtersXXXBody
 * <TR>
 * markerXXX0 <- 0th row elements
 * lowXXX0 <- 0th row elements
 * hiXXX0 <- 0th row elements
 * iXXX0 <- 0th row elements
 * <TR>
 * markerXXX1 <- 1st row elements
 * lowXXX1 <- 1st row elements
 * hiXXX1 <- 1st row elements
 * iXXX1 <- 1st row elements
 * <ETC>
 */
const filters = function (paletteBtn, prefLabel, layerColors, layers, viewer) {
  const uniqueId = getRandomInt(100, 999)
  const widgetId = `filters${uniqueId}`
  const rect = paletteBtn.getBoundingClientRect()

  /* ~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
  // TEMPORARY HACK - COLOR BY CLASS
  */
  const div = createDraggableDiv(widgetId, `${prefLabel} has feature`, rect.left, rect.top)
  const widgetBody = div.lastChild
  renderByClass(uniqueId, widgetBody, layerColors, layers, viewer)

  // const div = createDraggableDiv(widgetId, `${prefLabel} color levels`, rect.left, rect.top)
  // const widgetBody = div.lastChild
  // createUI(uniqueId, widgetBody, layerColors, layers, viewer)

  return div
}

function renderByClass(uniq, div, layerColors, layers, viewer) {
  const table = e('table')
  div.appendChild(table)

  table.innerHTML = `<table>
<tbody>
<tr>
<th align="left">Color</th>
<th align="left">Label</th>
</tr>
<tr>
<td><input type="color" value="#ffff00"></td>
<td>Tumor</td>
</tr>
<tr>
<td><input type="color" value="#0000ff"></td>
<td>Miscellaneous</td>
</tr>
<tr>
<td><input type="color" value="#ff0000"></td>
<td>Lymphocyte</td>
</tr>
<tr>
<td><input type="color" value="#ffa500"></td>
<td style="font-size: smaller">https://null.com/background</td>
</tr>
</tbody>
</table>`
}

// CREATE USER INTERFACE
function createUI(uniq, div, layerColors, layers, viewer) {
  const table = e('table')
  div.appendChild(table)

  if (layerColors) {
    // Sort list
    layerColors.sort((a, b) => b.low - a.low)

    table.appendChild(createHeaderRow())

    // Create table row for each color rgba and range (low to hi)
    // with UI to adjust color, low, hi, and a button to add or remove a range.
    layerColors.forEach(function (colorObject, cIdx) {
      let cpEl = createColorPicker(cIdx, uniq, colorObject, layers, viewer)
      let num1 = createNumericInput(`low${uniq}${cIdx}`, table, uniq, layers, colorObject, layerColors, viewer)
      let num2 = createNumericInput(`hi${uniq}${cIdx}`, table, uniq, layers, colorObject, layerColors, viewer)
      let buttonId = `i${uniq}${cIdx}`
      let removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})

      let tr = e('tr', {}, [
        e('td', {}, [cpEl]),
        e('td', {}, [num1]),
        e('td', {}, [num2]),
        e('td', {}, [removeBtn])
      ])
      table.appendChild(tr)

      removeBtn.addEventListener('click', removeColor.bind(null, removeBtn, layerColors, tr, layers, viewer), {passive: true});

    })

    table.appendChild(extraRow(uniq, layerColors, layers, viewer))
  }
}

function removeColor(el, ourRanges, tr, layers, viewer) {
  let str = el.id
  let n = str.charAt(str.length - 1)
  // remove from list
  ourRanges.splice(parseInt(n), 1)
  // reflect changes in viewer
  setFilter(layers, viewer)
  tr.remove()
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
function createColorPicker(cIdx, uniq, colorObject, layers, viewer) {
  let init = true
  const m = e('mark', {id: `marker${uniq}${cIdx}`})
  let colorCode = colorObject.color
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

function numericEvent(numEl, colorObject, layers, viewer) {
  const intVal = parseInt(numEl.value)

  // If they set it to something outside of 0-255, reset it
  if (intVal > 255) numEl.value = '255'
  if (intVal < 0) numEl.value = '0'

  if (numEl.id.startsWith('low')) {
    colorObject.low = intVal
  } else {
    colorObject.hi = intVal
  }
  setFilter(layers, viewer)
}

// CREATE NUMERIC INPUT
function createNumericInput(id, table, uniq, layers, colorObject, colors, viewer) {
  let numEl = e('input', {
    id: id,
    type: 'number',
    min: '0',
    max: '255',
    step: '1',
    size: '5',
    value: id.includes('low') ? colorObject.low.toString() : colorObject.hi.toString()
  })
  // Event listeners
  numEl.addEventListener('change', isIntersect.bind(null, table), {passive: true})
  numEl.addEventListener('input', numericEvent.bind(null, numEl, colorObject, layers, viewer), {passive: true})
  return numEl
}

// An interval has low value and high value
// Check to see if any two intervals overlap
function isIntersect(table) {
  let arr = []
  const cells = table.getElementsByTagName('td');
  for (let cell of cells) {
    let elem = cell.children[0]
    if (elem.type === 'number') {
      elem.style.outlineStyle = ''
      elem.style.outlineColor = ''
      if (elem.id.startsWith('low')) {
        arr.push({'low': elem, 'lowVal': parseInt(elem.value)})
      }
      if (elem.id.startsWith('hi')) {
        let el = arr[arr.length - 1] // get last array elem
        el.high = elem
        el.highVal = parseInt(elem.value)
      }
    }
  }

  // Sort DESC
  arr.sort((a, b) => {
    return b.lowVal - a.lowVal
  })
  let n = arr.length - 1
  for (let i = 0; i < n; i++) {
    let notZeroes = (arr[i].lowVal !== 0 && arr[i + 1].highVal !== 0)
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
    let rgb = cpEl.style.backgroundColor // we get rgb back from CP
    let rgba = rgb.replace('rgb', 'rgba') // we need rgba
    rgba = rgba.replace(')', ', 255)') // give it default alpha
    let blah = num1.id.replace('low', '') // borrowing element id
    let buttonId = `i${blah}`
    let colorObject = {'color': rgba, 'low': parseInt(num1.value), 'hi': parseInt(num2.value)}
    colors.push(colorObject) // add it to our list
    // sort
    colors.sort((a, b) => b.low - a.low)
    // reflect changes in viewer
    setFilter(layers, viewer)

    let removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})
    // Replace + with -
    tr.lastChild.firstChild.remove() // last element in row is modifier
    tr.lastChild.appendChild(removeBtn) // replace old modifier with new one
    removeBtn.addEventListener('click', removeColor.bind(null, colors, cpEl.style.backgroundColor, num1.value, num2.value, tr, layers, viewer), {passive: true});

    // add another empty row
    const table = tr.closest('table')
    table.appendChild(extraRow(uniq, colors, layers, viewer))
  }
}

// EXTRA ROW FOR ADDING COLOR AND RANGE VALUES
function extraRow(uniq, colors, layers, viewer) {
  let idx = colors.length
  let generic = {color: 'rgba(255, 255, 255, 255)', low: 0, hi: 0}
  let cpEl = createColorPicker(idx, uniq, generic, layers, viewer)
  let b = document.getElementById(`filters${uniq}Body`)
  let t = b.firstChild
  let num1 = createNumericInput(`low${uniq}${idx}`, t, uniq, layers, generic, colors, viewer)
  let num2 = createNumericInput(`hi${uniq}${idx}`, t, uniq, layers, generic, colors, viewer)
  let addBtn = e('i', {id: `i${uniq}${idx}`, class: 'fas fa-plus pointer'})

  let tr = e('tr', {}, [
    e('td', {}, [cpEl]),
    e('td', {}, [num1]),
    e('td', {}, [num2]),
    e('td', {}, [addBtn])
  ])

  addBtn.addEventListener('click', addEvent.bind(null, num1, num2, cpEl, uniq, tr, colors, layers, viewer), {passive: true});

  return tr
}

// FILTER BY CLASS (TEST)
const colorFilter = OpenSeadragon.Filters.GREYSCALE
colorFilter.prototype.COLORLEVELS = function (layerColorRanges) {
  return function (context, callback) {
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    let pxl = imgData.data

    if (false) { // TEMP
      let colorArr = layerColorRanges.map(function (element) {
        return colorToArray(element.color); // Save the [r, g, b, a]'s for access later
      });
    }

    for (let j = 0; j < pxl.length; j += 4) {
      if (pxl[j + 3] === 255) {
        if (false) { // TEMP
          let rgba = levels(pxl[j], layerColorRanges, colorArr); // r = g = b, thus we can check just r
          pxl[j] = rgba[0];
          pxl[j + 1] = rgba[1];
          pxl[j + 2] = rgba[2];
          pxl[j + 3] = rgba[3];
        } else {
          const rc = pxl[j]
          switch (rc) {
            case 1:
              // Tumor, yellow
              pxl[j] = 255;
              pxl[j + 1] = 255;
              pxl[j + 2] = 0;
              pxl[j + 3] = 255;
              break;
            case 2:
              // Miscellaneous, blue
              pxl[j] = 0;
              pxl[j + 1] = 0;
              pxl[j + 2] = 255;
              pxl[j + 3] = 255;
              break;
            case 3:
              // Lymphocyte, red
              pxl[j] = 255;
              pxl[j + 1] = 0;
              pxl[j + 2] = 0;
              pxl[j + 3] = 255;
              break;
            case 4:
              // https://null.com/background, orange
              pxl[j] = 255;
              pxl[j + 1] = 165;
              pxl[j + 2] = 0;
              pxl[j + 3] = 255;
              break;
            default:
              // console.log(pxl[j])
              // pxl[j] = 0;
              // pxl[j + 1] = 255;
              // pxl[j + 2] = 255;
              pxl[j + 3] = 0; // transparent [9,1,9], etc.???
          }
        }
      } else {
        // No nuclear material: set to transparent.
        pxl[j + 3] = 0;
      }

    }

    // probability
    function levels(value, _colors, colorArr) {
      for (let _i = 0; _i < _colors.length; _i++) {
        if (value >= _colors[_i].low && value <= _colors[_i].hi) {
          return colorArr[_i]; // return color
        }
      }
      // if we are here, then no match
      return [0, 0, 0, 0];
    }

    context.putImageData(imgData, 0, 0)
    callback()
  }
}
