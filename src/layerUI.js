/**
 * Create 1 control panel row per layer.
 *
 * There's a column called "layersAndColors" to the right of each viewer.
 * Create an HTML table there, with each row corresponding to each layer displayed in viewer.
 * Each layer has:
 *     a draggable item: the layer
 *         naming convention: 0featXXX <- 0th feature
 *     an eyeball: turn layer on & off
 *     a slider: adjust transparency
 *     a color palette: change colors in layer
 *     a tachometer: adjust visualizations in layer
 */
const layerUI = (layersColumn, images, viewer) => {
  createLayerElements(layersColumn, images, viewer);
  handleButtonDrag(images, viewer);
};

function createLayerElements(layersColumn, layers, viewer) {
  const myEyeArray = [];
  let toggle = false;
  const vNum = layersColumn.id.slice(-1);
  // 'fas fa-eye-slash' : 'fas fa-eye'
  const globalEyeToggle = e('i', {
    id: `eyeTog${vNum}`,
    style: 'display: inline-block',
    class: 'fas fa-eye' // 'data-tooltip': 'eye toggle'
  });

  const table = e('table');
  layersColumn.appendChild(table);
  const tr = e('tr');
  table.appendChild(tr);
  tr.appendChild(e('td'));
  tr.appendChild(e('td', {}, [globalEyeToggle]));

  layers.forEach(layer => {
    addIconRow(myEyeArray, table, layer, layers, viewer);
  });

  globalEyeToggle.addEventListener('click', function() {
    // class="fas fa-eye"
    // class="fas fa-eye-slash"
    myEyeArray.forEach(eye => {
      eye.click(e);
    });

    if (toggle) {
      this.classList.remove('fa-eye-slash');
      this.classList.add('fa-eye');
    } else {
      this.classList.remove('fa-eye');
      this.classList.add('fa-eye-slash');
    }
    toggle = !toggle;
  });
}

// VIEWER'S DRAGGABLE LAYERS
function handleButtonDrag(layers, viewer) {
  // Div containing viewer
  const osdDiv = document.getElementById(viewer.id);

  osdDiv.addEventListener('dragenter', function() {
    this.classList.add('over');
  });

  osdDiv.addEventListener('dragleave', function() {
    this.classList.remove('over');
  });

  osdDiv.addEventListener('dragover', evt => {
    // dragover target = canvas; class "upper-canvas"
    if (evt.preventDefault) evt.preventDefault();
    return false;
  });
  osdDiv.addEventListener('drop', handleDrop);

  const table = osdDiv.closest('table');

  // The features/layers to the right of the viewer
  const features = table.querySelectorAll('.dragIt');
  features.forEach(feature => {
    feature.addEventListener('dragstart', handleDragStart);
    feature.addEventListener('dragend', handleDragEnd);
  });

  function handleDragStart(evt) {
    /* eslint-disable no-undef */
    sourceViewer = viewer
    /* eslint-disable no-undef */
    draggedFeature = this; // The draggable feature (button element)
    draggedFeature.style.opacity = '0.4';
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text', evt.target.id);
  }

  function handleDragEnd() {
    // this = the draggable feature btn
    this.style.opacity = '1';
    osdDiv.classList.remove('over');
  }

  function handleDrop(evt) {
    // targetElement is correct
    const targetElement = evt.target; // canvas upper-canvas
    this.classList.remove('over'); // this = dropzone (osdDiv) viewer

    if (evt.preventDefault) evt.preventDefault();

    // viewerDiv is correct
    const viewerDiv = targetElement.closest('.viewer'); // where they dropped the feature

    if (!viewerDiv) {
      console.error('!viewerDiv');
      return false;
    }

    // Find neighboring layersColumn
    const columnWithViewer = viewerDiv.parentElement;
    const columnLayAndCol = columnWithViewer.nextSibling; // Target viewer's layersAndColors column

    // Find the neighboring table (we will add this feature here)
    const tableLayAndColor = columnLayAndCol.firstChild;
    const movedFeatId = evt.dataTransfer.getData('text');
    const movedFeature = document.getElementById(movedFeatId);
    const featureName = movedFeature.innerHTML;

    let layNum;
    let foundMatchingSlide = false;
    // Iterate table rows
    for (let i = 0; i < tableLayAndColor.rows.length; i++) {
      // Skip first row (globals)
      if (i > 0) {
        const row = tableLayAndColor.rows[i];
        const lay = row.cells[0].firstChild;
        layNum = lay.id[0]; // 1st char is array index
        const eye = row.cells[1].children[0];

        if (lay.innerHTML === featureName) {
          foundMatchingSlide = true;
          // Highlight the layer
          lay.classList.remove('highlight');
          lay.classList.add('highlight');
          // Toggle eyeball
          eye.classList.remove('fa-eye-slash');
          eye.classList.add('fa-eye');
          break;
        }
      }
    }

    const targetViewer = getOsdViewer(evt);
    // targetViewer is correct.
    if (targetViewer !== null) {
      if (foundMatchingSlide) {
        console.log('Found matching slide');
        // console.log('sourceViewer', sourceViewer)
        // console.log('targetViewer', targetViewer)
        try {
          targetViewer.world.getItemAt(layNum).setOpacity(1); // show
          // We already turned on target feature eyeball
          sourceViewer.world.getItemAt(layNum).setOpacity(0) // hide
          let eye1 = draggedFeature.parentNode.nextSibling.firstChild
          // Toggle eyeball on source feature
          eye1.classList.remove('fa-eye');
          eye1.classList.add('fa-eye-slash');
        } catch (e) {
          // It may get here if the handler executes twice on one drop
          console.warn(e.message);
        }
      } else {
        let location
        try {
          location = sourceViewer.tileSources[layNum].tileSource
        } catch (e) {
          console.error('oops.', e.message)
        }
        console.error('Did not find matching slide\nLocation:', location)
      }
    }
    return false;
  }
}

