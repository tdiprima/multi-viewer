let sliderIdNum = 0

const pageSetup = function (numDivs, prod1, sourceImages, options1) {
  let prod
  let viewers = [] // eslint-disable-line prefer-const

  document.addEventListener('DOMContentLoaded', function () {
    prod = prod1

    new Promise(function (resolve, reject) {
      const options = checkOptions(options1)
      return resolve(options)
    }).then(function (options) {
      // Create divs
      for (let idx = 1; idx <= numDivs; idx++) {
        createDivs(idx, numDivs, viewers, options)
      }
      return viewers
    }).then(function (viewers) {
      // Viewers created; add dropdown to page
      dropdown(viewers, 'selections', 'json/tcga.json')
      return viewers
    }).then(function (viewers) {
      // Pan zoom controller
      synchronizeViewers(viewers)
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

const createDivs = function (idx, numDivs, viewers, options) {
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
  let sliders
  if (options.slidersOn) {
    sliders = createSliders(idx, rangeDiv, 2, options)
  }

  if (options.toolbarOn) {
    const buttonDiv = document.createElement('div') // div containing 'buttons'
    buttonDiv.classList.add('floated')
    buttonDiv.classList.add('buttons')
    controlsDiv.append(buttonDiv)

    createButtons(idx, buttonDiv, numDivs, options)

    colorPicker(document.getElementById('mark' + idx))
  }

  if (options.slidersOn && options.toolbarOn) {
    sliderButtonEvent(idx, sliders)
  }

  name = 'viewer'
  const viewerDiv = document.createElement('div') // 'viewer' div
  viewerDiv.id = name + idx
  viewerDiv.className = name
  // viewerDiv.innerHTML = name;

  container.appendChild(viewerDiv)

  viewers.push(new ImageViewer('viewer' + idx, sliders, numDivs, options))

  // Clear:both between rows
  if (idx % 2 === 0) {
    const div = document.createElement('div')
    div.style.clear = 'both'
    document.body.appendChild(div)
  }
}

const createButtons = function (idx, div, numDivs, options) {
  let color
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

const createSliders = function (idx, div, howManyToCreate, options) {
  const sliders = []
  const d = document.createDocumentFragment()

  for (let i = 0; i < howManyToCreate; i++) {
    const range = document.createElement('input')
    range.type = 'range'
    sliderIdNum += 1
    range.id = 'sliderRange' + sliderIdNum
    range.min = '0'
    range.max = '100'
    range.value = '100'
    range.setAttribute('class', 'slider-square')
    if (options.toolbarOn) {
      range.style.display = 'none'
    } else {
      range.style.display = 'inline' // bc we have a btn to toggle it
    }

    d.appendChild(range) // append div to fragment
    div.appendChild(d) // append fragment to parent
    sliders.push(range)
  }
  return sliders
}

const sliderButtonEvent = function (idx, sliders) {
  const btnSlide = document.getElementById('btnSlide' + idx)
  if (isRealValue(btnSlide)) {
    btnSlide.addEventListener('click', function () {
      // (2) sliders.
      if (sliders[0].style.display === 'none') { // no need to check both; just the one.
        // Show the sliders
        sliders[0].style.display = 'inline'
        sliders[1].style.display = 'inline'

        // Style the button
        this.innerHTML = '<i class="fa fa-sliders"></i> Hide sliders'
      } else {
        // Hide the sliders
        sliders[0].style.display = 'none'
        sliders[1].style.display = 'none'

        // Style the button
        this.innerHTML = '<i class="fa fa-sliders"></i> Show sliders'
      }
      toggleButtonHighlight(btnSlide)
    })
  } else {
    console.log('slide is null')
  }
}
