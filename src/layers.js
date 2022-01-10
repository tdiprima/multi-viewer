/**
 * There's a column called "layers_and_colors" to the right of each viewer.
 * Create an HTML table there, with each row corresponding to each layer displayed in viewer.
 * Each layer has:
 *     a draggable item: the layer
 *         naming convention: 0featXXX <- 0th feature
 *     an eyeball: turn layer on & off
 *     a slider: adjust transparency
 *     a color palette: change colors in layer
 *     broadcast tower: attenuate by certainty
 */
let layers = (divEl, images, viewer) => {
  createLayerWidget(divEl, images, viewer)
  handleDragLayers(images, viewer)
}

/**
 * Locate the source viewer
 */
function getSourceViewer(focusButton) {
  // Find the layers_and_colors div close to where the user dropped the feature:
  let layers_and_colors = focusButton.parentElement.parentElement.parentElement.parentElement
  // Get the table row containing the viewer
  let tr = layers_and_colors.parentElement.parentElement
  // Finally, get the source viewer's div
  let sourceViewerDiv = tr.firstElementChild.firstElementChild
  return getViewerObject(sourceViewerDiv)
}

/**
 * Given the div containing the viewer, get the corresponding OpenSeadragonViewer object
 */
function getViewerObject(element) {
  let retVal
  try {
    // syncedImageViewers = global variable set in synchronizeViewers.js
    for (let nsync of syncedImageViewers) {
      if (nsync.getViewer().id === element.id) {
        retVal = nsync.getViewer()
        break
      }
    }
  } catch (e) {
    console.error(e.message)
  }
  return retVal
}

function getVals(slides) {
  // Get slider values
  let slide1 = parseFloat(slides[0].value)
  let slide2 = parseFloat(slides[1].value)

  // Determine which is larger
  if (slide1 > slide2) {
    let tmp = slide2;
    slide2 = slide1;
    slide1 = tmp
  }

  return [slide1, slide2]
}

// Feature (draggable)
function featureElem(layerNum, name) {
  let feat = e('button', {
    'id': `${layerNum}${makeId(5, 'feat')}`,
    'class': `dragIt`,
    'style': 'display: inline-block',
    'draggable': 'true',
    'data-tooltip': name
  })
  feat.innerHTML = name
  return feat
}

// Eyeball visibility toggle
function visibilityToggle(currentLayer) {
  let cssClass = currentLayer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye'
  return e('i', {
    'id': makeId(5, 'eye'),
    'class': `${cssClass} hover-light`,
    'title': 'toggle visibility'
  })
}

function transSlider(currentLayer, faEye, viewer) {
  // Trans slider ICON
  let icon = document.createElement('i')
  icon.classList.add('fas')
  icon.classList.add('fa-adjust')
  icon.classList.add('hover-light')
  icon.style.cursor = 'pointer'

  let element = e('input', {
    'type': 'range',
    'id': makeId(5, 'range'),
    'min': '0',
    'max': '100',
    'step': '0.1',
    'value': (currentLayer.opacity * 100).toString()
  })

  element.addEventListener('input', function () {
    let worldItem = viewer.world.getItemAt(currentLayer.layerNum)
    if (worldItem !== undefined) {
      worldItem.setOpacity(this.value / 100)
      if (this.value === '0') {
        faEye.classList.remove('fa-eye')
        faEye.classList.add('fa-eye-slash')
      }
      if (parseFloat(this.value) > 0) {
        faEye.classList.remove('fa-eye-slash')
        faEye.classList.add('fa-eye')
      }
    } else {
      console.warn('worldItem', worldItem)
    }
  })
  return [icon, element]
}

// Eyeball visibility handler
function handleVisibility(faEye, range, layerNum, viewer) {
  toggleButton(faEye, 'fa-eye', 'fa-eye-slash')
  let l = viewer.world.getItemAt(layerNum)
  if (l) {
    if (faEye.classList.contains('fa-eye-slash')) {
      l.setOpacity(0) // Turn off layer
      range.value = '0' // Set slider to 0
    } else {
      l.setOpacity(1) // Turn on layer
      range.value = '100' // Set slider to (opacity * 100)
    }
  }
}

