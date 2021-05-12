let filters = function (cr) {
  'use strict'
  let colors = []
  _setColors()
  let colorRanges // User defines what color ranges go with which pixel values
  if (cr) {
    colorRanges = cr
  } else {
    colorRanges = [{color: 'rgba(75, 0, 130, 255)', low: 201, hi: 255}]
  }
  let rangesCopy = [...colorRanges] // so that we can go back

  let layerNumber = 1

  function _setColors() {
    // My RGB object
    function filterColors(r, g, b) {
      this.r = r
      this.g = g
      this.b = b
    }

    // Colors per layer
    colors.push(new filterColors(0, 255, 0)) // we skip the first layer, so colors[0] doesn't count
    colors.push(new filterColors(0, 255, 0)) // lime 00ff00
    colors.push(new filterColors(255, 255, 0)) // yellow ffff00
    colors.push(new filterColors(0, 255, 255)) // cyan 00ffff
    colors.push(new filterColors(255, 0, 0)) // red ff0000
    colors.push(new filterColors(255, 165, 0)) // orange ffa500
    colors.push(new filterColors(0, 128, 0)) // dark green 008000
    colors.push(new filterColors(0, 0, 255)) // blue 0000ff
    colors.push(new filterColors(75, 0, 130)) // indigo 4b0082
    colors.push(new filterColors(28, 28, 28)) // dark gray #1c1c1c
    colors.push(new filterColors(167, 226, 46)) // leaf green #a7e22e
    colors.push(new filterColors(31, 120, 180)) // strong blue, #1f78b4
    colors.push(new filterColors(255, 210, 4)) // goldenrod #ffd204
  }

  // Function to help drag popup around screen
  function dragElement(elmnt) {
    let pos1 = 0
    let pos2 = 0
    let pos3 = 0
    let pos4 = 0

    let header = document.getElementsByClassName('popupHeader')
    if (header) {
      // if present, the header is where you move the DIV from:
      let n
      for (n = 0; n < header.length; n++) {
        header[n].onmousedown = dragMouseDown
      }
    }

    // Mousedown handler
    function dragMouseDown(e) {
      e = e || window.event
      e.preventDefault()
      // get the mouse cursor position at startup:
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag
    }

    // Mouse-move handler
    function elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
      elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
    }

    // Done handler
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  function setViewerFilter(viewer) {
    try {
      viewer.setFilterOptions({
        filters: [{
          items: viewer.world.getItemAt(layerNumber === 0 ? 1 : layerNumber),
          processors: [
            getFilter1().prototype.COLORLEVELS(colorRanges)
          ]
        }],
        loadMode: 'sync'
      })
    } catch (err) {
      console.log('OK')
    }
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

  function isIntersect(arr, n) {
    // Clear any previous errors
    arr.forEach((element, index) => {
      clearError(document.getElementById('low' + index), document.getElementById('hi' + index))
    })

    // Validate
    for (let i = 1; i < n; i++) {

      if (parseInt(arr[i - 1].hi) < parseInt(arr[i].low)) {
        // console.log(parseInt(arr[i - 1].hi), parseInt(arr[i].low))
        setError(document.getElementById('low' + i), document.getElementById('hi' + (i - 1)))
        return true
      }

      if (parseInt(arr[i - 1].low) < parseInt(arr[i].hi)) {
        // console.log(parseInt(arr[i - 1].low), parseInt(arr[i].hi))
        setError(document.getElementById('low' + (i - 1)), document.getElementById('hi' + i))
        return true
      }

    }

    // If we reach here, then no overlap
    return false
  }

  // NUMBER INPUT to let user set threshold values
  function createNumericInput({id, val, index}, viewer) {
    let x = document.createElement('input')
    x.id = id
    x.setAttribute('type', 'number')
    x.min = '0'
    x.max = '255'
    x.step = '1'
    x.value = val.toString()
    x.size = 5

    x.addEventListener('change', function () {
      isIntersect(colorRanges, colorRanges.length)
    })

    // this event happens whenever the value changes
    x.addEventListener('input', function () {
      let intVal = parseInt(this.value)

      // If they set it to something outside of 0-255, reset it
      if (intVal > 255) this.value = '255'
      if (intVal < 0) this.value = '0'

      if (this.id.startsWith('low')) {
        colorRanges[index].low = parseInt(this.value)
      } else {
        colorRanges[index].hi = parseInt(this.value)
        setViewerFilter(viewer) // triggered by high value input
      }
    })

    return x
  }

  function layerButtonToggle(color, cursor) {
    jQuery("*").each(function () {
      if (this.id.startsWith('osd-overlaycanvas')) {
        let num = this.id.slice(-1) // hack to get the id #
        let z = document.getElementById(`colors${num}`)
        z.style.color = color
        z.style.cursor = cursor
      }
    })
  }

  function rgba2hex(orig) {
    let a
    const rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
    const alpha = (rgb && rgb[4] || '').trim()
    let hex = rgb
      ? (rgb[1] | 1 << 8).toString(16).slice(1) +
      (rgb[2] | 1 << 8).toString(16).slice(1) +
      (rgb[3] | 1 << 8).toString(16).slice(1) : orig

    if (alpha !== '') {
      a = alpha
    } else {
      a = 0o1
    }
    // multiply before convert to HEX (a * 255)
    a = (a | 1 << 8).toString(16).slice(1)
    hex = hex + a
    hex = `#${hex}`

    return hex
  }

  function colorPickerEvent(mark, idx, viewer) {
    const cp = new CP(mark)

    cp.on('change', (r, g, b, a) => {
      try {
        cp.source.value = cp.color(r, g, b, a)
        cp.source.innerHTML = cp.color(r, g, b, a)
        cp.source.style.backgroundColor = cp.color(r, g, b, a)
        colorRanges[idx].color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
        setViewerFilter(viewer)
      } catch (err) {
        console.warn('check this:', err.message)
      }
    })
  }

  // CREATE USER INPUT PER COLOR
  // Display colors and low/high values
  // {color: "rgba(r, g, b, a)", hi: n, low: n}
  function createUserInput(colorPopup, viewer) {
    let i
    for (i = 0; i < colorRanges.length; i++) {
      // COLOR DIV
      let colorDiv = document.createElement('div')
      let colorCode = colorRanges[i].color

      // COLOR PICKER
      let m = document.createElement('mark')
      m.id = `marker${i}`
      m.innerHTML = rgba2hex(colorCode)
      colorDiv.appendChild(m)
      colorPickerEvent(m, i, viewer)

      // LOW
      let lowDiv = document.createElement('div')
      let d = {
        id: `low${i}`,
        val: colorRanges[i].low,
        index: i
      }
      lowDiv.appendChild(createNumericInput(d, viewer))

      // HIGH
      let hiDiv = document.createElement('div')
      d = {
        id: `hi${i}`,
        val: colorRanges[i].hi,
        index: i
      }
      hiDiv.appendChild(createNumericInput(d, viewer))

      // ADD TO CONTAINER DIV
      colorPopup.appendChild(colorDiv)
      colorPopup.appendChild(lowDiv)
      colorPopup.appendChild(hiDiv)
    }
  }

  function createPopup({clientX, clientY}, {style}, viewer) {
    // Disable buttons
    layerButtonToggle('#ccc', 'not-allowed')

    // Highlight this button
    style.color = '#0f0'
    style.cursor = 'pointer'

    // Main container
    let colorPopup = document.createElement('div')
    colorPopup.id = 'colorPopup'
    colorPopup.classList.add('grid-container')
    colorPopup.classList.add('colorPopup')

    // Close button
    let d = document.createElement('div')
    d.className = 'popupHeader'
    const img = document.createElement('img')
    img.src = 'images/close_icon.png'
    img.width = 25
    img.height = 25
    img.style.cssFloat = 'left'
    d.appendChild(img)

    // Remove div on click
    img.addEventListener('click', function () {
      style.color = '#000'
      // Re-enable buttons
      layerButtonToggle('#000', 'pointer')
      this.parentNode.parentNode.remove()
    })
    colorPopup.appendChild(d)

    // Header to drag around screen
    const popupHeader = document.createElement('div')
    popupHeader.className = 'popupHeader'
    popupHeader.innerHTML = 'Color Levels'
    colorPopup.appendChild(popupHeader)
    let t = document.createElement('div')
    t.className = 'popupHeader'
    colorPopup.appendChild(t)

    // Sort
    colorRanges.sort((a, b) => b.low - a.low) // ORDER BY LOW DESC

    // UI
    createUserInput(colorPopup, viewer)

    // put it where user clicked
    colorPopup.style.left = `${clientX}px`
    colorPopup.style.top = `${clientY}px`

    document.body.appendChild(colorPopup)

    // Make DIV element draggable:
    dragElement(colorPopup)
  }

  function handleColorLevels(layersBtn, viewer) {
    // Event handler for the layers button
    layersBtn.addEventListener('click', event => {
      event = event || window.event

      // Let there be only one
      let el = document.getElementById('colorPopup')
      if (!el) {
        createPopup(event, layersBtn, viewer)
      }
    })
  }

  let getFilter = function () {
    let filter = OpenSeadragon.Filters.GREYSCALE
    filter.prototype.COLORIZE = ({r, g, b}) => (context, callback) => {
      // w x h: 256 x 256
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        // Read the canvas pixels
        let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
        if (typeof imgData !== undefined) {
          try {
            const pixels = imgData.data
            // Run the filter on them
            let i
            for (i = 0; i < pixels.length; i += 4) {
              if (pixels[i + 3] === 255) {
                // Alpha channel = 255 ("opaque"): nuclear material here.
                pixels[i] = r
                pixels[i + 1] = g
                pixels[i + 2] = b
                pixels[i + 3] = 255
              } else {
                // No nuclear material: set to transparent.
                pixels[i + 3] = 0
              }
            }
          } catch (err) {
            console.warn('1:', err.message)
          }

          try {
            // Write the result back onto the canvas
            context.putImageData(imgData, 0, 0)
            callback()
          } catch (err) {
            console.warn('2:', err.message)
          }
        } else {
          console.warn('imgData undefined')
        }
      } else {
        filter = null
        console.warn('Canvas width and height are 0. Setting filter to null')
      }
    }
    return filter
  }

  let getFilter1 = function () {
    // colorRanges array = [{color: "rgba(r, g, b, a)", low: n, hi: n}, {...}, etc]
    let filter1 = OpenSeadragon.Filters.GREYSCALE
    filter1.prototype.COLORLEVELS = colorRanges => (context, callback) => {
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        // Read the canvas pixels
        let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
        if (typeof imgData !== undefined) {
          try {
            const pxl = imgData.data
            let j
            for (j = 0; j < pxl.length; j += 4) {
              if (pxl[j + 3] === 255) {
                let rgba = levels(pxl[j], colorRanges) // r = g = b
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
        filter1 = null
        console.warn('Canvas width and height are 0. Setting filter to null')
      }
    }
    return filter1
  }
  return {
    getFilter: getFilter,
    getFilter1: getFilter1,
    handleColorLevels: handleColorLevels,

    getColors() {
      // Return color array defined at top of script
      return colors
    },

    getColor(num) {
      // Get color per layer num
      if (num >= colors.length) {
        // random 0 - N
        return colors[Math.floor(Math.random() * colors.length - 1)]
      } else {
        return colors[num]
      }
    },

    getLayerNumber() {
      return layerNumber
    },

    setLayerNumber(num) {
      /* PGM SETS CURRENT LAYER */
      layerNumber = num
    }
  }
}