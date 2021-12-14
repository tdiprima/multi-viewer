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

  // numViewers = 2
  // rows = 1
  // columns = 2

  function testing1() {
    // testing 1 image
    numViewers = 1
    rows = 1
    columns = 1
    images.splice(1)
    let layArr = images[0]
    if (!layArr) {
      throw 'Session is stuck in limbo. See you later!'
    }
    let layC = layArr[1].colorscheme.colors
    // we have a blue-red colormap, and i'm being sent red and blue
    for (let i = 0; i < layC.length; i++) {
      if (layC[i].color === 'rgba(255, 0, 0, 255)') {
        layC[i].color = 'rgba(255, 0, 255, 255)'
      }
      if (layC[i].color === 'rgba(0, 0, 255, 255)') {
        layC[i].color = 'rgba(0, 255, 255, 255)'
      }
    }
    // console.log('images', images)
  }
  // testing1()

  // When the 'images' parameter becomes an array with null elements,
  // it means that Halcyon timed out or is in the process of timeout.
  // So log the user out and have them start again.
  if (images[0] === null) {
    // logout & redirect
    document.write("<script>window.alert('Session timeout. Click OK to continue...');window.location=`${window.location.origin}/auth/realms/Halcyon/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;</script>");
  }

  let viewers = [] // eslint-disable-line prefer-const
  document.addEventListener('DOMContentLoaded', () => {
    new Promise(resolve => {
      return resolve(opts)
    }).then(opts => {
      // dark-mode
      let awesome = e('i', {'class': 'fas fa-moon'})
      let btnDark = e('button', {'class': 'btn'}, [awesome])

      // Slide name
      let name
      let slide = images[0][0].location // layer 0 location
      if (slide.includes('TCGA')) {
        name = `Slide: ${slide.match(/TCGA-[^%.]+/)[0]}`
      } else {
        let arr = slide.split('/')
        name = `Slide: ${arr[arr.length - 1]}`
      }

      let top = e('div', {'style': 'display: flex'}, [
        e('div', {'style': 'flex: 1'}, [btnDark]),
        e('div', {'style': 'flex: 1; text-align: right;'}, [name])
      ])

      let referenceNode = document.querySelector(`#${divId}`)
      referenceNode.before(top)

      btnDark.addEventListener('click', () => {
        toggleButton(awesome, 'fa-moon', 'fa-sun')
        document.body.classList.toggle('dark-mode')
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
<button id="btnRuler${idx}" class="btn" title="Measure in microns"><i class="fas fa-ruler"></i></button>&nbsp;
<button id="btnShare${idx}" class="btn" title="Share this link"><i class="fas fa-share-alt"></i></button>&nbsp;
<button id="btnCam${idx}" class="btn" title="Snapshot"><i class="fas fa-camera"></i></button>&nbsp;
<button id="btnBlender${idx}" class="btn" title="Blend-modes"><i class="fas fa-blender"></i></button>&nbsp;
<div class="mag" style="display: inline">
  <button class="btn">
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
<button id="btnMapMarker" class="btn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button>
</div>`

            // END
            htm += `</div></div>`
          }

          // CREATE VIEWER
          htm += `<table><tr><td><div id="${osdId}" class="viewer dropzone" style="width: ${width}px; height: ${height}px;"></div>
</td><td id="layers_and_colors${idx}" style="vertical-align: top;"></td>
</tr></table>`
// <td id="layers_and_colors${idx}" style="vertical-align: top; display: inline-block"></td>

          // ADD VIEWER & WIDGETS TO CONTAINING DIV
          container.innerHTML = htm

          // DRAW POLYGON COLOR PICKER
          const colorPicker = new CP(document.getElementById(`mark${idx}`))
          colorPicker.on('change', function (r, g, b, a) {
            this.source.value = this.color(r, g, b, a)
            this.source.innerHTML = this.color(r, g, b, a)
            this.source.style.backgroundColor = this.color(r, g, b, a)
          })

          const thisData = images[idx] // Images to be displayed in "this" viewer
          const vInfo = { 'idx': idx, 'divId': osdId, 'len': thisData.length }
          // Create MultiViewer object and add to array
          viewers.push(new MultiViewer(vInfo, thisData, numViewers, opts))
        }
      }

      return viewers
    }).then(viewers => {
      // PAN/ZOOM CONTROLLER - accepts array of MultiViewers
      synchronizeViewers(viewers)
    })
  })

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLocaleLowerCase()
    if (key === 'escape' || key === 'esc') {
      e.preventDefault()
      let buttons = document.getElementsByClassName('btnOn')
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].click()
      }
    }
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