// Color palette
function colorPalette(feat, currentLayer, allLayers, viewer) {
  let palette = e('i', {
    'id': makeId(5, 'palette'),
    'class': `fas fa-palette pointer hover-light`,
    'title': 'color palette'
  })
  // TODO: when we get prefLabel, then we can pass currentLayer.prefLabel instead of feat.innerText
  let colorsUI = filters(palette, feat.innerText, currentLayer.colorscheme, allLayers, viewer)
  palette.addEventListener('click', () => {
    colorsUI.style.display = 'block'
  })
  return palette
}

function attenuation(allLayers, viewer) {
  let attId = makeId(5, 'atten')
  let label = e('label', {'for': attId})
  label.innerHTML = "&nbsp;&#58;&nbsp;color-attenuation by probability<br>"
  // Icon
  let element = e('i', {
    'id': attId,
    'class': `fas fa-broadcast-tower hover-light`,
    'title': 'toggle: color-attenuation by probability'
  })
  // Event listener
  element.addEventListener('click', () => {
    attenuateFlag = !attenuateFlag
    outlineFlag = false
    setFilter(allLayers, viewer)
  })
  return [label, element]
}

function fillUnfill(allLayers, viewer) {
  let fillId = makeId(5, 'fill')
  let label = e('label', {'for': fillId})
  label.innerHTML = "&nbsp;&nbsp;&#58;&nbsp;un/fill polygon<br>"
  let emptyCircle = 'far'
  let filledCircle = 'fas'
  // Icon
  let element = e('i', {
    'id': fillId,
    'class': `${filledCircle} fa-circle hover-light`,
    'title': 'fill un-fill'
  });
  // Event listener
  element.addEventListener('click', () => {
    outlineFlag = !outlineFlag
    toggleButton(element, filledCircle, emptyCircle)
    setFilter(allLayers, viewer)
  })
  return [label, element]
}

/**
 * The tachometer is going to pop open 'settings' (or whatever we decide to call it)
 * Settings will have color (or probability) attenuation, fill/un-fill poly's, range sliders.
 */
function tachometer() {
  let element = e('i', {
    'id': makeId(5, 'tach'),
    'class': `fas fa-tachometer-alt hover-light`,
    'title': 'settings' // call it 'settings', 'control panel', idk.
  })

  const id = makeId(5, 'optsDiv')
  const rect = element.getBoundingClientRect()
  const optsDiv = createDraggableDiv(id, 'Settings', rect.left, rect.top)
  const divBody = optsDiv.lastChild

  element.addEventListener('click', () => {
    optsDiv.style.display = 'block'
  })

  return [element, divBody]
}

/**
 * One row per layer
 * One column per icon
 */
