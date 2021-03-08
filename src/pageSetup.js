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
  const rangeSliders = new Sliders()

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {
      return resolve(checkOptions(opts))
    }).then(function (opts) {
      // Create table
      const mainDiv = document.getElementById(divId)
      const table = document.createElement('table')
      table.id = 'myTable'
      mainDiv.appendChild(table)
      let r
      const num = rows * columns
      let count = 1

      for (r = 0; r < rows; r++) {
        const x = table.insertRow(r)
        let c
        for (c = 0; c < columns; c++) {
          count++
          const y = x.insertCell(c)
          const id = makeId(11) // DIV ID REQUIRED FOR OSD

          ////// CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
          let idx = count
          let container = document.createElement('div')
          container.className = 'divSquare'
          y.appendChild(container)

          const controlsDiv = document.createElement('div') // 'controls' div
          controlsDiv.className = 'controls'

          container.appendChild(controlsDiv) // add to 'container' div

          const rangeDiv = document.createElement('div') // div containing 'sliders'
          rangeDiv.className = 'range'
          controlsDiv.append(rangeDiv)

          // 2 sliders
          let sliderElements
          if (opts && options.slidersOn) {
            sliderElements = rangeSliders.createSliders(idx, rangeDiv, 2, options)
          }

          if (opts && options.toolbarOn) {
            const buttonDiv = document.createElement('div') // div containing 'buttons'
            buttonDiv.classList.add('floated')
            buttonDiv.classList.add('buttons')
            controlsDiv.append(buttonDiv)

            //// CREATE BUTTONS
            let color
            if (isRealValue(options.paintbrushColor)) {
              color = options.paintbrushColor
            } else {
              color = '#00f'
            }

            let htm = `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
      <input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;`

            if (numViewers <= 1) {
              htm = '' // There's nothing to match pan/zoom with; so leave it blank.
            }

            buttonDiv.innerHTML = htm + `<mark id="mark${idx}">${color}</mark>&nbsp;
        <button id="btnDraw${idx}" class="btn"><i class="fas fa-pencil-alt"></i> Draw polygon</button>&nbsp;
        <button id="btnEdit${idx}" class="btn"><i class="fas fa-draw-polygon"></i> Edit polygon</button>&nbsp;
        <button id="btnGrid${idx}" class="btn"><i class="fas fa-border-all"></i> Draw grid</button>&nbsp;
        <button id="btnGridMarker${idx}" class="btn"><i class="fas fa-paint-brush"></i> Mark grid</button>&nbsp;
        <button id="btnSlide${idx}" class="btn"><i class="fas fa-sliders-h"></i> Show sliders</button>&nbsp;
        <button id="btnMapMarker" class="btn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button>`
            // <button id="btnRuler${idx}" class="btn"><i class="fas fa-ruler"></i> Measure</button>&nbsp;
            //// END CREATE BUTTONS

            colorPicker(document.getElementById('mark' + idx))
          }

          if (opts && options.slidersOn) {
            rangeSliders.sliderButtonEvent(idx, sliderElements)
          }

          const viewerDiv = document.createElement('div') // 'viewer' div
          viewerDiv.id = id
          viewerDiv.style.width = width + 'px'
          viewerDiv.style.height = height + 'px'
          viewerDiv.className = 'viewer'

          container.appendChild(viewerDiv)
          viewers.push(new MultiViewer(idx, viewerDiv.id, baseImage, featureLayers, sliderElements, numViewers, options))
          ////// END

          if (numViewers < num && (count - 1 === numViewers) ) {
            // we've done our last viewer; now exit
            break
          }
        }
      }
      mainDiv.appendChild(table)

      return viewers
    }).then(function (viewers) {
      // VIEWERS CREATED; ADD DROPDOWN TO PAGE.
      // eslint-disable-next-line no-new
      new DropDown(viewers, 'selections', 'json/tcga.json')
      return viewers
    }).then(function (viewers) {
      // MULTI-VIEWER PAN/ZOOM CONTROLLER
      synchronizeViewers(viewers)
    })
  })
}
