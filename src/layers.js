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

/**
 * One row per layer
 */
function addRow(table, currentLayer, allLayers, viewer) {
  let tr = e('tr')
  table.appendChild(tr)

  const layerNum = currentLayer.layerNum
  // Preferred Label
  const sections = (currentLayer.location).split('/')
  const name = sections[sections.length - 2] // filename

  // Feature (draggable)
  let feat = e('button', {
    'id': `${layerNum}${makeId(5, 'feat')}`,
    'class': `dragIt`,
    'style': 'display: inline-block',
    'draggable': 'true',
    'data-tooltip': name
  })
  feat.innerHTML = name

  /**
   * One column per icon
   */
  tr.appendChild(e('td', {}, [feat]))

  // eyeball visibility toggle
  let cssClass = currentLayer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye'
  let faEye = e('i', {
    'id': makeId(5, 'eye'),
    'class': `${cssClass} hover-light`,
    'title': 'toggle visibility'
  })
  tr.appendChild(e('td', {}, [faEye]))

  // transparency slider
  let faAdjust = document.createElement('i')
  faAdjust.classList.add('fas')
  faAdjust.classList.add('fa-adjust')
  faAdjust.classList.add('hover-light')
  faAdjust.style.cursor = 'pointer'
  let div = e('div', {class: `showDiv`, 'title': 'transparency slider'}, [faAdjust])

  let transSlider = e('input', {
    type: 'range',
    id: makeId(5, 'range'),
    min: '0',
    max: '100',
    step: '0.1',
    value: (currentLayer.opacity * 100).toString()
  })

  transSlider.addEventListener('input', function () {
    let worldItem = viewer.world.getItemAt(layerNum)
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

  faEye.addEventListener('click', () => {
    toggleButton(faEye, 'fa-eye', 'fa-eye-slash')
    eyeball(faEye, transSlider, layerNum, viewer)
  })

  div.appendChild(e('div', {class: `showHover`}, [transSlider]))
  tr.appendChild(e('td', {}, [div]))

  if (layerNum > 0) {
    // color palette
    let palette = e('i', {
      'id': makeId(5, 'palette'),
      'class': `fas fa-palette pointer hover-light`,
      'title': 'color palette'
    })
    tr.appendChild(e('td', {}, [palette]))

    // TODO: when we get prefLabel, then we can pass currentLayer.prefLabel instead of feat.innerText
    let colorsUI = filters(palette, feat.innerText, currentLayer.colorscheme, allLayers, viewer)
    palette.addEventListener('click', () => {
      colorsUI.style.display = 'block'
    })

    // The tachometer is going to pop open 'settings' (or whatever we decide to call it)
    // Settings will have color (or probability) attenuation, fill/un-fill poly's, range sliders.
    let tachometer = e('i', {
      'id': makeId(5, 'tach'),
      'class': `fas fa-tachometer-alt hover-light`,
      'title': 'settings' // call it 'settings', 'control panel', idk.
    })
    tr.appendChild(e('td', {}, [tachometer]))

    const id = makeId(5, 'optsDiv')
    const rect = tachometer.getBoundingClientRect()
    const optsDiv = createDraggableDiv(id, 'Settings', rect.left, rect.top)

    tachometer.addEventListener('click', () => {
      optsDiv.style.display = 'block'
    })
    const body = optsDiv.lastChild

    // COLOR ATTENUATION BY PROBABILITY
    let attId = makeId(5, 'atten')
    let label1 = e('label', {'for': attId})
    label1.innerHTML = "&nbsp;&#58;&nbsp;color-attenuation by probability<br>"
    let attenuation = e('i', {
      'id': attId,
      'class': `fas fa-broadcast-tower hover-light`,
      'title': 'toggle: color-attenuation by probability'
    })
    attenuation.addEventListener('click', () => {
      attenuateFlag = !attenuateFlag
      outlineFlag = false
      setFilter(allLayers, viewer)
    })

    // UN/FILL POLYGON
    let fillId = makeId(5, 'fill')
    let label2 = e('label', {'for': fillId})
    label2.innerHTML = "&nbsp;&nbsp;&#58;&nbsp;un/fill polygon<br>"

    let emptyCircle = 'far'
    let filledCircle = 'fas'
    let fillPoly = e('i', {
      'id': fillId,
      'class': `${filledCircle} fa-circle hover-light`,
      'title': 'fill un-fill'
    });

    fillPoly.addEventListener('click', () => {
      outlineFlag = !outlineFlag
      toggleButton(fillPoly, filledCircle, emptyCircle)
      setFilter(allLayers, viewer)
    })

    // Dual-point sliders
    let d = {
      'aLab': 'a',
      'bLab': 'b',
      'aInit': 70,
      'bInit': 185,
      'min': 0,
      'max': 255,
      'class': 'wrap',
      'type': 'inside'
    }
    const wrapper = sliderType1(d, 'In range:', allLayers, viewer)
    d = {
      'aLab': 'a1',
      'bLab': 'b1',
      'aInit': 10,
      'bInit': 245,
      'min': 0,
      'max': 255,
      'class': 'section',
      'type': 'outside'
    }
    const section = sliderType1(d, 'Out range:', allLayers, viewer)

    let dd = e('div', {}, [attenuation, label1, fillPoly, label2, section, wrapper])
    body.appendChild(dd)

  } else {
    tr.appendChild(e('td'))
  }
}

function sliderType1(d, t, allLayers, viewer) {
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
  let displayElement = e('span')
  if (d.type === 'outside') {
    displayElement.innerHTML = `0 - ${ARange.value}, ${BRange.value} - 255`
  } else {
    displayElement.innerHTML = `${ARange.value} - ${BRange.value}`
  }

  wrapper.appendChild(ARange)
  wrapper.appendChild(displayElement)
  wrapper.appendChild(BRange)

  function f(e) {
    let _t = e.target;
    _t.parentNode.style.setProperty(`--${_t.id}`, +_t.value)
    let slideVals = getVals([ARange, BRange])

    if (d.type === 'outside') {
      displayElement.innerHTML = `0 - ${slideVals[0]}, ${slideVals[1]} - 255`
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
        // New draggable feature
        let feat = e('span', {
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

function eyeball(eye, range, layerNum, viewer) {
  let l = viewer.world.getItemAt(layerNum)
  if (l) {
    if (eye.classList.contains('fa-eye-slash')) {
      l.setOpacity(0) // Turn off layer
      range.value = '0' // Set slider to 0
    } else {
      l.setOpacity(1) // Turn on layer
      range.value = '100' // Set slider to (opacity * 100)
    }
  }
}