function addRow(table, currentLayer, allLayers, viewer) {
  let tr = e('tr')
  table.appendChild(tr)

  const layerNum = currentLayer.layerNum
  // Preferred Label
  const sections = (currentLayer.location).split('/')
  const name = sections[sections.length - 2] // filename

  // Feature (draggable)
  let feat = featureElem(layerNum, name)
  tr.appendChild(e('td', {}, [feat]))

  // Eyeball visibility toggle
  let faEye = visibilityToggle(currentLayer)
  tr.appendChild(e('td', {}, [faEye]))

  // TRANSPARENCY SLIDER
  let [faAdjust, xSlider] = transSlider(currentLayer, faEye, viewer)
  let div = e('div', {'class': `showDiv`, 'title': 'transparency slider'}, [faAdjust])

  // VISIBILITY
  faEye.addEventListener('click', () => {
    handleVisibility(faEye, xSlider, layerNum, viewer)
  })

  div.appendChild(e('div', {class: `showHover`}, [xSlider]))
  tr.appendChild(e('td', {}, [div]))

  if (layerNum > 0) {
    // COLOR PALETTE
    tr.appendChild(e('td', {}, [colorPalette(feat, currentLayer, allLayers, viewer)]))

    // TACHOMETER
    let [tach, divBody] = tachometer()
    tr.appendChild(e('td', {}, [tach]))

    // COLOR ATTENUATION BY PROBABILITY
    let [label1, atten] = attenuation(allLayers, viewer)

    // UN/FILL POLYGON
    let [label2, fillPoly] = fillUnfill(allLayers, viewer)
    divBody.appendChild(e('div', {}, [atten, label1, fillPoly, label2]))

    // DUAL-POINT SLIDERS
    let d = { 'aLab': 'a', 'bLab': 'b', 'aInit': 70, 'bInit': 185, 'min': 0, 'max': 255, 'class': 'wrap', 'type': 'inside' }
    const wrapper = sliderWrapper(d, 'In range:', allLayers, viewer)

    d = { 'aLab': 'a1', 'bLab': 'b1', 'aInit': 10, 'bInit': 245, 'min': 0, 'max': 255, 'class': 'section', 'type': 'outside' }
    const section = sliderWrapper(d, 'Out range:', allLayers, viewer)

    let dd = e('div', {}, [section, wrapper])
    divBody.appendChild(dd)

  } else {
    tr.appendChild(e('td'))
  }
}

function sliderWrapper(d, t, allLayers, viewer) {
  let wrapper = e('div', {
    'class': d.class,
    'role': 'group',
    'aria-labelledby': 'multi-lbl',
    'style': `--${d.aLab}: ${d.aInit}; --${d.bLab}: ${d.bInit}; --min: ${d.min}; --max: ${d.max}`
  })
  let title = e('div', {'id': 'multi-lbl'})
  title.innerHTML = t
  wrapper.appendChild(title)

  let ARange = e('input', {'id': `${d.aLab}`, 'type': 'range', 'min': d.min, 'max': d.max, 'value': d.aInit})
  let BRange = e('input', {'id': `${d.bLab}`, 'type': 'range', 'min': d.min, 'max': d.max, 'value': d.bInit})

  // To display the current values:
  let displayElement = e('output')
  if (d.type === 'outside') {
    displayElement.innerHTML = `0 - ${ARange.value} and ${BRange.value} - 255`
  } else {
    displayElement.innerHTML = `${ARange.value} - ${BRange.value}`
  }

  wrapper.appendChild(ARange)
  wrapper.appendChild(displayElement)
  wrapper.appendChild(BRange)

  function f(e) {
    const input = e.target
    const wrapper = input.parentNode
    wrapper.style.setProperty(`--${input.id}`, +input.value)

    // Get values:
    let slideVals = getVals([ARange, BRange])

    // Display values:
    if (d.type === 'outside') {
      displayElement.innerHTML = `0 - ${slideVals[0]} and ${slideVals[1]} - 255`
      setFilter(allLayers, viewer, {'min': slideVals[0], 'max': slideVals[1], 'type': 'outside'})
    } else {
      displayElement.innerHTML = `${slideVals[0]} - ${slideVals[1]}`
      setFilter(allLayers, viewer, {'min': slideVals[0], 'max': slideVals[1], 'type': 'inside'})
    }
  }

  ARange.addEventListener('input', f)
  BRange.addEventListener('input', f)

  return wrapper
}

function createLayerWidget(div, layers, viewer) {
  let table = e('table')
  div.appendChild(table)
  layers.forEach(layer => {
    addRow(table, layer, layers, viewer)
  })
}

