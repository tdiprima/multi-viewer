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
    // Sort list right away
    layerColors.sort((a, b) => b.low - a.low)

    table.appendChild(createHeaderRow())

    layerColors.forEach(function (colorObject, cIdx) {
      let cpEl = createColorPicker(cIdx, uniq, colorObject, layers, viewer)
      let num1 = createNumericInput(`low${uniq}${cIdx}`, uniq, layers, colorObject, layerColors, viewer)
      let num2 = createNumericInput(`hi${uniq}${cIdx}`, uniq, layers, colorObject, layerColors, viewer)
      let buttonId = `i${uniq}${cIdx}`
      let removeBtn = e('i', {id: buttonId, class: 'fas fa-minus pointer'})
      colorObject.tempKey = buttonId

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
function createNumericInput(id, uniq, layers, colorObject, colors, viewer) {
  let numEl = e('input', {
    id: id,
    type: 'number',
    min: '0',
    max: '255',
    step: '1',
    size: '5',
    value: id.includes('low') ? colorObject.low.toString() : colorObject.hi.toString()
  })
  numEl.addEventListener('change', isIntersect.bind(null, numEl, colors), {passive: true})
  numEl.addEventListener('input', numericEvent.bind(null, numEl, colorObject, layers, viewer), {passive: true})
  return numEl
}

function isIntersect(numEl, colors) {
  let lowEl, lowVal, highEl, highVal, key, tmpId
  let id = numEl.id
  let isLow = id.includes('low')
  if (isLow) {
    lowEl = numEl
    tmpId = id.replace('low', 'hi')
    highEl = document.getElementById(tmpId)
  } else {
    highEl = numEl
    tmpId = id.replace('hi', 'low')
    lowEl = document.getElementById(tmpId)
  }
  highlight(lowEl, highEl, false)
  lowVal = parseInt(lowEl.value)
  highVal = parseInt(highEl.value)
  key = isLow ? id.replace('low', 'i') : id.replace('hi', 'i')

  let index = colors.map(e => e.tempKey).indexOf(key)
  let nextKey = colors[index + 1].tempKey
  tmpId = nextKey.replace('i', 'low')
  let lowEl1 = document.getElementById(tmpId)
  tmpId = nextKey.replace('i', 'hi')
  let highEl1 = document.getElementById(tmpId)
  highlight(lowEl1, highEl1, false)

  // current high <= current low
  if (highVal <= lowVal) {
    highlight(lowEl, highEl, true)
  }

  // current low <= next high
  if (parseInt(lowVal) <= parseInt(highEl1.value)) {
    highlight(lowEl, highEl1, true)
  }

  // current high <= next low
  if (parseInt(highVal) <= parseInt(lowEl1.value)) {
    highlight(lowEl1, highVal, true)
  }
}

function highlight(a, b, isErr) {
  let style, color
  if (isErr) {
    style = 'solid'
    color = 'red'
  } else {
    style = ''
    color = ''
  }
  try {
    if (isRealValue(a)) {
      a.style.outlineStyle = style
      a.style.outlineColor = color
    }
    if (isRealValue(b)) {
      b.style.outlineStyle = style
      b.style.outlineColor = color
    }
  } catch (err) {
    console.log(`%c${err.message}`, 'color: #ff6a5a;')
  }
}

function addEvent(num1, num2, cpEl, uniq, tr, colors, layers, viewer) {
  highlight(num1, num2)
  if (num1.value === '0' && num2.value === '0') {
    setError(num1, num2)
  } else {
    // add to list
    let rgb = cpEl.style.backgroundColor // we get rgb back from CP
    let rgba = rgb.replace('rgb', 'rgba') // we need rgba
    rgba = rgba.replace(')', ', 255)') // give it default alpha
    let buttonId = num1.id.replace('low', 'i') // borrowing element id
    let colorObject = {'color': rgba, 'low': parseInt(num1.value), 'hi': parseInt(num2.value)}
    colors.push(colorObject) // add it to our list
    colorObject.tempKey = buttonId
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
