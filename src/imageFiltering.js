/**
 * Image filtering
 */
const imageFiltering = function () {
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

    if (document.getElementById('popupHeader')) {
      // if present, the header is where you move the DIV from:
      document.getElementById('popupHeader').onmousedown = dragMouseDown
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown
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

  // Number input to let user set low/high values
  function createInput(id, val) {
    let x = document.createElement('input')
    x.id = id
    x.setAttribute('type', 'number')
    x.min = '0'
    x.max = '255'
    x.step = '1'
    x.value = val.toString()
    x.size = 20
    return x
  }

  return {
    getFilter: function () {
      let filter = {}
      filter = OpenSeadragon.Filters.GREYSCALE
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
      return filter
    },
    getFilter1: function () {
      let filter1 = OpenSeadragon.Filters.GREYSCALE
      filter1.prototype.COLORLEVELS = function (colorRanges) {
        // colorRanges = [{color, low, high}, {...}, etc]
        return function (context, callback) {
          let imgData
          try {
            imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)

            if (typeof imgData !== undefined) {
              const pxl = imgData.data
              let j
              for (j = 0; j < pxl.length; j += 4) {
                if (pxl[j + 3] === 255) {
                  // var v = (pxl[j] + pxl[j + 1] + pxl[j + 2]) / 3 | 0
                  let rgba = levels(pxl[j], colorRanges) // r = g = b
                  pxl[j] = rgba[0]
                  pxl[j + 1] = rgba[1]
                  pxl[j + 2] = rgba[2]
                  pxl[j + 3] = rgba[3]
                } else {
                  pxl[j + 3] = 0
                }
              }

              function levels(val, cr) {
                let i
                for (i = 0; i < cr.length; i++) {
                  let low = cr[i].low
                  let hi = cr[i].hi
                  let color = cr[i].color

                  if (low === 1) {
                    if (val >= 0 && val <= hi) {
                      return parseColor(color)
                    }
                  } else {
                    if (val >= low && val <= hi) {
                      return parseColor(color)
                    }
                  }
                }
              }

              function parseColor(input) {
                return input.replace(/[a-z%\s\(\)]/g, '').split(',')
              }

              context.putImageData(imgData, 0, 0)
              callback()
            }
          } catch (err) {
            console.error('COLORLEVELS:', err.message)
          }

        }
      }
      return filter1
    },
    getHtml: function (idx) {
      return `<div><i id="colors${idx}" style="cursor: pointer;" class="fa fa-layer-group"></i></div>`
    },
    getLength: function () {
      return filters.length
    },
    handleColorLevels: function (layersBtn, viewer) {
      // COLOR RANGE POPUP
      let colorPopup

      // Layers button clicked
      layersBtn.addEventListener('click', function (event) {
        event = event || window.event

        // Main container
        colorPopup = document.createElement('div')
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
          this.parentNode.parentNode.remove()
        })
        colorPopup.appendChild(d)

        // Header to drag around screen
        const popupHeader = document.createElement('div')
        popupHeader.id = 'popupHeader'
        popupHeader.className = 'popupHeader'
        popupHeader.innerHTML = 'Color Levels'
        colorPopup.appendChild(popupHeader)
        let t = document.createElement('div')
        t.className = 'popupHeader'
        colorPopup.appendChild(t)

        // RAINBOW
        // let colorRanges = [{ color: 'rgba(255, 0, 0, 255)', low: 201, hi: 255 },
        // { color: 'rgba(255, 153, 0, 255)', low: 171, hi: 200 },
        // { color: 'rgba(255, 255, 0, 255)', low: 141, hi: 170 },
        // { color: 'rgba(1, 185, 245, 255)', low: 101, hi: 140 },
        // { color: 'rgba(0, 0, 255, 255)', low: 76, hi: 100 },
        // { color: 'rgba(135, 19, 172, 255)', low: 31, hi: 75 },
        // { color: 'rgba(255, 255, 255, 0)', low: 0, hi: 30 }]

        // WASHED-OUT, LIKE CAMIC
        let colorRanges = [{color: 'rgba(216, 63, 42, 255)', low: 201, hi: 255},
          {color: 'rgba(246, 173, 96, 255)', low: 151, hi: 200},
          {color: 'rgba(254, 251, 191, 255)', low: 101, hi: 150},
          {color: 'rgba(171, 221, 164, 255)', low: 51, hi: 100},
          {color: 'rgba(44, 131, 186, 255)', low: 0, hi: 50}]

        // CREATE USER INPUT PER COLOR
        // Display colors and low/high values
        colorRanges.forEach(function (cr, index) {
          console.log(cr)
          // COLOR DIV
          let colorDiv = document.createElement('div')
          colorDiv.id = 'color' + index
          colorDiv.style.backgroundColor = cr.color
          colorDiv.style.width = '20px'
          colorDiv.style.height = '20px'

          // LOW
          let lowDiv = document.createElement('div')
          lowDiv.appendChild(createInput('low' + index, cr.low))

          // HIGH
          let hiDiv = document.createElement('div')
          hiDiv.appendChild(createInput('hi' + index, cr.hi))

          // ADD TO CONTAINER DIV
          colorPopup.appendChild(colorDiv)
          colorPopup.appendChild(lowDiv)
          colorPopup.appendChild(hiDiv)
        })

        colorPopup.style.left = event.clientX + 'px'
        colorPopup.style.top = event.clientY + 'px'

        document.body.appendChild(colorPopup)

        let imf1 = new imageFiltering()
        let filter1 = imf1.getFilter1()
        viewer.setFilterOptions({
          filters: [{
            items: viewer.world.getItemAt(1), // TODO: Layer #
            processors: [
              filter1.prototype.COLORLEVELS(colorRanges)
            ]
          }]
        })

        // Make the DIV element draggable:
        dragElement(colorPopup)
      })
    },
    getColor: function (num) {
      if (num >= filters.length) {
        // random 0 - N
        return filters[Math.floor(Math.random() * filters.length - 1)]
      } else {
        return filters[num]
      }
    }
  }
}
