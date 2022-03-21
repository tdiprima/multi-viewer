// Create 1 control panel row per layer
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
  const dropzone = document.getElementById(viewer.id);
  // console.log('dropzone', dropzone, viewer.id)

  dropzone.addEventListener('dragenter', function() {
    this.classList.add('over');
  });

  dropzone.addEventListener('dragleave', function() {
    this.classList.remove('over');
  });

  dropzone.addEventListener('dragover', evt => {
    if (evt.preventDefault) evt.preventDefault();
    return false;
  });
  dropzone.addEventListener('drop', handleDrop);

  const table = dropzone.closest('table');

  // The features/layers to the right of the viewer
  const features = table.querySelectorAll('.dragIt');
  features.forEach(feature => {
    feature.addEventListener('dragstart', handleDragStart);
    feature.addEventListener('dragend', handleDragEnd);
  });

  function handleDragStart(evt) {
    /* eslint-disable no-undef */
    draggedElement = this; // The draggable feature (button element)
    this.style.opacity = '0.4';
    /* eslint-disable no-undef */
    // sourceViewer = getOsdViewer(evt)
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text', evt.target.id);
  }

  function handleDragEnd() {
    // this = the draggable feature btn
    this.style.opacity = '1';
    dropzone.classList.remove('over');
  }

  function handleDrop(evt) {
    const targetElement = evt.target; // canvas upper-canvas
    this.classList.remove('over'); // this = dropzone viewer

    if (evt.preventDefault) evt.preventDefault();

    const viewerDiv = targetElement.closest('.viewer'); // where they dropped the feature

    if (!viewerDiv) {
      console.error('!viewerDiv');
      return false;
    }

    // Find neighboring layersColumn
    const td1 = viewerDiv.parentElement;
    const td2 = td1.nextSibling;

    // Find the neighboring table (we will add this feature here)
    const myTable = td2.firstChild;

    const movedElemId = evt.dataTransfer.getData('text');
    const movedElem = document.getElementById(movedElemId);
    const name = movedElem.innerHTML;

    let layNum;
    let foundMatchingSlide = false;
    for (let i = 0; i < myTable.rows.length; i++) {
      // Skip first row (globals)
      if (i > 0) {
        const row = myTable.rows[i];
        const lay = row.cells[0].firstChild;
        layNum = lay.id[0]; // 1st char is array index
        const eye = row.cells[1].children[0];
        // console.log(name, lay.innerHTML)
        if (lay.innerHTML === name) {
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
    if (targetViewer !== null) {
      if (foundMatchingSlide) {
        console.log('Found matching slide');
        try {
          targetViewer.world.getItemAt(layNum).setOpacity(1); // show
          // sourceViewer.world.getItemAt(XXX).setOpacity(0) // hide
        } catch (e) {
          // It may get here if the handler executes twice on one drop
          console.warn(e.message);
        }
      } else {
        console.error('Did not find matching slide');
        // const location = sourceViewer.tileSources[layNum].tileSource
        // console.error('Did not find matching slide\nLocation:', location)
      }
    }
    return false;
  }
}

function addIconRow(myEyeArray, table, currentLayer, allLayers, viewer) {
  const tr = e('tr');
  table.appendChild(tr);

  const layerNum = currentLayer.layerNum;
  const name = getPreferredLabel(currentLayer);

  // FEATURE
  const feat = createDraggableBtn(layerNum, name);
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
  faEye.addEventListener('click', () => {
    handleVisibility(faEye, xSlider, layerNum, viewer);
  });

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
  let name;
  const loc = extractLocation(layer);
  const sections = loc.split('/');
  const re = /^(?:[a-z]+:)?\b/gm;

  if (loc.match(re)) {
    // Absolute URL
    name = sections[sections.length - 2];
  } else {
    // Relative URL
    name = sections[sections.length - 1];
  }

  if (name.includes('.')) {
    name = name.substring(0, name.indexOf('.'));
  }

  return name;
}

// Feature (draggable)
function createDraggableBtn(layerNum, name) {
  const element = e('button', {
    id: `${layerNum}${makeId(5, 'feat')}`,
    class: 'dragIt hover-light css-tooltip',
    style: 'display: inline-block',
    draggable: 'true',
    title: name
  });
  element.innerHTML = name;
  return element;
}

// Eyeball visibility toggle
function createEyeball(currentLayer) {
  const cssClass = currentLayer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye';
  return e('i', {
    id: makeId(5, 'eye'),
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
    id: makeId(5, 'range'),
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
    id: makeId(5, 'palette'),
    class: 'fas fa-palette pointer hover-light',
    title: 'color palette'
  });
  row.appendChild(e('td', {}, [icon]));

  // TODO: when we get prefLabel, then we can pass currentLayer.prefLabel instead of featureElem.innerText
  const colorsUI = filterPopup(icon, featureElem.innerText, currentLayer.colorscheme, allLayers, viewer);
  icon.addEventListener('click', () => {
    colorsUI.style.display = 'block';
  });
}

function createTachometer(row) {
  const icon = e('i', {
    id: makeId(5, 'tach'),
    class: 'fas fa-tachometer-alt hover-light',
    title: 'settings' // call it 'settings', 'control panel', idk.
  });
  row.appendChild(e('td', {}, [icon]));

  const id = makeId(5, 'pop');
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

  if (targetElement.tagName.toLowerCase() === 'canvas') {
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