// VIEWER'S DRAGGABLE LAYERS
function handleDragLayers(layers, viewer) {
  // Div containing viewer
  let dropzone = document.getElementById(viewer.id)
  dropzone.addEventListener('dragenter', function () {
    this.classList.add('over')
  })
  dropzone.addEventListener('dragleave', function () {
    this.classList.remove('over')
  })
  dropzone.addEventListener('dragover', evt => {
    if (evt.preventDefault) evt.preventDefault();
    return false
  })
  dropzone.addEventListener('drop', handleDrop)

  let table = dropzone.parentElement.parentElement.parentElement.parentElement
  // The features/layers to the right of the viewer
  let features = table.querySelectorAll('.dragIt')
  features.forEach(feature => {
    feature.setAttribute('draggable', 'true')
    feature.addEventListener('dragstart', handleDragStart)
    feature.addEventListener('dragend', handleDragEnd)
  })

  function handleDragStart(evt) {
    dragSrcEl = this // The draggable feature (button element)
    this.style.opacity = '0.4'
    sourceViewer = getSourceViewer(evt.target)
    evt.dataTransfer.effectAllowed = 'move'
    evt.dataTransfer.setData('text', evt.target.id)
  }

  function handleDragEnd() {
    // this = the draggable feature
    this.style.opacity = '1'
    dropzone.classList.remove('over')
  }

  function handleDrop(evt) {
    // this = dropzone viewer
    this.classList.remove('over')

    if (evt.preventDefault) evt.preventDefault()

    // Make sure user didn't drop the button on its own viewer div
    if (dragSrcEl !== this) {
      // target
      let target = evt.target // canvas upper-canvas
      let targetDiv = target.closest('.viewer') // where they dropped the feature
      if (!targetDiv) return false;
      // Find matching layers_and_colors div
      const td1 = targetDiv.parentElement
      const td2 = td1.nextSibling
      // Find the corresponding table (we will add this feature here)
      let myTable = td2.firstChild

      let movedElemId = evt.dataTransfer.getData('text')
      let movedElem = document.getElementById(movedElemId)
      let name = movedElem.innerHTML

      let layNum
      let foundMatchingSlide = false
      for (let row of myTable.rows) {
        let lay = row.cells[0].firstChild
        layNum = lay.id[0] // 1st char is array index
        let eye = row.cells[1].children[0]
        if (lay.innerHTML === name) {
          foundMatchingSlide = true
          // Highlight the layer
          lay.classList.remove('highlight') // just in case.
          lay.classList.add('highlight')
          // Toggle eyeball
          eye.classList.remove('fa-eye-slash')
          eye.classList.add('fa-eye')
          break
        }
      }

      let targetViewer = getViewerObject(targetDiv)
      if (foundMatchingSlide) {
        console.log('Found matching slide')
        try {
          targetViewer.world.getItemAt(layNum).setOpacity(1) // show
          // sourceViewer.world.getItemAt(XXX).setOpacity(0) // hide
        } catch (e) {
          console.warn('It may get here if the handler executes twice on one drop:')
          console.warn(e.message)
        }
      } else {
        console.error('Did not find matching slide')
        const location = sourceViewer.tileSources[layNum].tileSource
        console.error('src img', location)
        const newLayNum = layers.length
        // DRAGGABLE
        let feat = e('div', {
          id: `${newLayNum}${makeId(5, 'feat')}`,
          class: 'dragIt',
          display: 'block',
          draggable: 'true'
        })
        feat.innerHTML = name

        // TODO: this part needs to change
        let addToLayers = {
          "layerNum": layers.length,
          "location": location,
          "opacity": 1,
          "colors": [
            {
              // "color": "rgba(75, 0, 130, 255)",
              "color": "rgba(184, 226, 242, 255)",
              "low": 128,
              "high": 255
            }
          ],
          "resolutionUnit": 3,
          "xResolution": 40000,
          "prefLabel": 'something'  // TODO: getLabel(feat, addToLayers)
        }
        // append new value to the array
        // addToLayers.prefLabel = getLabel(feat, addToLayers)
        layers.push(addToLayers)

        addRow(myTable, addToLayers, layers, targetViewer)

        targetViewer.addTiledImage({tileSource: location, opacity: 1, x: 0, y: 0})

      }
    }
    return false
  }
}
