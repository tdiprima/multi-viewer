const filters = function (paletteBtn, prefLabel, layerColors, layers, viewer) {
  const identifier = getRandomInt(100, 999)
  const id = `filters${identifier}`
  const rect = paletteBtn.getBoundingClientRect()
  const div = createDraggableDiv(id, `${prefLabel} color levels`, rect.left, rect.top)
  createUI(identifier, div.lastChild, layerColors, layers, viewer)
  return div
}

// CREATE USER INTERFACE
function createUI(uniq, div, layerColors, layers, viewer) {
  const table = e('table')
  div.appendChild(table)

  if (layerColors) {
    layerColors.sort((a, b) => b.low - a.low)

    table.appendChild(createHeaderRow())

    layerColors.forEach(function (colorLowHi, cIdx) {
      let cpEl = createColorPicker(cIdx, uniq, colorLowHi, layers, viewer)
      let num1 = createNumericInput(`low${uniq}${cIdx}`, uniq, layers, colorLowHi, layerColors, viewer)
      let num2 = createNumericInput(`hi${uniq}${cIdx}`, uniq, layers, colorLowHi, layerColors, viewer)
      let buttonId = `i${uniq}${cIdx}`
      let removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})
      colorLowHi.tempKey = buttonId

      let tr = e('tr', {}, [
        e('td', {}, [cpEl]),
        e('td', {}, [num1]),
        e('td', {}, [num2]),
        e('td', {}, [removeBtn])
      ])
      table.appendChild(tr)

      removeBtn.addEventListener('click', removeColor.bind(null, layerColors, cpEl.style.backgroundColor, num1.value, num2.value, tr, layers, viewer), {passive: true});

    })

    table.appendChild(extraRow(uniq, layerColors, layers, viewer))
  }
}

function isMatch(ourRgb, modRgb) {
  let arr = colorToArray(ourRgb)
  let arr1 = colorToArray(modRgb)

  // check the first 3
  let match = arr[0] === arr1[0] && arr[1] === arr1[1] && arr[2] === arr1[2]
  if (!match) {
    return false
  }

  if (arr.length === 4 && arr1.length === 4) {
    return almostEqual(arr[3], (arr1[3] * 255), 0.1)
  }

  // It's ok if we've gotten this far
  return match
}

