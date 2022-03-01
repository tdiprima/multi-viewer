/**
 * There's a column called "layersAndColors" to the right of each viewer.
 * Create an HTML table there, with each row corresponding to each layer displayed in viewer.
 * Each layer has:
 *     a draggable item: the layer
 *         naming convention: 0featXXX <- 0th feature
 *     an eyeball: turn layer on & off
 *     a slider: adjust transparency
 *     a color palette: change colors in layer
 *     broadcast tower: attenuate by certainty
 */
let layerUI = (divEl, images, viewer) => {
  createLayerElements(divEl, images, viewer)
  handleDragLayers(images, viewer)
}

/**
 * Locate the source viewer
 */
function getSourceViewer(focusButton) {
  // Find the layersAndColors div close to where the user dropped the feature:
  let layersAndColors = focusButton.parentElement.parentElement.parentElement.parentElement
  // Get the table row containing the viewer
  let tr = layersAndColors.parentElement.parentElement
  // Finally, get the source viewer's div
  let sourceViewerDiv = tr.firstElementChild.firstElementChild
  return getViewerObject(sourceViewerDiv)
}

/**
 * Given the div containing the viewer, get the corresponding OpenSeadragon.Viewer object
 */
function getViewerObject(element) {
  let retVal
  try {
    const vv = getViewers()
    for (const v of vv) {
      if (v.viewer.id === element.id) {
        retVal = v.viewer
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
    let tmp = slide2
    slide2 = slide1
    slide1 = tmp
  }

  return [slide1, slide2]
}

// Feature (draggable)
function draggableFeature(layerNum, name) {
  let element = e('button', {
    'id': `${layerNum}${makeId(5, 'feat')}`,
    'class': 'dragIt hover-light',
    'style': 'display: inline-block',
    'draggable': 'true',
    'data-tooltip': name
  })
  element.innerHTML = name
  return element
}

// Eyeball visibility toggle
function createEyeball(currentLayer) {
  let cssClass = currentLayer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye'
  return e('i', {
    'id': makeId(5, 'eye'),
    'class': `${cssClass} hover-light`,
    'title': 'toggle visibility'
  })
}

// Transparency slider
function transSlider(currentLayer, faEye, viewer) {
  // Icon
  let icon = document.createElement('i')
  icon.classList.add('fas')
  icon.classList.add('fa-adjust')
  icon.classList.add('hover-light')
  icon.style.cursor = 'pointer'

  // Slider element
  let element = e('input', {
    'type': 'range',
    'class': 'singleSlider',
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
function handleVisibility(icon, slider, layerNum, viewer) {
  toggleButton(icon, 'fa-eye', 'fa-eye-slash')
  let tiledImage = viewer.world.getItemAt(layerNum)
  if (typeof tiledImage !== 'undefined') {
    if (icon.classList.contains('fa-eye-slash')) {
      tiledImage.setOpacity(0) // Turn off layer
      // slider.value = '0' // Set slider to 0
    } else {
      tiledImage.setOpacity(slider.value / 100)
      // tiledImage.setOpacity(1) // Turn on layer
      // slider.value = '100' // Set slider to (opacity * 100)
    }
  }
}

// Color palette
function colorPalette(row, featureElem, currentLayer, allLayers, viewer) {
  let icon = e('i', {
    'id': makeId(5, 'palette'),
    'class': `fas fa-palette pointer hover-light`,
    'title': 'color palette'
  })
  row.appendChild(e('td', {}, [icon]))
  // TODO: when we get prefLabel, then we can pass currentLayer.prefLabel instead of featureElem.innerText
  let colorsUI = filterPopup(icon, featureElem.innerText, currentLayer.colorscheme, allLayers, viewer)
  icon.addEventListener('click', () => {
    colorsUI.style.display = 'block'
  })
}

/**
 * The tachometer is going to pop open 'settings' (or whatever we decide to call it)
 * Settings will have color (or probability) attenuation, fill/un-fill poly's, range sliders.
 */
function tachometer(row) {
  let icon = e('i', {
    'id': makeId(5, 'tach'),
    'class': `fas fa-tachometer-alt hover-light`,
    'title': 'settings' // call it 'settings', 'control panel', idk.
  })
  row.appendChild(e('td', {}, [icon]))

  const id = makeId(5, 'optsDiv')
  const rect = icon.getBoundingClientRect()
  const optsDiv = createDraggableDiv(id, 'Settings', rect.left, rect.top)
  const divBody = optsDiv.lastChild

  icon.addEventListener('click', () => {
    optsDiv.style.display = 'block'
  })

  return divBody
}

function getName(layer) {
  let loc
  if (typeof layer.location === 'string') {
    loc = layer.location
  } else {
    loc = layer.location.url
  }

  let urlObj = new URL(loc)
  let url = urlObj.searchParams.get('iiif')

  const sections = (url).split('/')
  return sections[sections.length - 2] // filename
}

/**
 * One row per layer
 * One column per icon
 */
function addRow(table, currentLayer, allLayers, viewer) {
  let tr = e('tr')
  table.appendChild(tr)

  const layerNum = currentLayer.layerNum
  const name = getName(currentLayer)

  // FEATURE
  let feat = draggableFeature(layerNum, name)
  tr.appendChild(e('td', {}, [feat]))

  // VISIBILITY TOGGLE
  let faEye = createEyeball(currentLayer)
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
    colorPalette(tr, feat, currentLayer, allLayers, viewer)

    // TACHOMETER
    let divBody = tachometer(tr)

    layerPopup(divBody, allLayers, viewer)

  } else {
    tr.appendChild(e('td'))
  }
}

function createLayerElements(div, layers, viewer) {
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
    /* eslint-disable no-undef */
    dragSrcEl = this // The draggable feature (button element)
    this.style.opacity = '0.4'
    /* eslint-disable no-undef */
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
      if (!targetDiv) return false
      // Find matching layersAndColors div
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
          lay.classList.remove('highlight')
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
