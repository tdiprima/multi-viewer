/**
 * pageSetup
 * Set up web page for multi-viewer.
 *
 * @param divId: Main div id.
 * @param image: Base image.
 * @param features: Array of features (feature layers).
 * @param opacity: Array of features opacities.
 * @param numViewers: Total number of viewers.
 * @param rows: LAYOUT: Number of rows (of viewers)
 * @param columns: LAYOUT: Number of columns (of viewers)
 * @param width: Viewer width
 * @param height: Viewer height
 * @param opts: Multi-viewer options; filters, paintbrush, sliders, etc.
 */
const pageSetup = function (divId, image, features, opacity, numViewers, rows, columns, width, height, opts) {

  let viewers = [] // eslint-disable-line prefer-const
  let sliderIdNum = 0

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {
      return resolve(opts)

    }).then(function (opts) {
      // CREATE TABLE FOR VIEWERS
      const mainDiv = document.getElementById(divId)
      const table = document.createElement('table')
      table.id = 'myTable'
      mainDiv.appendChild(table) // TABLE ADDED TO PAGE
      let slider1, slider2

      // CREATE ROWS & COLUMNS
      let r
      const num = rows * columns
      let count = 0
      for (r = 0; r < rows; r++) {
        const tr = table.insertRow(r)
        let c
        for (c = 0; c < columns; c++) {
          count++
          const td = tr.insertCell(c)
          const osdId = makeId(11) // DIV ID REQUIRED FOR OSD
          let f1 = makeId(5)
          let f2 = makeId(5)
          let f3 = makeId(5)
          let f4 = makeId(5)
          // CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
          let idx = count
          let container = document.createElement('div') // Viewer + tools
          container.className = 'divSquare'
          container.style.width = width + 'px'
          td.appendChild(container) // ADD CONTAINER TO CELL

          // NAVIGATION TOOLS
          let htm = ''
          if (numViewers > 1) {
            htm += `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
<input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`
          }

          if (opts && opts.toolbarOn) {
            // SHOW / HIDE TOOLBAR
            htm += `<span class="controls" id="hideTools${idx}" style="color:blue; cursor:pointer;">[+] </span><BR>
<span id="tools${idx}" hidden=true>`

            // SLIDERS
            if (opts && opts.slidersOn) {
              slider1 = sliderIdNum += 1
              slider2 = sliderIdNum += 1

              htm += `<span class="range">
<input type="range" id="sliderRange${slider1}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
<input type="range" id="sliderRange${slider2}" min="0" max="100" value="100" class="slider-square" style="display: inline;">
</span>`
            }

            // ANNOTATION TOOLS
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

            // END
            htm += `</span></span>`
          }

          // DRAGGABLE LAYERS
          if (opts && opts.draggableLayers) {
            htm += `<div class="tab" id="tabBox${idx}">`

            if (idx === 1) {
              // TODO: DEV ONLY; ELSE USE something else
              htm += `<button class="tab_links" id="feat${f1}" draggable="true">Feat 1</button>
          <button class="tab_links" id="feat${f2}" draggable="true">Feat 2</button>`
            } else {
              htm += `<button class="tab_links" id="feat${f3}" draggable="true">Feat 3</button>
          <button class="tab_links" id="feat${f4}" draggable="true">Feat 4</button>`
            }

            htm += `&nbsp;</div>`
          }

          // CREATE VIEWER
          htm += `<div id="${osdId}" class="viewer" style="width: ${width}px; height: ${height}px;"></div>`

          // ADD VIEWER & WIDGETS TO CONTAINING DIV
          container.innerHTML = htm

          // EVENT HANDLER - Show / Hide
          if (opts && opts.toolbarOn) {
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

            // ADD FUNCTIONALITY - colorPicker
            colorPicker(document.getElementById('mark' + idx))
          }

          // NEED TO PASS THESE TO VIEWER
          let sliderElements = []
          try {
            sliderElements.push(document.getElementById('sliderRange' + slider1))
            sliderElements.push(document.getElementById('sliderRange' + slider2))
          } catch (e) {
            console.log(e)
          }

          // ADD A MultiViewer OBJECT TO ARRAY
          viewers.push(new MultiViewer(idx, osdId, image, features, opacity, sliderElements, numViewers, opts))

          if (numViewers < num && (count - 1 === numViewers)) {
            // we've done our last viewer
            break
          }
        }
      }

      return viewers
    }).then(function (viewers) {
      // PAN/ZOOM CONTROLLER - accepts array of MultiViewers
      synchronizeViewers(viewers)
    })
  })
}
