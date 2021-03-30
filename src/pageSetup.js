/**
 * pageSetup
 * Set up web page for multi-viewer.
 *
 * @param divId: Main div id.
 * @param image: Base image.
 * @param features: Array of features (feature layers).
 * @param numViewers: Total number of viewers.
 * @param rows: LAYOUT: Number of rows (of viewers)
 * @param columns: LAYOUT: Number of columns (of viewers)
 * @param width: Viewer width
 * @param height: Viewer height
 * @param opts: Multi-viewer options; filters, paintbrush, sliders, etc.
 */
const pageSetup = function (divId, image, features, numViewers, rows, columns, width, height, opts) {

  let viewers = [] // eslint-disable-line prefer-const
  let sliderIdNum = 0

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {
      // Check/fix the options we were given
      return resolve(checkOptions(opts))

    }).then(function (opts) {
      // Create table for viewers
      const mainDiv = document.getElementById(divId)
      const table = document.createElement('table')
      table.id = 'myTable'
      mainDiv.appendChild(table)
      let slider1, slider2

      // Create rows & columns
      let r
      const num = rows * columns
      let count = 0
      for (r = 0; r < rows; r++) {
        const x = table.insertRow(r)
        let c
        for (c = 0; c < columns; c++) {
          count++
          const y = x.insertCell(c)
          const id = makeId(11) // DIV ID REQUIRED FOR OSD

          ////// CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
          let idx = count
          let container = document.createElement('div') // Viewer + tools
          container.className = 'divSquare'
          container.style.width = width + 'px'
          y.appendChild(container)

          // Start building html
          let htm = ''
          if (numViewers >= 1) {
            htm += `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
<input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`
          }

          if (opts && opts.toolbarOn) {
            htm += `<span class="controls" id="hideTools${idx}" style="color:blue; cursor:pointer;">[+] </span><BR>
<span id="tools${idx}" hidden=true>`

            if (opts && opts.slidersOn) {
              slider1 = sliderIdNum += 1
              slider2 = sliderIdNum += 1

              htm += `<span class="range">
<input type="range" id="sliderRange${slider1}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
<input type="range" id="sliderRange${slider2}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
</span>`
            }

            htm += `<span class="floated buttons">`


            if (opts && opts.paintbrushColor) {
              htm += `<mark id="mark${idx}">${opts.paintbrushColor}</mark>&nbsp;`
            } else {
              htm += `<mark id="mark${idx}">#00f</mark>&nbsp;`
            }

            htm += `<button id="btnDraw${idx}" class="btn"><i class="fas fa-pencil-alt"></i> Draw polygon</button>&nbsp;
<button id="btnEdit${idx}" class="btn"><i class="fas fa-draw-polygon"></i> Edit polygon</button>&nbsp;
<button id="btnGrid${idx}" class="btn"><i class="fas fa-border-all"></i> Draw grid</button>&nbsp;
<button id="btnGridMarker${idx}" class="btn"><i class="fas fa-paint-brush"></i> Mark grid</button>&nbsp;
<button id="btnMapMarker" class="btn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button></div>`

            // End div, class controls
            htm += `</span></span>`
          }
          // End toolbar

          // Create viewer
          htm += `<div id="${id}" className="viewer" style="width: ${width}px; height: ${height}px;"></div>`

          // Add to the 'container'
          container.innerHTML = htm

          // Show/hide event handler
          let toggle = document.getElementById('hideTools' + idx)
          let tools = document.getElementById('tools' + idx)
          toggle.addEventListener('click', function () {
            if (tools.hidden) {
              tools.hidden = false
              this.textContent = '[-] '
              this.style.color = "maroon"
            } else {
              tools.hidden = true
              this.textContent = '[+] '
              this.style.color = "blue"
            }
          })

          // Now that our widget is on the page, create colorPicker
          colorPicker(document.getElementById('mark' + idx))

          let sliderElements = []
          try {
            sliderElements.push(document.getElementById('sliderRange' + slider1))
            sliderElements.push(document.getElementById('sliderRange' + slider2))
          } catch (e) {
            console.log(e)
          }

          viewers.push(new MultiViewer(idx, id, image, features, sliderElements, numViewers, opts))

          if (numViewers < num && (count - 1 === numViewers)) {
            // we've done our last viewer; now exit
            break
          }
        }
      }
      mainDiv.appendChild(table)

      return viewers
    }).then(function (viewers) {
      // MULTI-VIEWER PAN/ZOOM CONTROLLER
      synchronizeViewers(viewers)
    })
  })
}
