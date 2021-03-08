/**
 * viewerDiv module: Functions that create divs and buttons for each viewer.
 */
const viewerDiv = function () {
  return {
    /**
     * createDiv
     * Create osd viewer divs.
     *
     * @param mainDivId:
     * @param idx: Current viewer index.
     * @param numViewers: Total number of viewers.
     * @param viewersArray: (we need to pass this information back & forth)
     * @param baseImage
     * @param featureLayers
     * @param rangeSliders:
     * @param options: Filters, paintbrush, sliders, etc.
     */
    createDiv: function (mainDivId, idx, numViewers, viewersArray, baseImage, featureLayers, rangeSliders, options) {
      let name
      const opts = isRealValue(options)
      if (!opts) {
        // This has been error-trapped & corrected prior to this point. But...
        console.warn('viewerDiv.js: options is undefined; please check.', options)
        return false
      }

      let main = document.getElementById(mainDivId)
      let container = document.createElement('div')
      container.className = 'divSquare'
      main.appendChild(container)

      name = 'controls'
      const controlsDiv = document.createElement('div') // 'controls' div
      controlsDiv.className = name

      container.appendChild(controlsDiv) // add to 'container' div

      name = 'range'
      const rangeDiv = document.createElement('div') // div containing 'sliders'
      rangeDiv.className = name
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

        this.createButtons(idx, buttonDiv, numViewers, options)

        colorPicker(document.getElementById('mark' + idx))
      }

      if (opts && options.slidersOn) {
        rangeSliders.sliderButtonEvent(idx, sliderElements)
      }

      name = 'viewer'
      const viewerDiv = document.createElement('div') // 'viewer' div
      viewerDiv.id = name + idx
      viewerDiv.className = name
      // viewerDiv.innerHTML = name;

      container.appendChild(viewerDiv)

      viewersArray.push(new MultiViewer(idx, viewerDiv.id, baseImage, featureLayers, sliderElements, numViewers, options))

      // Clear:both between rows
      if (idx % 2 === 0) {
        const div = document.createElement('div')
        div.style.clear = 'both'
        container.appendChild(div)
      }
    },
    /**
     * createButtons
     * Functionality for each viewer.
     *
     * @param idx: The current viewer index.
     * @param div: The div element object.
     * @param numViewers: Total number of viewers.
     * @param options: Filters, paintbrush, sliders, etc.
     */
    createButtons: function (idx, div, numViewers, options) {
      // console.log(idx, div, numViewers, options)
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

      div.innerHTML = htm + `<mark id="mark${idx}">${color}</mark>&nbsp;
        <button id="btnDraw${idx}" class="btn"><i class="fas fa-pencil-alt"></i> Draw polygon</button>&nbsp;
        <button id="btnEdit${idx}" class="btn"><i class="fas fa-draw-polygon"></i> Edit polygon</button>&nbsp;
        <button id="btnGrid${idx}" class="btn"><i class="fas fa-border-all"></i> Draw grid</button>&nbsp;
        <button id="btnGridMarker${idx}" class="btn"><i class="fas fa-paint-brush"></i> Mark grid</button>&nbsp;
        <button id="btnSlide${idx}" class="btn"><i class="fas fa-sliders-h"></i> Show sliders</button>&nbsp;
        <button id="btnMapMarker" class="btn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button>`
      // <button id="btnRuler${idx}" class="btn"><i class="fas fa-ruler"></i> Measure</button>&nbsp;
    }
  }
}