function addIconRow(myEyeArray, table, currentLayer, allLayers, viewer) {
  const tr = e('tr');
  table.appendChild(tr);

  const layerNum = currentLayer.layerNum;
  const featureName = getPreferredLabel(currentLayer);

  // FEATURE
  const feat = createDraggableBtn(layerNum, featureName);
  tr.appendChild(e('td', {}, [feat]));

  // VISIBILITY TOGGLE
  const faEye = createEyeball(currentLayer);
  if (layerNum > 0) {
    myEyeArray.push(faEye);
  }

  tr.appendChild(e('td', {}, [faEye]));

  // TRANSPARENCY SLIDER
  const [faAdjust, xSlider] = createTransparencySlider(currentLayer, faEye, viewer);
  const div = e('div', { class: 'showDiv', title: 'transparency slider' }, [faAdjust]);

  // VISIBILITY
  faEye.addEventListener('click', handleVisibility.bind(null, faEye, xSlider, layerNum, viewer), false)

  div.appendChild(e('div', { class: 'showHover' }, [xSlider]));
  tr.appendChild(e('td', {}, [div]));

  if (layerNum > 0) {
    // COLOR PALETTE
    createColorPalette(tr, feat, currentLayer, allLayers, viewer);

    // TACHOMETER
    const divBody = createTachometer(tr);

    layerPopup(divBody, allLayers, viewer);
  } else {
    tr.appendChild(e('td'));
  }
}

function getPreferredLabel(layer) {
  let featureName;
  const loc = extractLocation(layer);
  const sections = loc.split('/');
  const re = /^(?:[a-z]+:)?\b/gm;

  if (loc.match(re)) {
    // Absolute URL
    featureName = sections[sections.length - 2];
  } else {
    // Relative URL
    featureName = sections[sections.length - 1];
  }

  if (featureName.includes('.')) {
    featureName = featureName.substring(0, featureName.indexOf('.'));
  }

  return featureName;
}

// Feature (draggable)
function createDraggableBtn(layerNum, featureName) {
  const element = e('button', {
    id: `${layerNum}${createId(5, 'feat')}`,
    class: 'dragIt',
    style: 'display: inline-block',
    draggable: 'true',
    title: featureName
  });
  element.innerHTML = featureName;
  return element;
}

// Eyeball visibility toggle
function createEyeball(currentLayer) {
  const cssClass = currentLayer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye';
  return e('i', {
    id: createId(5, 'eye'),
    class: `${cssClass} hover-light`,
    title: 'toggle visibility'
  });
}

