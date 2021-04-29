/**
 * Image filtering
 */
const imageFiltering = function () {
  this.colorRanges = [{color: 'rgba(75, 0, 130, 255)', low: 201, hi: 255}]

  function filterColors(r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }

  // List of colors so segmentation overlays don't clash
  let filters = []
  filters.push(new filterColors(0, 255, 0)) // lime 00ff00
  filters.push(new filterColors(255, 255, 0)) // yellow ffff00
  filters.push(new filterColors(0, 255, 255)) // cyan 00ffff
  filters.push(new filterColors(255, 0, 0)) // red ff0000
  filters.push(new filterColors(255, 165, 0)) // orange ffa500
  filters.push(new filterColors(0, 128, 0)) // dark green 008000
  filters.push(new filterColors(0, 0, 255)) // blue 0000ff
  filters.push(new filterColors(75, 0, 130)) // indigo 4b0082
  filters.push(new filterColors(28, 28, 28)) // dark gray #1c1c1c
  filters.push(new filterColors(167, 226, 46)) // leaf green #a7e22e
  filters.push(new filterColors(31, 120, 180)) // strong blue, #1f78b4
  filters.push(new filterColors(255, 210, 4)) // goldenrod #ffd204

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
    console.log('set', colorRanges ? colorRanges.length : 'n')
    try {
      viewer.setFilterOptions({
        filters: [{
          items: viewer.world.getItemAt(1), // TODO: what layer?
          processors: [
            imageFiltering().getFilter1().prototype.COLORLEVELS(colorRanges)
          ]
        }]
      })
    } catch (err) {
      console.log('OK')
    }
  }

  // NUMBER INPUT to let user set threshold values
  function createNumericInput(data, viewer) {
    let x = document.createElement('input')
    x.id = data.id
    x.setAttribute('type', 'number')
    x.min = '0'
    x.max = '255'
    x.step = '1'
    x.value = data.val.toString()
    x.size = 5

    // this event happens whenever the value changes
    x.addEventListener('input', function () {
      let intVal = parseInt(this.value)
      // If they set it to something silly like 888, reset it to 255
      if (intVal > 255) {
        this.value = '255'
      }

      if (intVal < 0) {
        this.value = '0'
      }

      if (this.id.startsWith('low')) {
        colorRanges[data.index].low = this.value
      } else {
        colorRanges[data.index].hi = this.value
        setViewerFilter(viewer) // triggered by high value input
      }
    })

    return x
  }

  function layerButtonToggle(color, cursor) {
    jQuery("*").each(function () {
      if (this.id.startsWith('osd-overlaycanvas')) {
        let num = this.id.slice(-1) // hack to get the id #
        let z = document.getElementById('colors' + num)
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
    hex = '#' + hex

    return hex
  }

  function colorPickerEvent(colorRanges, m, i, viewer) {
    const cp = new CP(m)
    cp.on('change', function (r, g, b, a) {
      console.log('color evt setup OR color selected', viewer.id, colorRanges ? colorRanges.length : 'n')
      try {
        cp.source.value = cp.color(r, g, b, a)
        cp.source.innerHTML = cp.color(r, g, b, a)
        cp.source.style.backgroundColor = cp.color(r, g, b, a)
        colorRanges[i].color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
        setViewerFilter(viewer)
      } catch (err) {
        console.log('HERE!', err)
        console.log('viewer', viewer.id)
        if (i < 5) {
          colorRanges[i].color = `rgba(${r}, ${g}, ${b}, ${a * 255})`
          setViewerFilter(viewer)
        }
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
      m.id = 'marker' + i
      console.log('index', i)
      m.innerHTML = rgba2hex(colorCode)
      colorDiv.appendChild(m)
      colorPickerEvent(colorRanges, m, i, viewer)

      // LOW
      let lowDiv = document.createElement('div')
      let d = {
        id: 'low' + i,
        val: colorRanges[i].hi,
        // color: colorRanges[i],
        index: i
      }
      lowDiv.appendChild(createNumericInput(d, viewer))

      // HIGH
      let hiDiv = document.createElement('div')
      d = {
        id: 'hi' + i,
        val: colorRanges[i].hi,
        // color: colorRanges[i],
        index: i
      }
      hiDiv.appendChild(createNumericInput(d, viewer))

      // ADD TO CONTAINER DIV
      colorPopup.appendChild(colorDiv)
      colorPopup.appendChild(lowDiv)
      colorPopup.appendChild(hiDiv)
    }
  }

  function createPopup(event, layersBtn, viewer) {
    console.log('createPopup', viewer.id, colorRanges ? colorRanges.length : 'n')
    // Disable buttons
    layerButtonToggle('#ccc', 'not-allowed')

    // Highlight this button
    layersBtn.style.color = '#0f0'
    layersBtn.style.cursor = 'pointer'

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
      layersBtn.style.color = '#000'
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

    createUserInput(colorPopup, viewer)

    colorPopup.style.left = event.clientX + 'px'
    colorPopup.style.top = event.clientY + 'px'

    document.body.appendChild(colorPopup)

    // Make the DIV element draggable:
    dragElement(colorPopup)
  }

  return {
    getFilter: function () {
      console.log('Here in getFilter')
      let filter = OpenSeadragon.Filters.GREYSCALE
      filter.prototype.COLORIZE = function (color) {
        // console.log('color', color)
        return function (context, callback) {
          // Read the canvas pixels
          let imgData
          try {
            // w x h: 256 x 256
            imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
            if (typeof imgData !== undefined) {
              const pixels = imgData.data
              // Run the filter on them
              let i
              for (i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] === 255) {
                  // Alpha channel = 255 ("opaque"): nuclear material here.
                  pixels[i] = color.r
                  pixels[i + 1] = color.g
                  pixels[i + 2] = color.b
                  pixels[i + 3] = 255
                } else {
                  // No nuclear material: set to transparent.
                  pixels[i + 3] = 0
                }
              }
              // Write the result back onto the canvas
              context.putImageData(imgData, 0, 0)
              callback()
            }
          } catch (err) {
            console.error('COLORIZE:', err.message)
          }

        }
      }
      console.log('There.')
      return filter
    },
    getFilter1: function () {
      console.log('Here in getFilter1')
      let filter1 = OpenSeadragon.Filters.GREYSCALE
      // colorRanges array = [{color: "rgba(r, g, b, a)", low: n, hi: n}, {...}, etc]
      filter1.prototype.COLORLEVELS = function (colorRanges) {
        return function (context, callback) {
          let imgData

          if (context.canvas.width > 0 && context.canvas.height > 0) {
            imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
            try {
              const pxl = imgData.data
              let j
              for (j = 0; j < pxl.length; j += 4) {
                if (pxl[j + 3] === 255) {
                  // var v = (pxl[j] + pxl[j + 1] + pxl[j + 2]) / 3 | 0
                  let rgba = levels(pxl[j], colorRanges) // r = g = b
                  if (typeof rgba === 'undefined') {
                    console.warn('rgba undefined', pxl[j])
                  }
                  pxl[j] = rgba[0]
                  pxl[j + 1] = rgba[1]
                  pxl[j + 2] = rgba[2]
                  pxl[j + 3] = rgba[3]
                } else {
                  pxl[j + 3] = 0
                }
              }
            } catch (err) {
              console.log('1:', err.message)
            }

            function levels(value, colors) {
              try {
                let i
                let retVal
                for (i = 0; i < colors.length; i++) {
                  let low = colors[i].low
                  let hi = colors[i].hi
                  let color = colors[i].color
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
                console.log('2:', err.message)
              }
            }

            // Input: rgba(r, g, b, a) => Output: [r, g, b, a]
            function parseColor(input) {
              return input.replace(/[a-z%\s\(\)]/g, '').split(',')
            }

            try {
              context.putImageData(imgData, 0, 0)
              callback()
            } catch (err) {
              console.log('3:', err.message)
            }
          }
          else {
            filter1 = null
            // console.log('context.canvas', context.canvas)
          }
        }
      }
      console.log('There.')
      return filter1
    },
    getLength: function () {
      return filters.length
    },
    handleColorLevels: function (layersBtn, viewer) {
      console.log('Setting up layers button evt', colorRanges ? colorRanges.length : 'n')
      console.log('For viewer', viewer.id)

      // Event handler for the layers button
      layersBtn.addEventListener('click', function (event) {
        event = event || window.event

        // Let there be only one
        let el = document.getElementById('colorPopup')
        if (!el) {
          createPopup(event, layersBtn, viewer)
        }
      })
    },
    getColor: function (num) {
      if (num >= filters.length) {
        // random 0 - N
        return filters[Math.floor(Math.random() * filters.length - 1)]
      } else {
        return filters[num]
      }
    },
    getColorRanges: function () {
      if (typeof colorRanges !== 'undefined') {
        console.log('A')
        return colorRanges
      } else if (typeof this.colorRanges !== 'undefined') {
        console.log('B')
        return this.colorRanges
      } else {
        console.error('getColorRanges')
        return [{color: 'rgba(75, 0, 130, 255)', low: 201, hi: 255}]
      }

    },
    setColorRanges: function (colors) {
      if (typeof colorRanges !== 'undefined') {
        console.log('A')
        colorRanges = colors
      } else if (typeof this.colorRanges !== 'undefined') {
        console.log('B')
        this.colorRanges = colors
      } else {
        console.error('setColorRanges')
      }
    }
  }
}
