let filters = function () {
  'use strict'
  let colorRanges // User defines what color ranges go with which pixel values
  colorRanges = [{color: 'rgba(75, 0, 130, 255)', low: 201, hi: 255}]
  // let rangesCopy = [...colorRanges] // so that we can go back

  function setViewerFilter(cr, viewer) {
    try {
      let itemCount = viewer.world.getItemCount()
      let i
      let filterOpts = []
      for (i = 0; i < itemCount; i++) {
        if (i > 0) {
          filterOpts.push({
            items: viewer.world.getItemAt(i),
            processors: [
              getFilter().prototype.COLORLEVELS(cr)
            ]
          })
        }
      }
      viewer.setFilterOptions({
        filters: filterOpts,
        loadMode: 'sync'
      })

    } catch (err) {
      console.error(`setViewerFilter ${err.message}`)
      console.error('cr:', cr, 'viewer:', viewer)
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
        setError(document.getElementById('low' + i), document.getElementById('hi' + (i - 1)))
        return true
      }

      if (parseInt(arr[i - 1].low) < parseInt(arr[i].hi)) {
        setError(document.getElementById('low' + (i - 1)), document.getElementById('hi' + i))
        return true
      }

    }

    // If we reach here, then no overlap
    return false
  }

  // NUMBER INPUT to let user set threshold values
  function createNumericInput({id, val}, viewer) {
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
        setViewerFilter(colorRanges, viewer) // triggered by high value input
      }
    })
    return x
  }

  function buttonToggle(color, cursor) {
    document.querySelectorAll('[id^="palette"]').forEach(node => {
      node.style.color = color
      node.style.cursor = cursor
    })
  }

function rgba2hex(orig) {
    let a,
      arr = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (arr && arr[4] || "").trim(),
      hex = arr ?
        (arr[1] | 1 << 8).toString(16).slice(1) +
        (arr[2] | 1 << 8).toString(16).slice(1) +
        (arr[3] | 1 << 8).toString(16).slice(1) : orig;

    if (alpha !== "") {
      a = alpha;
    } else {
      a = 0x0;
    }
    a = (a | 1 << 8).toString(16).slice(1)
    hex = hex + a
    return hex
  }

  // CREATE USER INPUT PER COLOR
  function createUserInput(popupBody, viewer) {
    const table = document.createElement('table')
    popupBody.appendChild(table)

    colorRanges.forEach(function (elem, ind) {
      let tr = table.insertRow(-1)
      table.appendChild(tr)

      let td = tr.insertCell(-1)
      let colorCode = elem.color

      // COLOR PICKER
      let m = document.createElement('mark')
      m.id = `marker${ind}`
      m.innerHTML = "#" + rgba2hex(colorCode)
      m.style.backgroundColor = colorCode
      td.appendChild(m) // I hope this is right!

      // LOW
      td = tr.insertCell(-1)
      td.appendChild(createNumericInput({
        id: `low${ind}`,
        val: colorRanges[ind].low
      }, viewer))

      // HIGH
      td = tr.insertCell(-1)
      td.appendChild(createNumericInput({
        id: `hi${ind}`,
        val: colorRanges[ind].hi
      }, viewer))

    })

  }

  function createPopup(event, layersBtn, viewer) {
    // Disable buttons
    buttonToggle('#ccc', 'not-allowed')

    // Highlight *this* button
    layersBtn.style.color = '#0f0'
    layersBtn.style.cursor = 'pointer'

    colorRanges.sort((a, b) => b.low - a.low) // ORDER BY LOW DESC

    createDraggableDiv('colorPopup', 'Color Levels', event.clientX, event.clientY)

    createUserInput(document.getElementById('colorPopupBody'), viewer)

  }

  function handleColorLevels(layersBtn, viewer, cr) {
    colorRanges = cr

    // Event handler for the palette button
    layersBtn.addEventListener('click', event => {
      event = event || window.event
      // Let there be only one
      let el = document.getElementById('colorPopup')
      if (!el) {
        createPopup(event, layersBtn, viewer)
        // Setup color picker event handler
        let nodeList = document.querySelectorAll('[id^="marker"]')
        nodeList.forEach(function (_elem, ind) {
          const picker = new CP(_elem)
          picker.on('change', function (r, g, b, a) {
            this.source.value = this.color(r, g, b, a)
            this.source.style.backgroundColor = this.color(r, g, b, a)
            colorRanges[ind].color = `rgba(${r}, ${g}, ${b}, ${a * 255})` // "color picker" alpha needs to be 1.  "osd" alpha needs to be 255.
            setViewerFilter(cr, viewer)
          })
        })
      }
    })
  }

  let getFilter = function () {
    // colorRanges array = [{color: "rgba(r, g, b, a)", low: n, hi: n}, {...}, etc]
    let filter = OpenSeadragon.Filters.GREYSCALE
    filter.prototype.COLORLEVELS = colorRanges => (context, callback) => {
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
        filter = null
        console.warn('Canvas width and height are 0. Setting filter to null')
      }
    }
    return filter
  }
  return {
    getFilter: getFilter,
    setViewerFilter: setViewerFilter,
    handleColorLevels: handleColorLevels,
  }
}
