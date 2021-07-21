/**
 * pageSetup
 * Set up web page for multi-viewer.
 * @param divId: Main div id.
 * @param itemsToBeDisplayed
 * @param numViewers: Total number of viewers.
 * @param rows: LAYOUT: Number of rows (of viewers)
 * @param columns: LAYOUT: Number of columns (of viewers)
 * @param width: Viewer width
 * @param height: Viewer height
 * @param opts: Multi-viewer options; paintbrush, etc. TODO: revisit options.
 */
const pageSetup = function (divId, itemsToBeDisplayed, numViewers, rows, columns, width, height, opts) {
  let viewers = [] // eslint-disable-line prefer-const
  let styles = [
    'color: #5efe18',
    'background: #fcfc0d',
    'font-size: 30px',
    'border: 1px solid #ff2722',
    'text-shadow: 2px 2px #ff2722',
    'padding: 6px',
    'border-radius:5px'
  ].join(';')
  console.log('%cMulti-Viewer', styles);

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {
      return resolve(opts)
    }).then(function (opts) {
      // quick little dark-mode
      let btnDark = document.createElement('button')
      // btnDark.innerHTML = 'Toggle Dark Mode'
      btnDark.className = 'btn'
      // <i class="fas fa-light-switch"></i>
      let awesome = document.createElement('i')
      awesome.classList.add('fas')
      awesome.classList.add('fa-moon')
      // btnDark.classList.add('btn')
      btnDark.appendChild(awesome)
      let referenceNode = document.querySelector('#contentDiv');
      referenceNode.before(btnDark)
      btnDark.addEventListener('click', function () {
        toggleButton(awesome, 'fa-moon', 'fa-sun')
        document.body.classList.toggle("dark-mode")

      })

      // CREATE TABLE FOR VIEWERS
      const mainDiv = document.getElementById(divId)
      const table = document.createElement('table')
      // table.style.border = '1px solid black'
      table.id = 'myTable'
      mainDiv.appendChild(table) // TABLE ADDED TO PAGE

      // CREATE ROWS & COLUMNS
      let r
      const num = rows * columns
      let count = 0
      for (r = 0; r < rows; r++) {
        const tr = table.insertRow(r)
        let c
        for (c = 0; c < columns; c++) {
          const td = tr.insertCell(c)
          const osdId = makeId(11) // DIV ID REQUIRED FOR OSD
          // CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
          let idx = count
          count++
          let container = document.createElement('div') // Viewer + tools
          container.className = 'divSquare'
          container.style.width = width + 'px'
          td.appendChild(container) // ADD CONTAINER TO CELL

          let htm = ''

          // NAVIGATION TOOLS
          if (numViewers > 1) {
            htm += `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
<input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`
          }

          if (opts && opts.toolbarOn) {
            htm += `<div class="controls showDiv" id="hideTools${idx}"><div id="tools${idx}" class="showHover">`

            // ANNOTATION TOOLS
            htm += `<div class="floated buttons">`

            if (opts && opts.paintbrushColor) {
              htm += `<mark id="mark${idx}">${opts.paintbrushColor}</mark>&nbsp;`
            } else {
              htm += `<mark id="mark${idx}">#00f</mark>&nbsp;`
            }

            htm += `<button id="btnDraw${idx}" class="btn" title="Draw"><i class="fas fa-pencil-alt"></i></button>&nbsp;
<button id="btnEdit${idx}" class="btn" title="Edit"><i class="fas fa-draw-polygon"></i></button>&nbsp;
<button id="btnGrid${idx}" class="btn" title="Grid"><i class="fas fa-border-all"></i></button>&nbsp;
<button id="btnGridMarker${idx}" class="btn" title="Mark grid"><i class="fas fa-paint-brush"></i></button>&nbsp;
<button id="btnRuler${idx}" class="btn" title="Ruler"><i class="fas fa-ruler"></i></button>&nbsp;
<button id="btnBlender${idx}" class="btn" title="Blend-modes"><i class="fas fa-blender"></i></button>&nbsp;
<button id="btnMapMarker" class="btn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button></div>`

            // END
            htm += `</div></div>`
          }

          // CREATE VIEWER
          htm += `<table><tr><td><div id="${osdId}" class="viewer drop_site" style="width: ${width}px; height: ${height}px;"></div>
</td><td style="vertical-align: top;"><span id="layers_and_colors${idx}"></span></td>
</tr></table>`

          // ADD VIEWER & WIDGETS TO CONTAINING DIV
          container.innerHTML = htm

          // DRAW POLYGON COLOR PICKER
          const colorPicker = new CP(document.getElementById('mark' + idx))
          colorPicker.on('change', function (r, g, b, a) {
            this.source.value = this.color(r, g, b, a)
            this.source.innerHTML = this.color(r, g, b, a)
            this.source.style.backgroundColor = this.color(r, g, b, a)
          })

          let thisData = itemsToBeDisplayed[idx] // Images to be displayed in "this" viewer
          // console.log('pageSetup', idx, thisData)

          // Create MultiViewer object and add to array
          viewers.push(new MultiViewer({"idx": idx, "divId": osdId}, thisData, numViewers, opts))

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