function createTransparencySlider(currentLayer, faEye, viewer) {
  // Icon
  const icon = document.createElement('i');
  icon.classList.add('fas');
  icon.classList.add('fa-adjust');
  icon.classList.add('hover-light');
  icon.style.cursor = 'pointer';

  // Slider element
  const element = e('input', {
    type: 'range',
    class: 'singleSlider',
    id: createId(5, 'range'),
    min: '0',
    max: '100',
    step: '0.1',
    value: (currentLayer.opacity * 100).toString()
  });

  element.addEventListener('input', function() {
    const worldItem = viewer.world.getItemAt(currentLayer.layerNum);
    if (worldItem !== undefined) {
      worldItem.setOpacity(this.value / 100);
      if (this.value === '0') {
        faEye.classList.remove('fa-eye');
        faEye.classList.add('fa-eye-slash');
      }
      if (parseFloat(this.value) > 0) {
        faEye.classList.remove('fa-eye-slash');
        faEye.classList.add('fa-eye');
      }
    } else {
      console.warn('worldItem', worldItem);
    }
  });
  return [icon, element];
}

// Color palette
function createColorPalette(row, featureElem, currentLayer, allLayers, viewer) {
  const icon = e('i', {
    id: createId(5, 'palette'),
    class: 'fas fa-palette pointer hover-light',
    title: 'color palette'
  });
  row.appendChild(e('td', {}, [icon]));

  // TODO: when we get prefLabel, then we can pass currentLayer.prefLabel instead of featureElem.innerText
  const colorsUI = filterPopup(
    icon,
    featureElem.innerText,
    currentLayer.colorscheme,
    allLayers,
    viewer,
  );
  icon.addEventListener('click', () => {
    colorsUI.style.display = 'block';
  });
}

function createTachometer(row) {
  const icon = e('i', {
    id: createId(5, 'tach'),
    class: 'fas fa-tachometer-alt hover-light',
    title: 'settings' // call it 'settings', 'control panel', idk.
  });
  row.appendChild(e('td', {}, [icon]));

  const id = createId(5, 'pop');
  const rect = icon.getBoundingClientRect();
  const popup = createDraggableDiv(id, 'Settings', rect.left, rect.top);
  const divBody = popup.lastChild;

  icon.addEventListener('click', () => {
    popup.style.display = 'block';
  });

  return divBody;
}

function getOsdViewer(evt) {
  const targetElement = evt.target;
  const tagName = targetElement.tagName.toLowerCase();

  if (tagName === 'canvas') {
    const table = targetElement.closest('table');
    const tr = table.firstChild.firstChild;
    const td = tr.firstChild;
    const sourceViewerDiv = td.firstChild;

    let retVal;
    try {
      for (const sync of SYNCED_IMAGE_VIEWERS) {
        if (sync.getViewer().id === sourceViewerDiv.id) {
          retVal = sync.getViewer();
          break;
        }
      }
    } catch (e) {
      console.error('message:', e.message);
    }
    return retVal;
  } else if (tagName === 'button') {
    console.warn('got button')
    // walk up the dom tree to get source viewer
    // let td = targetElement.parentNode;
    // let tr = td.parentNode
    // let table = tr.closest('table');
    // let layersAndColors = table.parentNode
    // let tr1 = layersAndColors.parentNode
    // let table1 = tr1.parentNode.parentNode
    // let tbody = table1.firstElementChild
    // let tr2 = tbody.firstElementChild
    // let td1 = tr2.firstElementChild
    // let sourceViewerDiv = td1.firstElementChild
    // // sourceViewerDiv is correct
    // // console.log('sourceViewerDiv', sourceViewerDiv)
    // for (const sync of SYNCED_IMAGE_VIEWERS) {
    //   if (sync.getViewer().id === sourceViewerDiv.id) {
    //     sourceViewer = sync.getViewer();
    //     // console.log('sourceViewer', sourceViewer) // got it
    //     break;
    //   }
    // }
  } else {
    console.log('got canvas?', targetElement.tagName, targetElement)
  }
  return null;
}

function getVals(slides) {
  // Get slider values
  let slide1 = parseFloat(slides[0].value);
  let slide2 = parseFloat(slides[1].value);

  // Determine which is larger
  if (slide1 > slide2) {
    const tmp = slide2;
    slide2 = slide1;
    slide1 = tmp;
  }

  return [slide1, slide2];
}

// Eyeball visibility handler
function handleVisibility(icon, slider, layerNum, viewer) {
  toggleButton(icon, 'fa-eye', 'fa-eye-slash');
  const tiledImage = viewer.world.getItemAt(layerNum);
  if (typeof tiledImage !== 'undefined') {
    if (icon.classList.contains('fa-eye-slash')) {
      tiledImage.setOpacity(0); // Turn off layer
      // slider.value = '0' // Set slider to 0
    } else {
      tiledImage.setOpacity(slider.value / 100);
      // tiledImage.setOpacity(1) // Turn on layer
      // slider.value = '100' // Set slider to (opacity * 100)
    }
  }
}
