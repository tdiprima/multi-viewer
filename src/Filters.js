class Filters {
  constructor() {
    console.log('THIS', this)
    this.colorRanges = [{color: 'rgba(75, 0, 130, 255)', low: 201, hi: 255}]
    // _modifiedColors
    this.layerNumber = 1
    this.colors = [new filterColors(0, 255, 0),
      new filterColors(0, 255, 0),
      new filterColors(255, 255, 0),
      new filterColors(0, 255, 255),
      new filterColors(255, 0, 0),
      new filterColors(255, 165, 0),
      new filterColors(0, 128, 0),
      new filterColors(0, 0, 255),
      new filterColors(75, 0, 130),
      new filterColors(28, 28, 28),
      new filterColors(167, 226, 46),
      new filterColors(31, 120, 180),
      new filterColors(255, 210, 4)]
  }

  // sortIt(cr) {
  //   // sort by low, desc
  //   cr.sort(a, b, function () {
  //     if (a.low > b.low) return -1
  //     if (a.low < b.low) return 1
  //   })
  // }

  // Function to help drag popup around screen
  dragElement(elmnt) {
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
      // call a whenever the cursor moves:
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

  // NUMBER INPUT to let user set threshold values
  createNumericInput({id, val, index}, viewer, layerNumber, colorRanges) {
    let x = document.createElement('input')
    x.id = id
    x.setAttribute('type', 'number')
    x.min = '0'
    x.max = '255'
    x.step = '1'
    x.value = val.toString()
    x.size = 5

    // this event happens whenever the value changes
    x.addEventListener('input', function () {
      let intVal = parseInt(this.value)

      // If they set it to something outside of 0-255, reset it
      if (intVal > 255) this.value = '255'
      if (intVal < 0) this.value = '0'

      if (x.id.startsWith('low')) {
        colorRanges[index].low = parseInt(this.value)
      } else {
        colorRanges[index].hi = parseInt(this.value)
        setViewerFilter(viewer, colorRanges, layerNumber) // triggered by high value input
      }
    })

    return x
  }

  rgba2hex(orig) {
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

  colorPickerEvent(mark, idx, viewer) {
    const cp = new CP(mark)

    cp.on('change', (r, g, b, a) => {
      try {
        cp.source.value = cp.color(r, g, b, a)
        cp.source.innerHTML = cp.color(r, g, b, a)
        cp.source.style.backgroundColor = cp.color(r, g, b, a)
        this.colorRanges[idx].color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
        setViewerFilter(viewer, this.colorRanges, this.layerNumber)
      } catch (err) {
        console.warn('check this:', err.message)
      }
    })
  }

  // CREATE USER INPUT PER COLOR
  // Display colors and low/high values
  // {color: "rgba(r, g, b, a)", hi: n, low: n}
  createUserInput(colorPopup, viewer) {
    let i
    for (i = 0; i < this.colorRanges.length; i++) {
      // COLOR DIV
      let colorDiv = document.createElement('div')
      let colorCode = this.colorRanges[i].color

      // COLOR PICKER
      let m = document.createElement('mark')
      m.id = `marker${i}`
      m.innerHTML = this.rgba2hex(colorCode)
      colorDiv.appendChild(m)
      this.colorPickerEvent(m, i, viewer)

      // LOW
      let lowDiv = document.createElement('div')
      let d = {
        id: `low${i}`,
        val: this.colorRanges[i].low,
        index: i
      }
      lowDiv.appendChild(this.createNumericInput(d, viewer, this.layerNumber, this.colorRanges))

      // HIGH
      let hiDiv = document.createElement('div')
      d = {
        id: `hi${i}`,
        val: this.colorRanges[i].hi,
        index: i
      }
      hiDiv.appendChild(this.createNumericInput(d, viewer, this.layerNumber, this.colorRanges))

      // ADD TO CONTAINER DIV
      colorPopup.appendChild(colorDiv)
      colorPopup.appendChild(lowDiv)
      colorPopup.appendChild(hiDiv)
    }
  }

  createPopup({clientX, clientY}, {style}, viewer) {
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
      img.parentNode.parentNode.remove()
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
    // this.sortIt(this.colorRanges)

    // UI
    this.createUserInput(colorPopup, viewer)

    // put it where user clicked
    colorPopup.style.left = `${clientX}px`
    colorPopup.style.top = `${clientY}px`

    document.body.appendChild(colorPopup)

    // Make DIV element draggable:
    this.dragElement(colorPopup)
  }

  handleColorLevels(layersBtn, viewer) {
    // Event handler for the layers button
    layersBtn.addEventListener('click', event => {
      event = event || window.event

      // Let there be only one
      let el = document.getElementById('colorPopup')
      if (!el) {
        this.createPopup(event, layersBtn, viewer)
      }
    })
  }

  getColors = () => {
    // Return color array defined at top of script
    return this.colors
  }

  getColor = (num) => {
    // Get color per layer num
    if (num >= this.colors.length) {
      // random 0 - N
      return this.colors[Math.floor(Math.random() * this.colors.length - 1)]
    } else {
      return this.colors[num]
    }
  }

  getColorRanges = () => {
    return this.colorRanges
  }

  setColorRanges = (cr) => {
    /* USER DEFINES WHICH COLORS GO WITH WHAT NUMERIC RANGES OF PIXEL VALUES */
    this.colorRanges = cr
  }

  getLayerNumber = () => {
    return this.layerNumber
  }

  setLayerNumber = (num) => {
    /* PGM SETS CURRENT LAYER */
    this.layerNumber = num
  }

}

getFilter1 = () => {
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

getFilter = () => {
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

function setViewerFilter(viewer, colorRanges, layerNumber) {
  try {
    viewer.setFilterOptions({
      filters: [{
        items: viewer.world.getItemAt(layerNumber === 0 ? 1 : layerNumber),
        processors: [
          getFilter1().prototype.COLORLEVELS(colorRanges)

        ]
      }]
    })
  } catch (err) {
    console.log('OK', err.message)
  }
}

class filterColors {
  constructor(r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }
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

