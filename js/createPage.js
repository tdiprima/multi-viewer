// Page Module
// eslint-disable-next-line no-unused-vars
const Page = function () {
  return {
    createDivs: function (idx, numDivs, viewers, rangeSliders, options) {
      let name
      // eslint-disable-next-line no-undef
      const opts = isRealValue(options)
      if (!opts) {
        // This has been error-trapped & corrected prior to this point. But...
        console.warn('createPage.js: options is undefined; please check.', options)
        return false
      }

      const container = document.createElement('div')
      container.className = 'divSquare'
      document.body.appendChild(container)

      name = 'controls'
      const controlsDiv = document.createElement('div') // 'controls' div
      controlsDiv.id = name
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

        this.createButtons(idx, buttonDiv, numDivs, options)

        colorPicker(document.getElementById('mark' + idx)) // eslint-disable-line no-undef
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

      viewers.push(new ImageViewer('viewer' + idx, sliderElements, numDivs, options)) // eslint-disable-line no-undef

      // Clear:both between rows
      if (idx % 2 === 0) {
        const div = document.createElement('div')
        div.style.clear = 'both'
        document.body.appendChild(div)
      }
    },
    createButtons: function (idx, div, numDivs, options) {
      let color
      // eslint-disable-next-line no-undef
      if (isRealValue(options.paintbrushColor)) {
        color = options.paintbrushColor
      } else {
        color = '#00f'
      }

      let htm = `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
    <input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;`

      if (numDivs <= 1) {
        htm = '' // There's nothing to match pan/zoom with; so leave it blank.
      }

      div.innerHTML = htm + `<mark id="mark${idx}">${color}</mark>&nbsp;
        <button id="btnDraw${idx}" class="btn"><i class="fa fa-pencil-alt"></i> Draw polygon</button>&nbsp;
        <button id="btnEdit${idx}" class="btn"><i class="fa fa-draw-polygon"></i> Edit polygon</button>&nbsp;
        <button id="btnGrid${idx}" class="btn"><i class="fa fa-border-all"></i> Draw grid</button>&nbsp;
        <button id="btnGridMarker${idx}" class="btn"><i class="fa fa-paint-brush"></i> Mark grid</button>&nbsp;
        <button id="btnSlide${idx}" class="btn"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;
        <button id="btnMapMarker" class="btn" style="display: none"><i class="fa fa-map-marker-alt"></i> Hide markers</button>
    </a>`
    }
  }
}