function removeColor(ourRanges, modRgb, modNum1, modNum2, tr, layers, viewer) {
  // Make sure we remove the right one from the list
  for (let i = 0; i < ourRanges.length; i++) {
    let r = ourRanges[i]
    let arrEq = isMatch(r.color, modRgb)
    if (arrEq && r.low === parseInt(modNum1) && r.hi === parseInt(modNum2)) {
      // that's the one; remove it
      ourRanges.splice(i, 1)
      // sort
      ourRanges.sort((a, b) => b.low - a.low)
      // reflect changes in viewer
      setFilter(layers, viewer)
      break
    }
  }
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
function createColorPicker(cIdx, uniq, colorLowHi, layers, viewer) {
  let init = true
  const m = e('mark', {id: `marker${uniq}${cIdx}`})
  let colorCode = colorLowHi.color
  m.style.backgroundColor = colorCode
  m.innerHTML = `#${rgba2hex(colorCode)}`

  const picker = new CP(m)
  picker.on('change', function (r, g, b, a) {
    if (init) {
      init = false // Update the state
      return
    }
    // console.log([r, g, b, a])
    this.source.value = this.color(r, g, b, a)
    this.source.innerHTML = this.color(r, g, b, a)
    this.source.style.backgroundColor = this.color(r, g, b, a)
    colorLowHi.color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
    setFilter(layers, viewer)
  })

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

function numericEvent(x, colorLowHi, layers, viewer) {
  clearError(x) // Clear any previous errors
  const intVal = parseInt(x.value)

  // If they set it to something outside of 0-255, reset it
  if (intVal > 255) x.value = '255'
  if (intVal < 0) x.value = '0'

  if (x.id.startsWith('low')) {
    colorLowHi.low = intVal
  } else {
    colorLowHi.hi = intVal
  }
  setFilter(layers, viewer)
}

// CREATE NUMERIC INPUT
function createNumericInput(id, uniq, layers, colorLowHi, colors, viewer) {
  let x = e('input', {
    id: id,
    type: 'number',
    min: '0',
    max: '255',
    step: '1',
    size: '5',
    value: id.includes('low') ? colorLowHi.low.toString() : colorLowHi.hi.toString()
  })

  // x.addEventListener('change', isIntersect.bind(null, uniq, colors.length), {passive: true});
  x.addEventListener('input', numericEvent.bind(null, x, colorLowHi, layers, viewer), {passive: true});
  return x
}

function isIntersect(uniq, len) {
  // TODO: THIS FN NO LONGER WORKS - NEED TO REVISE.
  try {
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
  } catch (e) {
    console.log(`%c${e.message}`, 'color: #ff6a5a;')
  }
}

function setError(a, b) {
  a.style.outlineStyle = 'solid'
  a.style.outlineColor = 'red'
  b.style.outlineStyle = 'solid'
  b.style.outlineColor = 'red'
}

function clearError(a, b) {
  // console.log('a,b', a, b)
  a.style.outlineStyle = ''
  a.style.outlineColor = ''
  if (typeof b !== 'undefined') {
    b.style.outlineStyle = ''
    b.style.outlineColor = ''
  }
}

function addEvent(num1, num2, cpEl, uniq, tr, colors, layers, viewer) {
  clearError(num1, num2)
  if (num1.value === '0' && num2.value === '0') {
    num1.style.outlineStyle = 'solid'
    num1.style.outlineColor = 'red'
    num2.style.outlineStyle = 'solid'
    num2.style.outlineColor = 'red'
  } else {
    // add to list
    let rgb = cpEl.style.backgroundColor // we get rgb back from CP
    let rgba = rgb.replace('rgb', 'rgba') // we need rgba
    rgba = rgba.replace(')', ', 255)') // give it default alpha
    colors.push({'color': rgba, 'low': parseInt(num1.value), 'hi': parseInt(num2.value)}) // add it to our list
    // sort
    colors.sort((a, b) => b.low - a.low)
    // reflect changes in viewer
    setFilter(layers, viewer)

    let buttonId = num1.id.replace('low', 'i')
    let removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})
    console.log(tr.lastChild.firstChild)
    console.log(removeBtn)
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
  let num1 = createNumericInput(`low${uniq}${idx}`, uniq, layers, generic, colors, viewer)
  let num2 = createNumericInput(`hi${uniq}${idx}`, uniq, layers, generic, colors, viewer)
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

// CUSTOM FILTER IMPLEMENTATION
let colorFilter = OpenSeadragon.Filters.GREYSCALE;
colorFilter.prototype.COLORLEVELS = function (layerColorRanges) {
  // console.log('%cCOLORLEVELS', 'color: #ccff00;')
  return function (context, callback) {
    // Read the canvas pixels
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    let pxl = imgData.data; // Uint8ClampedArray

    let colorArr = layerColorRanges.map(function (element) {
      return colorToArray(element.color); // Save the [r, g, b, a]'s for access later
    });

    for (let j = 0; j < pxl.length; j += 4) {
      if (pxl[j + 3] === 255) {
        let rgba = levels(pxl[j], layerColorRanges, colorArr); // r = g = b, thus we can check just r
        pxl[j] = rgba[0];
        pxl[j + 1] = rgba[1];
        pxl[j + 2] = rgba[2];
        pxl[j + 3] = rgba[3];
      } else {
        // No nuclear material: set to transparent.
        pxl[j + 3] = 0;
      }
    }

    function levels(value, _colors, colorArr) {
      for (let _i = 0; _i < _colors.length; _i++) {
        if (value >= _colors[_i].low && value <= _colors[_i].hi) {
          return colorArr[_i]; // return color
        }
      }
      // if we are here, then no match
      return [0, 0, 0, 0];
    }

    context.putImageData(imgData, 0, 0);
    callback();
  };
};
