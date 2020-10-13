// eslint-disable-next-line no-unused-vars
const pageSetup = function (numDivs, prod1, sourceImages, options1) {
  let prod
  let viewers = [] // eslint-disable-line prefer-const
  const rangeSliders = new Sliders() // eslint-disable-line no-undef

  document.addEventListener('DOMContentLoaded', function () {
    prod = prod1

    new Promise(function (resolve, reject) {
      const options = checkOptions(options1) // eslint-disable-line no-undef
      return resolve(options)
    }).then(function (options) {
      // Create divs
      for (let idx = 1; idx <= numDivs; idx++) {
        createDivs(idx, numDivs, viewers, rangeSliders, options)
      }
      return viewers
    }).then(function (viewers) {
      // Viewers created; add dropdown to page
      dropdown(viewers, 'selections', 'json/tcga.json') // eslint-disable-line no-undef
      return viewers
    }).then(function (viewers) {
      // Pan zoom controller
      synchronizeViewers(viewers) // eslint-disable-line no-undef
    }).then(function (result) {
      function test () {
        // TESTING
        viewers.forEach(function (elem) {
          elem.getViewer().open(sourceImages[0]) // <- open()
        })
      }

      function live () {
        // Set viewer source
        viewers.forEach(function (elem) {
          elem.setSources(sourceImages, [1.0, 1.0]) // <- setSources()
        })
      }

      if (prod) {
        live()
      } else {
        test()
      }
    })
  })
}

const createDivs = function (idx, numDivs, viewers, rangeSliders, options) {
  let name

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
  if (options.slidersOn) {
    sliderElements = rangeSliders.createSliders(idx, rangeDiv, 2, options)
  }

  if (options.toolbarOn) {
    const buttonDiv = document.createElement('div') // div containing 'buttons'
    buttonDiv.classList.add('floated')
    buttonDiv.classList.add('buttons')
    controlsDiv.append(buttonDiv)

    createButtons(idx, buttonDiv, numDivs, options)

    colorPicker(document.getElementById('mark' + idx)) // eslint-disable-line no-undef
  }

  if (options.slidersOn) {
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
}

const createButtons = function (idx, div, numDivs, options) {
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
    htm = ''
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
