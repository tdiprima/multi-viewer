/**
 * pageSetup
 * Set up web page for multi-viewer.
 * @param divId: Main div id.
 * @param images: Items to be displayed in viewer.
 * @param numViewers: Total number of viewers.
 * @param rows: LAYOUT: Number of rows (of viewers)
 * @param columns: LAYOUT: Number of columns (of viewers)
 * @param width: Viewer width
 * @param height: Viewer height
 * @param opts: Multi-viewer options; paintbrush, etc.
 */
const pageSetup = (divId, images, numViewers, rows, columns, width, height, opts) => {
  //numViewers = 1
  //rows = 1
  //columns = 1

  // When the 'images' parameter becomes an array with null elements,
  // it means that the session timed out or is in the process of timeout.
  // So log the user out and have them start again.
  if (!isRealValue(images) || (images.length >= 1 && images[0] === null)) {
    // logout & redirect
    document.write("<script>window.alert('Session timeout. Click OK to continue...');window.location=`${window.location.origin}/auth/realms/Halcyon/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;</script>")
  }

  let viewers = [] // eslint-disable-line prefer-const
  document.addEventListener('DOMContentLoaded', () => {
    new Promise(resolve => {
      return resolve(opts)
    }).then(opts => {
      document.body.classList.add('theme--default')
      // dark-mode
      let awesome = e('i', {'class': 'fas fa-moon moon'})

      // Slide name
      let name
      let slide = images[0][0].location // layer 0 location
      if (slide.includes('TCGA')) {
        const str = slide.match(/TCGA-[^%.]+/)[0]
        name = `Slide: ${str}`
      } else {
        const arr = slide.split('/')
        name = `Slide: ${arr[arr.length - 1]}`
      }

      let top = e('div', {'style': 'display: flex'}, [
        e('div', {'style': 'flex: 1'}, [awesome]),
        e('div', {'style': 'flex: 1; text-align: right;'}, [name])
      ])

      let referenceNode = document.querySelector(`#${divId}`)
      referenceNode.before(top)

      awesome.addEventListener('click', () => {
        toggleButton(awesome, 'fa-moon', 'fa-sun')
        toggleButton(awesome, 'moon', 'sun')
        document.body.classList.toggle('theme--dark')
      })

      // CREATE TABLE FOR VIEWERS
      const mainDiv = document.getElementById(divId)
      const table = e('table', {'id': 'myTable'})
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

          if (numViewers < num && (count - 1 === numViewers)) {
            // we've done our last viewer
            break
          }

          let container = e('div', {'class': 'divSquare'})
          container.style.width = `${width}px`
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
            htm += '<div class="floated">'

            if (opts && opts.paintbrushColor) {
              htm += `<mark id="mark${idx}">${opts.paintbrushColor}</mark>&nbsp;`
            } else {
              htm += `<mark id="mark${idx}">#00f</mark>&nbsp;`
            }

            htm += `<button id="btnDraw${idx}" class="btn hover-light" title="Draw"><i class="fas fa-pencil-alt"></i></button>&nbsp;
<button id="btnEdit${idx}" class="btn hover-light" title="Edit"><i class="fas fa-draw-polygon"></i></button>&nbsp;
<button id="btnGrid${idx}" class="btn hover-light" title="Grid"><i class="fas fa-border-all"></i></button>&nbsp;
<button id="btnGridMarker${idx}" class="btn hover-light" title="Mark grid"><i class="fas fa-paint-brush"></i></button>&nbsp;
<button id="btnRuler${idx}" class="btn hover-light" title="Measure in microns"><i class="fas fa-ruler"></i></button>&nbsp;
<button id="btnShare${idx}" class="btn hover-light" title="Share this link"><i class="fas fa-share-alt"></i></button>&nbsp;
<button id="btnCam${idx}" class="btn hover-light" title="Snapshot"><i class="fas fa-camera"></i></button>&nbsp;
<button id="btnBlender${idx}" class="btn hover-light" title="Blend-modes"><i class="fas fa-blender"></i></button>&nbsp;
<button id="btnCrosshairs${idx}" class="btn hover-light" title="Crosshairs"><i class="fas fa-crosshairs"></i></button>&nbsp;
<button id="btnSave${idx}" class="btn hover-light" title="Save"><i class="fas fa-save"></i></button>&nbsp;
<div class="mag" style="display: inline">
  <button class="btn hover-light">
  <i class="fas fa-search"></i>
  </button>
  <div class="mag-content">
    <a href="#" data-value="0.025" id="1">1x</a>
    <a href="#" data-value="0.05" id="2">2x</a>
    <a href="#" data-value="0.1" id="4">4x</a>
    <a href="#" data-value="0.2" id="8">8x</a>
    <a href="#" data-value="0.25" id="10">10x</a>
    <a href="#" data-value="0.5" id="20">20x</a>
    <a href="#" data-value="1.0" id="40">40x</a>
  </div>
</div>
<button id="btnMapMarker" class="btn hover-light" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button>
</div>`

            // END
            htm += '</div></div>'
          }

          // CREATE VIEWER
          htm += `<table><tr><td><div id="${osdId}" class="viewer dropzone" style="width: ${width}px; height: ${height}px;"></div>
</td><td id="layersAndColors${idx}" style="vertical-align: top;"></td>
</tr></table>`
          // <td id="layersAndColors${idx}" style="vertical-align: top; display: inline-block"></td>

          // ADD VIEWER & WIDGETS TO CONTAINING DIV
          container.innerHTML = htm

          // DRAW POLYGON COLOR PICKER
          const colorPicker = new CP(document.getElementById(`mark${idx}`))
          colorPicker.on('change', function (r, g, b, a) {
            this.source.value = this.color(r, g, b, a)
            this.source.innerHTML = this.color(r, g, b, a)
            this.source.style.backgroundColor = this.color(r, g, b, a)
          })

          const vInfo = { 'idx': idx, 'osdId': osdId, 'layers': images[idx]}
          // Create MultiViewer object and add to array
          viewers.push(new MultiViewer(vInfo, numViewers, opts))
        }
      }

      return viewers
    }).then(viewers => {
      // PAN/ZOOM CONTROLLER - accepts array of MultiViewers
      synchronizeViewers(viewers)
    })
  })

  // Hot keys
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLocaleLowerCase()
    // esc: means 'Forget what I said I wanted to do!'; 'Clear'.
    if (key === 'escape' || key === 'esc') {
      e.preventDefault()
      // Button-reset
      let buttons = document.getElementsByClassName('btnOn')
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].click()
      }
    }
    // control-r for 'ruler'
    if (e.ctrlKey && key === 'r') {
      e.preventDefault()
      for (let i = 0; i < viewers.length; i++) {
        document.querySelectorAll('[id^="btnRuler"]').forEach(node => {
          node.click()
        })
      }
    }
  })

}
