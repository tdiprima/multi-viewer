/*! multi-viewer - v1.0.0 - 2023-10-16 */
/** @file commonFunctions.js - Contains utility functions */

/**
 * Change the way the image is displayed, based on user input.
 *
 * @param {Array} layers - Layers (images) to be displayed in viewer
 * @param {object} viewer - OpenSeadragon viewer
 * @param {object} [range] - For inside/outside; e.g. { "min": 70, "max": 170, "type": "inside" }
 * @param {object} [thresh] - Class thresholding; e.g. { "val": 128, "rgba": [ 255, 255, 0, 255 ], "classId": 1 }
 */
function setFilter(layers, viewer, range, thresh) {
  if (viewer.world) {
    // let start = performance.now();
    // console.log(setFilter.caller);

    const itemCount = viewer.world.getItemCount();
    let filterOpts = [];

    // One does not color just the affected layer; you have to do all of them.
    for (let i = 1; i < itemCount; i++) {
      const tiledImage = viewer.world.getItemAt(i);

      if (!isEmpty(range)) {
        // Use range values
        let rgba;
        if (range.type === 'inside') {
          rgba = [0, 255, 255, 255]; // #00ffff (Cyan)
        } else {
          rgba = [74, 0, 180, 255]; // #4a00b4 (Purple Heart)
        }
        filterOpts.push({
          items: tiledImage,
          processors: OpenSeadragon.Filters.PROBABILITY(range, rgba)
        });
      } else if (STATE.outline) {
        // Outline in blue.  Color can not have green in it.
        filterOpts.push({
          items: tiledImage,
          processors: OpenSeadragon.Filters.OUTLINE([0, 0, 255, 255]),
        });
      } else if (STATE.renderType === 'byProbability') {
        // Use color spectrum
        filterOpts.push({
          items: tiledImage,
          processors: OpenSeadragon.Filters.COLORLEVELS(layers[i].colorscheme.colorspectrum),
        });
      } else if (STATE.renderType === 'byClass' || STATE.renderType === 'byHeatmap') {
        let processor;
        if (thresh) {
          // Use threshold
          processor = OpenSeadragon.Filters.THRESHOLDING(thresh);
        } else {
          // Use color scheme
          processor = OpenSeadragon.Filters.COLORLEVELS(layers[i].colorscheme.colors);
        }
        filterOpts.push({
          items: tiledImage,
          processors: processor
        });
      } else if (STATE.renderType === 'byThreshold') {
        filterOpts.push({
          items: tiledImage,
          processors: OpenSeadragon.Filters.THRESHOLDING(thresh)
        });
      }
    }

    if (!isEmpty(filterOpts)) {
      try {
        // Set all layers at once (required)
        viewer.setFilterOptions({
          filters: filterOpts,
          loadMode: 'sync'
        });
      } catch (e) {
        console.error(e.message);
      }
    }

    // let end = performance.now();
    // console.log("start:", start, "end:", end);
    // console.log(`exec: ${end - start}`);

  } else {
    console.warn('No viewer.world');
  }
}

/**
 * Freeze/unfreeze viewer to allow for drawing.
 *
 * @param {object} viewer - OpenSeadragon.Viewer
 * @param {boolean} enable - toggle (enable/disable)
 */
function setOsdTracking(viewer, enable) {
  viewer.setMouseNavEnabled(enable);
  viewer.outerTracker.setTracking(enable);
  viewer.gestureSettingsMouse.clickToZoom = enable;
}

/**
 * Toggle between class names.
 *
 * Highlight/un-highlight button to indicate "on" or "off".
 *
 * @param {object} element - HTML element
 * @param {string} class0 - class0
 * @param {string} class1 - class1
 */
function toggleButton(element, class0, class1) {
  element.classList.toggle(class0);
  element.classList.toggle(class1);
}

/**
 * Test for null or undefined.
 *
 * @param obj
 * @return {boolean}
 */
function isRealValue(obj) {
  return obj !== null && obj !== undefined;
}

/**
 * Check to see if an Array, a string, or an object is empty.
 *
 * @param {Array|object|string} value
 * @return {boolean}
 */
const isEmpty = value => {
  const isEmptyObject = a => {
    if (typeof a.length === 'undefined') {
      // it's an Object, not an Array
      const hasNonempty = Object.keys(a).some(element => {
        return !isEmpty(a[element]);
      });
      return hasNonempty ? false : isEmptyObject(Object.keys(a));
    }

    return !a.some(element => {
      // check if array is really not empty as JS thinks
      return !isEmpty(element); // at least one element should be non-empty
    });
  };
  return (
    value === false
    || typeof value === 'undefined'
    || value === null
    || (typeof value === 'object' && isEmptyObject(value))
  );
};

/**
 * Message dialog.
 *
 * @param messageObject
 * @return {boolean}
 */
function alertMessage(messageObject) {
  window.alert(messageObject);
  return true;
}

/**
 * Randomize.
 *
 * @param {number} minm
 * @param {number} maxm
 * @return {number}
 */
function getRandomInt(minm, maxm) {
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}

/**
 * Generate random ID.
 *
 * @param {number} length
 * @param {string} prefix
 * @return {string}
 */
function createId(length, prefix) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (prefix) {
    result = prefix + result;
  }
  return result;
}

/**
 * Generate random ID 2.
 *
 * @return {string}
 */
function createId2() {
  return `_${Math.random().toString(36).substring(2, 13)}`;
}

/**
 * Get items by name, when the names are non-unique.
 *
 * @param {string} name
 * @return {Array}
 */
fabric.Canvas.prototype.getItemsByName = function(name) {
  const objectList = [];
  const objects = this.getObjects();

  for (let i = 0, len = this.size(); i < len; i++) {
    if (objects[i].name && objects[i].name === name) {
      objectList.push(objects[i]);
    }
  }

  return objectList;
};

/**
 * Element creation abstraction
 *
 * @param {string} tagName
 * @param {object} properties
 * @param {Array} children
 * @return {object}
 */
const e = (tagName, properties = {}, children = []) => {
  // Create the element
  const element = document.createElement(tagName);

  // Apply properties
  Object.keys(properties).forEach(property => {
    element.setAttribute(property, properties[property]);
  });

  // Append children
  children.forEach(c => {
    if (!c) return;
    const node = typeof c === 'string' ? document.createTextNode(c) : c;
    element.appendChild(node);
  });

  return element;
};

/**
 * rgb/a to array
 *
 * @param input
 * @return {*}
 */
function colorToArray(input) {
  const arrStr = input.replace(/[a-z%\s()]/g, '').split(',');
  return arrStr.map(i => Number(i));
}

/**
 * Scale rgb colors to percentage
 *
 * @param num
 * @return {number}
 */
const scaleToPct = num => {
  return (num / 255) * 100;
};

/**
 * num to rgb
 *
 * @param num
 * @return {number}
 */
const scaleToRgb = num => {
  return (num * 255) / 100;
};

/**
 * Render Types
 *
 * @type {string[]}
 */
// const RENDER_TYPES = ['byProbability', 'byClass', 'byHeatmap', 'byThreshold'];
const RENDER_TYPES = ['byProbability', 'byClass', 'byHeatmap'];

/**
 * State
 *
 * @type {{attenuate: boolean, outline: boolean, renderType: string}}
 */
const STATE = {
  attenuate: false,
  outline: false,
  renderType: RENDER_TYPES[0]
};

/**
 * Stringify shortcut
 * @param param
 * @return {string}
 */
function stringy(param) {
  return JSON.stringify(param);
}

/**
 * Setting values in storage
 * @param canvas
 * @param options
 */
function populateStorage(canvas, options) {
  localStorage.setItem('theme', document.body.className);
  const myObject = canvas.toJSON(['name', 'tag']);
  localStorage.setItem('canvas', stringy(myObject));
  localStorage.setItem('state', stringy(STATE));
  localStorage.setItem('options', stringy(options));
  // console.log("saved", window.localStorage);
}

/**
 * Save user settings and markup:
 *
 * <ul>
 *  <li> CSS theme (dark, light)
 *  <li> Canvas objects (polygons, annotations, measurement, etc.)
 *  <li> App state (attenuate, outline, renderType)
 *  <li> Options (toolbarOn, paintbrushColor)
 * </ul>
 *
 * @param {object} canvas - Our osd fabric.js canvas object
 * @param {object} options
 * @param {string} options.paintbrushColor - example: "#0ff"
 * @param {boolean} options.toolbarOn - example: true
 */
function saveSettings(canvas, options) {
  // For now, set values in localStorage
  populateStorage(canvas, options);
  const jsonObject = {
    theme: document.body.className,
    canvas: canvas.toJSON(['name', 'tag']),
    state: STATE,
    options,
  };
  console.log('saved', jsonObject);
  // console.log('canvas', jsonObject.canvas.objects);
  // console.log('stringify', stringy(jsonObject));
}

/**
 * Location of application images and osd images.
 *
 * The following setup is for running this app on our Apache Wicket implementation.
 *
 * @type {{appImages: string, osdImages: string}}
 */
let CONFIG = {
  osdImages: '/multi-viewer/vendor/openseadragon/images/',
  appImages: '/multi-viewer/images/'
};

/** Configuration below is for working *locally*. */
// let CONFIG = {
//   osdImages: 'vendor/openseadragon/images/',
//   appImages: 'images/'
// }

/**
 * Max (as in color range 0 - 255)
 *
 * @type {number}
 */
const MAX = 255;

/**
 * Microns Per Pixel (default=0.25; actual value set later)
 *
 * @type {number}
 */
let MICRONS_PER_PIX = 0.25;

/**
 * @file pageSetup.js is the root file for this app
 * @author Tammy DiPrima
 *
 * @param {string} divId - Main div id.
 * @param {object} images - Items to be displayed in viewer.
 * @param {number} numViewers - Total number of viewers.
 * @param {number} rows - LAYOUT: Number of rows (of viewers)
 * @param {number} columns - LAYOUT: Number of columns (of viewers)
 * @param {number} width - Viewer width
 * @param {number} height - Viewer height
 * @param {object} opts - Multi-viewer options; paintbrush, etc.
 */
const pageSetup = (divId, images, numViewers, rows, columns, width, height, opts) => {
  let viewers = [];
  // PRINT IMAGES
  // const div = document.createElement('div');
  // div.innerText = JSON.stringify(images)
  // document.body.appendChild(div);

  if (!isRealValue(images) || !isRealValue(images[0])) {
    // No images; notify and send them home.
    document.write("<script>window.alert('You are logged out...');window.location=`${window.location.origin}/`;</script>");
  }
  // else {
  //   // TODO: MY STUFF
  //   images = images.slice(0, 2);
  //   numViewers = 2;
  //   rows = 1;
  //   columns = 2;
  //   width = 800;
  //   height = 600;
  // }

  document.addEventListener('DOMContentLoaded', setUp);
  window.addEventListener('keydown', hotKeysHandler);

  function setUp() {
    new Promise(resolve => {
      return resolve(opts);
    })
      .then(opts => {
        document.body.classList.add('theme--default');
        // dark-mode
        const modeToggle = e('i', { class: 'fas fa-moon moon' });

        // Slide name
        let name;
        const slide = images[0][0].location; // layer 0 location
        if (slide.includes('TCGA')) {
          const str = slide.match(/TCGA-[^%.]+/)[0];
          name = `Slide: ${str}`;
        } else {
          const arr = slide.split('/');
          name = `Slide: ${arr[arr.length - 1]}`;
        }

        const top = e('div', { style: 'display: flex' }, [
          e('div', { style: 'flex: 1' }, [modeToggle]),
          e('div', { style: 'flex: 1; text-align: right;' }, [name])
        ]);

        const referenceNode = document.querySelector(`#${divId}`);
        referenceNode.before(top);

        const getMode = localStorage.getItem('mode');
        if (getMode && getMode === 'dark-mode') {
          toggleButton(document.body, "theme--default", "theme--dark");
        }

        // toggle dark and light mode
        modeToggle.addEventListener('click', () => {
          toggleButton(modeToggle, "fa-sun", "fa-moon");
          toggleButton(modeToggle, "sun", "moon");
          toggleButton(document.body, "theme--default", "theme--dark");

          // Keep user's selected mode even on page refresh
          if (!document.body.classList.contains('theme--dark')) {
            localStorage.setItem('mode', 'light-mode');
          } else {
            localStorage.setItem('mode', 'dark-mode');
          }
        });

        // CREATE TABLE FOR VIEWERS
        const mainDiv = document.getElementById(divId);
        const table = e('table');
        mainDiv.appendChild(table); // TABLE ADDED TO PAGE

        // CREATE ROWS & COLUMNS
        let r;
        const num = rows * columns;
        let count = 0;
        for (r = 0; r < rows; r++) {
          const tr = table.insertRow(r);
          let c;
          for (c = 0; c < columns; c++) {
            const td = tr.insertCell(c);
            const osdId = createId(11); // DIV ID REQUIRED FOR OSD
            // CREATE DIV WITH CONTROLS, RANGE SLIDERS, BUTTONS, AND VIEWER.
            const idx = count;
            count++;

            if (numViewers < num && count - 1 === numViewers) {
              // we've done our last viewer
              break;
            }

            const container = e('div', { class: 'divSquare' });
            container.style.width = `${width}px`;
            td.appendChild(container); // ADD CONTAINER TO CELL

            let htm = '';

            // NAVIGATION TOOLS
            if (numViewers > 1) {
              htm += `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
<input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`;
            }

            if (opts && opts.toolbarOn) {
              htm += `<div class="controls showDiv" id="hideTools${idx}"><div id="tools${idx}" class="showHover">`;

              // ANNOTATION TOOLS
              htm += '<div class="floated">';

              if (opts && opts.paintbrushColor) {
                htm += `<mark id="mark${idx}">${opts.paintbrushColor}</mark>&nbsp;`;
              } else {
                htm += `<mark id="mark${idx}">#00f</mark>&nbsp;`;
              }

              htm += `<button id="btnDraw${idx}" class="annotationBtn" title="Draw"><i class="fas fa-pencil-alt"></i></button>
<button id="btnEdit${idx}" class="annotationBtn" title="Edit"><i class="fas fa-draw-polygon"></i></button>
<!--<button id="btnAnnotate${idx}" class="annotationBtn" title="Add Annotation"><i class="fas fa-sticky-note"></i></button>-->
<button id="btnGrid${idx}" class="annotationBtn" title="Grid"><i class="fas fa-border-all"></i></button>
<button id="btnGridMarker${idx}" class="annotationBtn" title="Mark grid"><i class="fas fa-paint-brush"></i></button>
<button id="btnRuler${idx}" class="annotationBtn" title="Measure in microns"><i class="fas fa-ruler"></i></button>
<button id="btnShare${idx}" class="annotationBtn" title="Share this link"><i class="fas fa-share-alt"></i></button>
<button id="btnCam${idx}" class="annotationBtn" title="Snapshot"><i class="fas fa-camera"></i></button>
<button id="btnBlender${idx}" class="annotationBtn" title="Blend-modes"><i class="fas fa-blender"></i></button>
<button id="btnCrosshairs${idx}" class="annotationBtn" title="Crosshairs"><i class="fas fa-crosshairs"></i></button>
<button id="btnSave${idx}" class="annotationBtn" title="Save"><i class="fas fa-save"></i></button>
<div class="mag" style="display: inline">
  <button class="annotationBtn">
  <i class="fas fa-search"></i>
  </button>
  <!-- data-value = image zoom -->
  <div class="mag-content">
    <a href="#" data-value="0.025" id="1">1x</a>
    <a href="#" data-value="0.05" id="2">2x</a>
    <a href="#" data-value="0.1" id="4">4x</a>
    <a href="#" data-value="0.25" id="10">10x</a>
    <a href="#" data-value="0.5" id="20">20x</a>
    <a href="#" data-value="1.0" id="40">40x</a>
  </div>
</div>
<button id="btnMapMarker" class="annotationBtn" style="display: none"><i class="fas fa-map-marker-alt"></i> Hide markers</button>
</div>`;

              // END
              htm += '</div></div>';
            }

            // CREATE VIEWER
            htm += `<table><tr><td><div id="${osdId}" class="viewer dropzone" style="width: ${width}px; height: ${height}px;"></div>
</td><td id="layersAndColors${idx}" style="vertical-align: top;"></td>
</tr></table>`;

            // ADD VIEWER & WIDGETS TO CONTAINING DIV
            container.innerHTML = htm;

            // DRAW POLYGON COLOR PICKER
            const colorPicker = new CP(document.getElementById(`mark${idx}`));
            colorPicker.on('change', function(r, g, b, a) {
              this.source.value = this.color(r, g, b, a);
              this.source.innerHTML = this.color(r, g, b, a);
              this.source.style.backgroundColor = this.color(r, g, b, a);
            });

            const vInfo = { idx, osdId, layers: images[idx] };
            // Create ImageViewer object and add to array
            viewers.push(new ImageViewer(vInfo, numViewers, opts));
          }
        }

        return viewers;
      })
      .then(viewers => {
        // PAN/ZOOM CONTROLLER - accepts array of ImageViewers
        synchronizeViewers(viewers);
      });
  }

  // Hot keys
  function hotKeysHandler(evt) {
    const key = evt.key.toLocaleLowerCase();

    // esc: means 'Forget what I said I wanted to do!'; 'Clear'.
    if (key === 'escape' || key === 'esc') {
      evt.preventDefault();
      // Button-reset
      const buttons = document.getElementsByClassName('btnOn');
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].click();
      }
    }

    // control-r for 'ruler'
    if (evt.ctrlKey && key === 'r') {
      evt.preventDefault();
      for (let i = 0; i < viewers.length; i++) {
        document.querySelectorAll('[id^="btnRuler"]').forEach(node => {
          node.click();
        });
      }
    }
  }
};

/**
 * Allow user to edit the polygon that they've drawn.
 *
 * @param {object} btnEdit - The edit-polygon button
 * @param {object} overlay - The target canvas
 */
const editPolygon = (btnEdit, overlay) => {
  btnEdit.addEventListener('click', function() {
    toggleButton(this, 'btnOn', 'annotationBtn');
    Edit(this, overlay.fabricCanvas());
  });
};

// Position handling: fabricjs.com custom-controls-polygon
function polygonPositionHandler(dim, finalMatrix, fabricObject) {
  // This function looks at the pointIndex of the control and returns the
  // current canvas position for that particular point.
  const x1 = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x;
  const y1 = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;

  return fabric.util.transformPoint(
    { x: x1, y: y1 },

    fabric.util.multiplyTransformMatrices(
      fabricObject.canvas.viewportTransform,
      fabricObject.calcTransformMatrix(),
    )
  );
}

// Custom action handler makes the control change the current point.
function actionHandler(eventData, transform, x, y) {
  const polygon = transform.target;
  const currentControl = polygon.controls[polygon.__corner];

  const mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center');
  const polygonBaseSize = polygon._getNonTransformedDimensions();
  const size = polygon._getTransformedDimensions(0, 0);
  const finalPointPosition = {
    x: (mouseLocalPosition.x * polygonBaseSize.x) / size.x + polygon.pathOffset.x,
    y: (mouseLocalPosition.y * polygonBaseSize.y) / size.y + polygon.pathOffset.y
  };
  polygon.points[currentControl.pointIndex] = finalPointPosition;
  return true;
}

// Handles the object that changes dimensions, while maintaining the correct position.
function anchorWrapper(anchorIndex, fn) {
  return (eventData, transform, x, y) => {
    const fabricObject = transform.target;

    const absolutePoint = fabric.util.transformPoint(
      {
        x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
        y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
      },
      fabricObject.calcTransformMatrix(),
    );
    const actionPerformed = fn(eventData, transform, x, y);
    // IMPORTANT!  VARIABLE 'newDim' NEEDS TO EXIST. Otherwise, the bounding box gets borked:
    /* eslint-disable no-unused-vars */
    const newDim = fabricObject._setPositionDimensions({}); // DO NOT TOUCH THIS VARIABLE.
    const polygonBaseSize = fabricObject._getNonTransformedDimensions();
    const newX =      (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x;
    const newY =      (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
    return actionPerformed;
  };
}

function getPolygon(canvas) {
  if (canvas.getActiveObject()) {
    // User selected object that they want to work on.
    return canvas.getActiveObject();
  }
  const x = canvas.getObjects('polygon');
  if (x.length === 0) {
    // No polygons exist on this canvas. User will get an alert message.
    return 'null';
  }
  if (x.length === 1) {
    // There's only one object; return that one.
    return x[0];
  }
  // User will get an alert message that they need to select which one they want.
  return 'null';
}

function Edit(btnEdit, canvas) {
  const fabricPolygon = getPolygon(canvas);

  if (isRealValue(fabricPolygon)) {
    canvas.setActiveObject(fabricPolygon);
    fabricPolygon.edit = !fabricPolygon.edit;

    if (fabricPolygon.edit) {
      const lastControl = fabricPolygon.points.length - 1;
      fabricPolygon.cornerColor = 'rgba(0, 0, 255, 255)';
      fabricPolygon.cornerStyle = 'circle';
      // Create one new control for each polygon point
      fabricPolygon.controls = fabricPolygon.points.reduce((acc, point, index) => {
        acc[`p${index}`] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
          actionName: 'modifyPolygon',
          pointIndex: index
        });
        return acc;
      }, {});
    } else {
      fabricPolygon.cornerColor = 'rgba(0, 0, 255, 0.5)';
      fabricPolygon.cornerStyle = 'rect';
      fabricPolygon.controls = fabric.Object.prototype.controls;
    }
    fabricPolygon.hasBorders = !fabricPolygon.edit;
    canvas.requestRenderAll();
  } else {
    toggleButton(btnEdit, 'btnOn', 'annotationBtn');
    alertMessage('Please select a polygon for editing.');
  }
}

/**
 * Allow user to draw a polygon on the image.
 *
 * @param {object} viewerInfo - Info specific to 'this' viewer
 * @param {object} viewer - OSD viewer object
 * @param {object} overlay - Canvas on which to draw the polygon
 */
const drawPolygon = (viewerInfo, viewer, overlay) => {
  let idx = viewerInfo.idx;
  let btnDraw = document.getElementById(`btnDraw${idx}`);
  let mark = document.getElementById(`mark${idx}`);
  let canvas = overlay.fabricCanvas();
  let tag;

  let paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  paintBrush.decimate = 12;
  paintBrush.color = mark.innerHTML;

  canvas.on('mouse:over', evt => {
    if (evt.target !== null) {
      fillPolygon(evt, canvas, true);
    }
  });

  canvas.on('mouse:out', evt => {
    if (evt.target !== null) {
      fillPolygon(evt, canvas, false);
    }
  });

  canvas.on('mouse:up', (evt) => {
    // annotate(evt); // TODO: wip
    drawingOff(canvas, viewer);
  });

  canvas.on('path:created', opts => {
    tag = createId2();
    pathCreatedHandler(opts, btnDraw, canvas, paintBrush, viewer);
  });

  btnDraw.addEventListener('click', function () {
    toggleButton(this, 'btnOn', 'annotationBtn');
    if (canvas.isDrawingMode) {
      // Drawing off
      drawingOff(canvas, viewer);
    } else {
      // Drawing on
      canvas.isDrawingMode = true;
      canvas.on('mouse:down', () => {
        setGestureSettings(canvas, viewer);
      });
      paintBrush.color = mark.innerHTML;
      paintBrush.width = 10 / viewer.viewport.getZoom(true);
      setOsdTracking(viewer, false);
    }
  });

  function annotate(evt) {
    if (canvas.isDrawingMode) {
      let target = evt.currentTarget;

      // FABRIC TEXTBOX
      let text = new fabric.Textbox('Annotate...', {
        width: 250,
        cursorColor: 'blue',
        top: target.top + target.height + 10,
        left: target.left + target.width + 10,
        fontSize: 20,
        editable: true,
        tag: tag
      });
      canvas.add(text);

      /*
      // Try to re-create/simplify annotorious-style div for annotation
      let left, top;
      top = target.top + target.height + 25;
      left = target.left + target.width + 25;
      let myDiv = `<div class="r6o-editor r6o-arrow-top r6o-arrow-left" style="transform: translate(0px); top: ${top}px; left: ${left}px; opacity: 1;">
      <div class="r6o-arrow"></div><!-- ARROW -->
      <div class="r6o-editor-inner">
        <div class="r6o-widget comment">
          <textarea class="r6o-editable-text" placeholder="Add a comment..." disabled rows="1" style="overflow: hidden; overflow-wrap: break-word; height: 35px;"></textarea>
          <div class="r6o-icon r6o-arrow-down">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 940" width="12">
              <metadata>IcoFont Icons</metadata>
              <title>simple-down</title>
              <glyph glyph-name="simple-down" unicode="\uEAB2" horiz-advx="1000"></glyph>
              <path fill="currentColor" d="M200 392.6l300 300 300-300-85.10000000000002-85.10000000000002-214.89999999999998 214.79999999999995-214.89999999999998-214.89999999999998-85.10000000000002 85.20000000000005z"></path>
            </svg>
          </div>
        </div><!-- END comment -->
        <div class="r6o-widget comment editable">
          <textarea class="r6o-editable-text" placeholder="Add a reply..." rows="1" style="overflow: hidden; overflow-wrap: break-word; height: 35px;"></textarea>
        </div><!-- END reply -->
        <div class="r6o-widget r6o-tag">
          <ul class="r6o-taglist">
            <!-- existing tags go here. -->
            <li></li>
          </ul><!-- END taglist -->
          <div class="r6o-autocomplete">
            <div><input placeholder="Add tag..."></div>
            <ul><!-- tags go here --></ul>
          </div><!-- END add tag -->
        </div><!-- END tag section -->
        <div class="r6o-footer r6o-draggable">
          <button class="r6o-btn left delete-annotation" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="12">
              <path fill="currentColor" d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"></path>
            </svg>
          </button><!-- DELETE button -->
          <button class="r6o-btn outline">Cancel</button><!-- CANCEL button -->
          <button class="r6o-btn">OK</button><!-- OK button -->
        </div><!-- END footer -->
      </div><!-- END editor-inner -->
    </div><!-- END editor -->`;
      try {
        const myDiv1 = e('div');
        myDiv1.style.left = `${left}px`;
        myDiv1.style.top = `${top}px`;
        myDiv1.innerHTML = myDiv;
        document.body.appendChild(myDiv1);

      } catch (e) {
        console.log(`%c${e.message}`, "color: #ff00cc;");
      }
      */
    }
  }

  function drawingOff(canvas, viewer) {
    canvas.isDrawingMode = false;
    canvas.off('mouse:down', () => {
      setGestureSettings(canvas, viewer);
    });
    setOsdTracking(viewer, true);
  }

  function pathCreatedHandler(options, button, canvas, paintBrush, viewer) {
    convertPathToPolygon(options.path, canvas, paintBrush);
    setupDeleteButton(options.path);
    toggleButton(button, 'annotationBtn', 'btnOn');
    canvas.off('path:created', () => {
      pathCreatedHandler(options, button, canvas, paintBrush, viewer);
    });
  }

  function setGestureSettings(canvas, viewer) {
    viewer.gestureSettingsMouse.clickToZoom = !canvas.getActiveObject();
  }

  function setupDeleteButton(obj) {
    obj.lockMovementX = true;
    obj.lockMovementY = true;
    let deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    let deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    function renderIcon(icon) {
      return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        let size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(icon, -size / 2, -size / 2, size, size);
        ctx.restore();
      };
    }

    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 15,
      offsetY: -15,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderIcon(deleteImg),
      cornerSize: 24
    });

    function deleteObject(mouseEvent, transform) {
      let target = transform.target;
      try {
        let canvas = target.canvas;
        canvas.remove(target);
        canvas.requestRenderAll();
      } catch (e) {
        console.error(`%c${e.message}`, 'font-size: larger;');
      }
    }
  }

  function convertPathToPolygon(pathObject, canvas, paintBrush) {
    let _points0 = pathObject.path.map(item => ({
      x: item[1],
      y: item[2]
    }));

    let poly = new fabric.Polygon(_points0, {
      left: pathObject.left,
      top: pathObject.top,
      fill: '',
      strokeWidth: paintBrush.width,
      stroke: paintBrush.color,
      scaleX: pathObject.scaleX,
      scaleY: pathObject.scaleY,
      objectCaching: false,
      transparentCorners: false,
      cornerColor: 'rgba(0, 0, 255, 0.5)',
      cornerStyle: 'square',
      tag: tag
    });
    canvas.add(poly);
    poly.setControlVisible('tr', false);
    canvas.setActiveObject(poly);
    canvas.remove(pathObject);
  }

  function fillPolygon(pointerEvent, canvas, fill) {
    let obj = pointerEvent.target;

    if (isRealValue(obj) && obj.type === 'polygon') {
      // polygon hover
      if (fill) {
        obj.set({
          fill: obj.stroke,
          opacity: 0.5
        });
        // displayInfo(obj, canvas);
      } else {
        obj.set({
          fill: ''
        });
        // canvas.remove(infoText);
      }
      canvas.renderAll();
    }
  }

  // function displayInfo(obj, canvas) {
  //   // Display some kind of information. TBA.
  //   // Right now this displays what type of object it is. (Polygon, obviously.)
  //   let type = obj.type;
  //   let left = obj.left;
  //   let top = obj.top;
  //
  //   let infoText = new fabric.Text(type, {
  //     fontSize: 18,
  //     fontFamily: 'Courier',
  //     backgroundColor: 'rgba(102, 102, 102, 0.7)',
  //     stroke: 'rgba(255, 255, 255, 1)',
  //     fill: 'rgba(255, 255, 255, 1)',
  //     left, // pointer.x,
  //     top, // pointer.y
  //   });
  //   canvas.add(infoText);
  // }
};

/**
 * Draw a grid over the canvas and allow the user to mark the squares.
 * For demonstration purposes.
 *
 * @param {object} btnGrid - Clickable grid icon
 * @param {object} btnGridMarker - Clickable marker icon
 * @param {object} overlay - Canvas on which to draw the grid
 */
const gridOverlay = (btnGrid, btnGridMarker, overlay) => {
  const cellSize = 25;

  const gridProps = {
    canvas: overlay.fabricCanvas(),
    canvasWidth: Math.ceil(overlay.fabricCanvas().width),
    canvasHeight: Math.ceil(overlay.fabricCanvas().height),
    cellWidth: cellSize,
    cellHeight: cellSize,
    color: '#C0C0C0',
    cellX: [],
    cellY: [],
    gridAdded: false
  };

  btnGrid.addEventListener('click', function () {
    gridHandler(this, gridProps);
  });

  btnGridMarker.addEventListener('click', function () {
    markerHandler(this, gridProps);
  });

  drawCross(btnGrid.id.slice(-1), gridProps.canvas);
};

function gridHandler(button, gridProps) {
  toggleButton(button, 'btnOn', 'annotationBtn');
  const on = button.classList.contains('btnOn');
  if (on) {
    turnGridOn(gridProps);
    gridProps.gridAdded = true;
    // button.innerHTML = '<i class="fas fa-border-all"></i> Remove grid'
  }

  if (!on) {
    turnGridOff(gridProps);
    gridProps.gridAdded = false;
    // button.innerHTML = '<i class="fas fa-border-all"></i> Draw grid'
  }
}

function turnGridOff(gridProps) {
  const r = gridProps.canvas.getObjects('line');
  for (let i = 0; i < r.length; i++) {
    gridProps.canvas.remove(r[i]);
  }
}

function turnGridOn(gridProps) {
  const lineProps = {stroke: gridProps.color, strokeWidth: 2, selectable: false};

  createHorizontalLines(gridProps, lineProps);
  createVerticalLines(gridProps, lineProps);

  gridProps.canvas.renderAll();
  gridProps.gridAdded = true;
}

function createHorizontalLines(gridProps, lineProps) {
  let y;
  for (y = 0; y < Math.ceil(gridProps.canvasHeight / gridProps.cellHeight); ++y) {
    gridProps.canvas.add(
      new fabric.Line(
        [0, y * gridProps.cellHeight, gridProps.canvasWidth, y * gridProps.cellHeight],
        lineProps,
      ),
    );
    gridProps.cellY[y + 1] = y * gridProps.cellHeight; // and keep track of the y cells
  }
}

function createVerticalLines(gridProps, lineProps) {
  let x;
  for (x = 0; x < Math.ceil(gridProps.canvasWidth / gridProps.cellWidth); ++x) {
    gridProps.canvas.add(
      new fabric.Line(
        [x * gridProps.cellWidth, 0, x * gridProps.cellWidth, gridProps.canvasHeight],
        lineProps,
      ),
    );
    gridProps.cellX[x + 1] = x * gridProps.cellWidth; // and keep track of the x cells
  }
}

function fillInGrid(pointerEvent, gridProps) {
  const mousePosition = getMousePosition(pointerEvent, gridProps);
  const cellPosition = getCellPosition(mousePosition);

  const rect = new fabric.Rect({
    left: gridProps.cellX[cellPosition.x],
    top: gridProps.cellY[cellPosition.y],
    fill: 'red',
    width: gridProps.cellWidth,
    height: gridProps.cellHeight,
    opacity: 0.5,
    selectable: false
  });
  gridProps.canvas.add(rect);
}

function getMousePosition(pointerEvent, gridProps) {
  const pointer = gridProps.canvas.getPointer(pointerEvent.e);
  const positionX = pointer.x / gridProps.cellWidth;
  const positionY = pointer.y / gridProps.cellHeight;
  return {x: positionX, y: positionY};
}

function getCellPosition(mousePosition) {
  const positionX = Math.ceil(mousePosition.x + 0.001);
  const positionY = Math.ceil(mousePosition.y + 0.001);
  return {x: positionX, y: positionY};
}

function markerHandler(button, gridProps) {
  toggleButton(button, 'btnOn', 'annotationBtn');
  const on = button.classList.contains('btnOn');

  if (!on) {
    // Done marking; remove mouse:move listener because we use it for other things.
    gridProps.canvas.__eventListeners['mouse:move'] = [];
    // button.innerHTML = '<i class="fas fa-paint-brush"></i> Mark grid'
  }

  if (on) {
    if (gridProps.gridAdded) {
      gridProps.canvas.on('mouse:move', pointerEvent => {
        fillInGrid(pointerEvent, gridProps);
      });
      // button.innerHTML = '<i class="fas fa-paint-brush"></i> Done marking'
    } else {
      toggleButton(button, 'btnOn', 'annotationBtn'); // turn it back off; we're not letting them do this
      alertMessage('Please draw a grid first.');
    }
  }
}

/**
 * Toggle cross on/off
 * @param {boolean} display
 * @param canvas
 */
function toggleCross(display, canvas) {
  if (!display) {
    canvas.remove(...canvas.getItemsByName('cross'));
    // For image:
    // let cross = canvas.getActiveObject()
    // canvas.remove(cross)
  } else {
    const midWidth = canvas.width / 2;
    const midHeight = canvas.height / 2;

    // Draw a line from x,0 to x,canvas.height.
    line(midWidth, 0, midWidth, canvas.height);

    // Draw a line from 0,y to width,y.
    line(0, midHeight, canvas.width, midHeight);

    function line(x1, y1, x2, y2) {
      const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: 'yellow',
        selectable: false,
        strokeWidth: 2,
        hoverCursor: 'default',
        evented: false,
        name: 'cross'
      });
      canvas.add(line);
    }
  }
}

/**
 * Draw cross ("crosshairs") over viewer.
 * @param idx
 * @param canvas
 */
function drawCross(idx, canvas) {
  const btnCrosshairs = document.getElementById(`btnCrosshairs${idx}`);
  btnCrosshairs.addEventListener('click', () => {
    if (btnCrosshairs.classList.contains('btnOn')) {
      toggleCross(false, canvas);
    } else {
      toggleCross(true, canvas);
    }
    toggleButton(btnCrosshairs, 'btnOn', 'annotationBtn');
  });
}

/**
 * For the spot that was right-clicked in viewer A, place a marker
 * at that location on all viewers.
 *
 * @param {object} osdViewer - The OpenSeadragon viewer that has the focus
 * @param {object} imageViewerArray - Array of ImageViewers
 */
const mapMarker = (osdViewer, imageViewerArray) => {
  overrideRightClickMenu(osdViewer.element);

  handleMarkerDisplay(osdViewer, imageViewerArray);

  handleButtonShowHide();
};

function overrideRightClickMenu(viewerDiv) {
  viewerDiv.addEventListener('contextmenu', mouseEvent => {
    mouseEvent.preventDefault();
  });
}

function handleMarkerDisplay(osdViewer, imageViewerArray) {
  osdViewer.addHandler('canvas-nonprimary-press', osdEvent => {
    if (isRightClick(osdEvent)) {
      const clickPosition = osdEvent.position;
      const clickPositionViewport = osdViewer.viewport.pointFromPixel(clickPosition);

      const buttons = document.querySelectorAll('#btnMapMarker');
      buttons.forEach(item => {
        item.style.display = 'block';
      });
      displayMapMarker(clickPositionViewport, osdViewer, imageViewerArray);
    }
  });
}

function isRightClick(evt) {
  return evt.button === 2;
}

function displayMapMarker(point, osdViewer, imageViewerArray) {
  imageViewerArray.forEach(item => {
    item.getViewer().addOverlay({
      element: createLink(),
      location: point,
      placement: 'BOTTOM',
      checkResize: false
    });
  });
}

function createLink() {
  const link = e('a', { href: '#', id: 'pin', class: 'fas fa-map-marker pointer' });
  link.style = 'text-decoration: none; font-size: 22px; color: red;';
  link.dataset.href = '#';
  return link;
}

function handleButtonShowHide() {
  const buttons = document.querySelectorAll('#btnMapMarker');
  buttons.forEach(elem => {
    let markersHaveBeenDrawn = false;
    let style;
    let html;
    elem.addEventListener('click', function() {
      if (markersHaveBeenDrawn) {
        style = 'block';
        html = '<i class="fas fa-map-marker"></i> Hide markers';
      } else {
        style = 'none';
        html = '<i class="fas fa-map-marker"></i> Show markers';
      }
      this.innerHTML = html;
      document.querySelectorAll('#pin').forEach(thing => {
        thing.style.display = style;
      });
      markersHaveBeenDrawn = !markersHaveBeenDrawn;
    });
  });
}

/**
 * A measuring tool.  Measure in microns.
 *
 * @param {object} btnRuler - Button that activates the ruler
 * @param {object} viewer - OpenSeadragon.viewer
 * @param {object} overlay - Canvas on which to draw the measurement
 */
const ruler = (btnRuler, viewer, overlay) => {
  let fabLine;
  let isDown;
  let zoom;
  let mode = 'x';
  let fabText;
  let fabStart = { x: 0, y: 0 };
  let fabEnd = { x: 0, y: 0 };
  let osdStart = { x: 0, y: 0 };
  let osdEnd = { x: 0, y: 0 };

  // Define original or base font size and rectangle dimensions
  const baseFontSize = 15;
  const baseStrokeWidth = 2;

  let bgColor, fontColor, lineColor;
  // lineColor = '#ccff00'; // neon yellow
  // lineColor = '#39ff14'; // neon green
  // lineColor = '#b3f836'; // in-between
  // fontColor = '#000';
  // bgColor = 'rgba(255,255,255,0.5)';

  bgColor = '#009933';
  fontColor = '#fff';
  lineColor = '#00cc01';

  let canvas = overlay.fabricCanvas();

  function clear() {
    fabStart.x = 0.0;
    fabEnd.x = 0.0;
    fabStart.y = 0.0;
    fabEnd.y = 0.0;
    canvas.remove(...canvas.getItemsByName('ruler'));
  }

  function mouseDownHandler(o) {
    clear();
    zoom = viewer.viewport.getZoom(true);
    if (mode === 'draw') {
      setOsdTracking(viewer, false);
      isDown = true;

      try {
        if (!o || !o.e) throw new Error('Event object or client coordinates are missing');
        let webPoint = new OpenSeadragon.Point(o.e.clientX, o.e.clientY);

        if (!viewer || !viewer.viewport) throw new Error('Viewer or viewport is not initialized');
        let viewportPoint = viewer.viewport.pointFromPixel(webPoint);

        let item = viewer.world.getItemAt(0);
        if (!item) throw new Error('No item found at index 0 in the viewer world');
        osdStart = item.viewportToImageCoordinates(viewportPoint);
      } catch (e) {
        console.error(e.message);
      }

      let pointer = canvas.getPointer(o.e);
      let points = [pointer.x, pointer.y, pointer.x, pointer.y];
      fabStart.x = pointer.x;
      fabStart.y = pointer.y;
      fabLine = new fabric.Line(points, {
        strokeWidth: adjustor().lineWidth, // adjust stroke width on zoom
        stroke: lineColor,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'ruler'
      });
      canvas.add(fabLine);
    } else {
      setOsdTracking(viewer, true); // keep image from panning/zooming as you draw line
      canvas.forEachObject(obj => {
        obj.setCoords(); // update coordinates
      });
    }
  }

  function difference(a, b) {
    return Math.abs(a - b);
  }

  function getHypotenuseLength(a, b, mpp) {
    if (!mpp || typeof mpp !== 'number' || mpp <= 0) {
      console.error("Invalid MICRONS_PER_PIX value:", mpp);
      return 0;
    }
    return Math.sqrt(a * a * mpp * mpp + b * b * mpp * mpp);
  }

  function valueWithUnit(value) {
    if (value < 0.000001) {
      // 1 µ = 1e+9 fm
      return `${(value * 1000000000).toFixed(3)} fm`;
    }
    if (value < 0.001) {
      // 1 µ = 1e+6 pm
      return `${(value * 1000000).toFixed(3)} pm`;
    }
    if (value < 1) {
      // 1 µ = 1000 nm
      return `${(value * 1000).toFixed(3)} nm`;
    }
    if (value >= 1000) {
      // 1 µ = 0.001 mm
      return `${(value / 1000).toFixed(3)} mm`;
    }
    // 1 µ
    return `${value.toFixed(3)} \u00B5m`;
  }

  function adjustor() {
    let currentZoom = viewer.viewport.getZoom(true); // Get the current zoom level from OpenSeadragon.
    let scaleFactor = 1 / currentZoom; // Calculate a scaling factor based on the zoom level.
    // Adjust original dimensions with scaleFactor
    let adjustedFontSize = baseFontSize * scaleFactor;
    let adjustedStrokeWidth = baseStrokeWidth * scaleFactor;
    return { scaleFactor: scaleFactor, fontSize: adjustedFontSize, lineWidth: adjustedStrokeWidth };
  }

  function drawText(x, y, text) {
    canvas.remove(fabText); // remove text element before re-adding it

    fabText = new fabric.Text(text, {
      left: x - 0.5,
      top: y - 0.5,
      originX: 'left',
      originY: 'top',
      fill: fontColor,
      fontFamily: "Arial,Helvetica,sans-serif",
      fontSize: adjustor().fontSize,
      textBackgroundColor: bgColor,
      selectable: false,
      evented: false,
      name: 'ruler'
    });
    canvas.add(fabText);
  }

  function mouseMoveHandler(o) {
    if (!isDown) return;

    let webPoint = new OpenSeadragon.Point(o.e.clientX, o.e.clientY);
    let viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    osdEnd = viewer.world.getItemAt(0).viewportToImageCoordinates(viewportPoint);

    let w = difference(osdStart.x, osdEnd.x);
    let h = difference(osdStart.y, osdEnd.y);
    let hypot = getHypotenuseLength(w, h, MICRONS_PER_PIX);
    let t = valueWithUnit(hypot);

    let pointer = canvas.getPointer(o.e);
    fabLine.set({ x2: pointer.x, y2: pointer.y });
    fabEnd.x = pointer.x;
    fabEnd.y = pointer.y;

    if (mode === 'draw') {
      // Show info while drawing line
      drawText(fabEnd.x, fabEnd.y, t);
    }
    canvas.renderAll();
  }

  function mouseUpHandler(o) {
    isDown = false;
    // canvas.forEachObject(function(object) {
    //   console.log("object", object);
    //   object.setCoords(); // update coordinates
    //   object.set('selectable', true);
    // });
    fabLine.setCoords();
    fabText.setCoords();

    // Make sure user actually drew a line
    if (!(fabStart.x === fabEnd.x || fabStart.y === fabEnd.y || fabEnd.x === 0)) {
      console.log(`%clength: ${fabText.text}`, 'color: #ccff00;');
      let pointer = canvas.getPointer(o.e);
      drawText(pointer.x, pointer.y, fabText.text);
      canvas.renderAll();
    }
  }

  btnRuler.addEventListener('click', () => {
    const isDrawMode = mode === 'draw';

    mode = isDrawMode ? 'x' : 'draw';

    if (isDrawMode) {
      canvas.remove(...canvas.getItemsByName('ruler'));
      canvas.off('mouse:down', mouseDownHandler);
      canvas.off('mouse:move', mouseMoveHandler);
      canvas.off('mouse:up', mouseUpHandler);
    } else {
      canvas.on('mouse:down', mouseDownHandler);
      canvas.on('mouse:move', mouseMoveHandler);
      canvas.on('mouse:up', mouseUpHandler);
    }
    toggleButton(btnRuler, 'btnOn', 'annotationBtn');
  });
};

const blender = (blenderBtn, viewer, showDescriptions = true) => {
  const blendModes = [
    ['normal', 'normal'],
    ['difference', 'The Difference blend mode subtracts the pixels of the base and blend layers and the result is the greater brightness value. When you subtract two pixels with the same value, the result is black.'],
    ['multiply', 'The Multiply mode multiplies the colors of the blending layer and the base layers, resulting in a darker color. This mode is useful for coloring shadows.'],
    ['screen', 'With Screen blend mode, the values of the pixels in the layers are inverted, multiplied, and then inverted again. The result is the opposite of Multiply: wherever either layer was darker than white, the composite is brighter.'],
    ['overlay', 'The Overlay blend mode both multiplies dark areas and screens light areas at the same time, so dark areas become darker and light areas become lighter. Anything that is 50% gray completely disappears from view.'],
    ['darken', 'The Darken Blending Mode looks at the luminance values in each of the RGB channels and selects the color of whichever layer is darkest.'],
    ['lighten', 'The Lighten Blending Mode takes a look at color of the layers, and keeps whichever one is lightest.'],
    ['color-dodge', 'The Color Dodge blend mode divides the bottom layer by the inverted top layer.'],
    ['color-burn', 'The Color Burn Blending Mode gives you a darker result than Multiply by increasing the contrast between the base and the blend colors resulting in more highly saturated mid-tones and reduced highlights.'],
    ['hard-light', 'Hard Light combines the Multiply and Screen Blending Modes using the brightness values of the Blend layer to make its calculations. The results with Hard Light tend to be intense.'],
    ['soft-light', 'With the Soft Light blending mode, every color that is lighter than 50% grey will get even lighter, like it would if you shine a soft spotlight to it. In the same way, every color darker than 50% grey will get even darker.'],
    ['exclusion', 'Exclusion is very similar to Difference. Blending with white inverts the base color values, while blending with black produces no change. However, Blending with 50% gray produces 50% gray.'],
    ['hue', 'The Hue Blending Mode preserves the luminosity and saturation of the base pixels while adopting the hue of the blend pixels.'],
    ['saturation', 'The Saturation Blending Mode preserves the luminosity and hue of the base layer while adopting the saturation of the blend layer.'],
    ['color', 'The Color blend mode is a combination of Hue and Saturation. Only the color (the hues and their saturation values) from the layer is blended in with the layer or layers below it.'],
    ['luminosity', 'The Luminosity blend mode preserves the hue and chroma of the bottom layers, while adopting the luma of the top layer.']
  ];

  // Set up user interface
  function _createBlendModesUI(div, viewer) {
    const table = document.createElement('table');
    div.appendChild(table);

    blendModes.forEach(item => {
      const [name, description] = item;
      const def = showDescriptions ? description : '';

      const blendModeBtn = document.createElement('button');
      Object.assign(blendModeBtn, {
        type: 'button',
        id: name.replace('-', '_'),
        value: name,
        className: showDescriptions ? 'annotationBtn css-tooltip' : 'annotationBtn',
        style: 'width: 120px'
      });
      if (showDescriptions) {
        blendModeBtn.setAttribute('data-tooltip', def); // Set data-tooltip using setAttribute
      }
      blendModeBtn.innerHTML = name;

      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.className = 'tooltip';
      cell.appendChild(blendModeBtn);
      row.appendChild(cell);
      table.appendChild(row);

      // User interface event handler
      blendModeBtn.addEventListener('click', () => {
        try {
          const count = viewer.world.getItemCount();
          const topImage = viewer.world.getItemAt(count - 1); // Blend all
          topImage.setCompositeOperation(blendModeBtn.value);
        } catch (e) {
          console.error(e.message);
        }
      });
    });
  }

  // onClick handler for blender icon
  blenderBtn.addEventListener('click', () => {
    const id = createId(5, 'modes');
    const rect = blenderBtn.getBoundingClientRect();
    const div = createDraggableDiv(id, 'Blend Modes', rect.left, rect.top);
    div.style.display = 'block';
    _createBlendModesUI(document.getElementById(`${id}Body`), viewer);
  });
};

/**
 * Create the fabric.js overlay and pass it to the markup tools.
 *
 * @param {object} viewerInfo - Info specific to 'this' viewer
 * @param {object} options - Filters, paintbrush, etc.
 * @param {object} viewer - OpenSeadragon viewer
 */
const markupTools = (viewerInfo, options, viewer) => {
  const overlay = viewer.fabricjsOverlay({ scale: 1, static: false });
  const idx = viewerInfo.idx;

  drawPolygon(viewerInfo, viewer, overlay);

  editPolygon(document.getElementById(`btnEdit${idx}`), overlay);

  gridOverlay(
    document.getElementById(`btnGrid${idx}`),
    document.getElementById(`btnGridMarker${idx}`),
    overlay,
  );

  ruler(document.getElementById(`btnRuler${idx}`), viewer, overlay);

  blender(document.getElementById(`btnBlender${idx}`), viewer, false); // Set to true if you want to show descriptions

  const canvas = overlay.fabricCanvas();
  canvas.on('after:render', () => {
    canvas.calcOffset();
  });

  const btnSave = document.getElementById(`btnSave${viewerInfo.idx}`);
  btnSave.addEventListener('click', () => {
    saveSettings(canvas, options);
  });
};

/**
 * Create floating div user interface.
 * Return the created div back to the calling program.
 * Calling program will create an HTML table and attach it to the body.
 *
 * @example Popup Div Naming Convention
 * nameXXX
 * nameXXXHeader
 * nameXXXBody
 *
 * @param {string} prfx - ID prefix to be used in the created elements
 * @param {string} title - Header title
 * @param {number} left - The left edge of the positioned <div> element
 * @param {number} top - The top edge of the positioned <div> element
 * @param {boolean} viz - Visibility
 * @returns {object} myDiv - The floating div
 */
function createDraggableDiv(prfx, title, left, top, viz = false) {
  const myDiv = e('div', { class: 'popup', id: prfx });
  myDiv.style.left = `${left}px`;
  myDiv.style.top = `${top}px`;

  const myImg = e('img', {
    src: `${CONFIG.appImages}close-icon.png`,
    alt: 'close',
    height: 25,
    width: 25,
  });
  myImg.style.cursor = 'pointer';
  myImg.addEventListener('click', () => {
    myDiv.style.display = 'none';
  });

  const myHeader = e('div', { class: 'popupHeader', id: `${prfx}Header` }, [
    myImg,
    e('span', {}, [title]),
  ]);
  myDiv.appendChild(myHeader);

  const body = e('div', { id: `${prfx}Body`, style: 'padding: 10px;' });
  // "body" to be filled in by calling function
  myDiv.appendChild(body);
  document.body.appendChild(myDiv);
  if (!viz) {
    myDiv.style.display = 'none'; // This gets toggled
  }

  // Make the DIV element draggable
  dragElement(myDiv);

  return myDiv;
}

function dragElement(_elem) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;
  // Note the naming convention
  if (document.getElementById(`${_elem.id}Header`)) {
    // if present, the header is where you move the DIV from:
    document.getElementById(`${_elem.id}Header`).onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    _elem.onmousedown = dragMouseDown;
  }

  // Mouse-down handler
  function dragMouseDown(evt) {
    evt.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = evt.clientX;
    pos4 = evt.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  // Mouse-move handler
  function elementDrag(evt) {
    evt.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - evt.clientX;
    pos2 = pos4 - evt.clientY;
    pos3 = evt.clientX;
    pos4 = evt.clientY;
    // set the element's new position:
    _elem.style.top = `${_elem.offsetTop - pos2}px`;
    _elem.style.left = `${_elem.offsetLeft - pos1}px`;
  }

  // Mouse-up handler
  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * Clicking the color palette icon brings you here.
 * Create a popup div allowing user to adjust color ranges for that layer,
 * or adjust the colors being used to color each class in that layer.
 *
 * @param {object} paletteBtn - The DOM element
 * @param {string} title - For the title bar of the floating div
 * @param {object} colorscheme - Object containing array of "colors" and array of "colorspectrum", to use for the classifications and color ranges, respectively.
 * @param {Array} viewerLayers - Array of layers (images) to be displayed in this viewer
 * @param {object} viewer - OpenSeadragon Viewer
 * @returns {object} popup - div
 */
const filterPopup = (paletteBtn, title, colorscheme, viewerLayers, viewer) => {
  /*
  Popup Div For Color Levels Naming Convention:
  markerXXX0 <- 0th row elements
  lowXXX0 <- 0th row elements
  hiXXX0 <- 0th row elements
  iXXX0 <- 0th row elements
  */
  setChecked(colorscheme);
  const uniqueId = getRandomInt(100, 999);
  const popup = createPopup(uniqueId, paletteBtn, title);
  const popupBody = document.getElementById(`${popup.id}Body`);
  const classDiv = e('div');
  const probabilityDiv = e('div');
  const heatmapDiv = e('div');
  const thresholdDiv = e('div');

  // <select>
  const selectList = createDropdown(
    uniqueId,
    [classDiv, probabilityDiv, heatmapDiv, thresholdDiv],
    viewerLayers,
    viewer,
  );
  popupBody.appendChild(selectList);

  // By class
  classDiv.style.display = STATE.renderType === 'byClass' ? 'block' : 'none';
  popupBody.appendChild(classDiv);
  createUI(uniqueId, classDiv, colorscheme.colors, viewerLayers, viewer, 'byClass');

  // By probability
  probabilityDiv.style.display = STATE.renderType === 'byProbability' ? 'block' : 'none';
  popupBody.appendChild(probabilityDiv);
  createUI(
    uniqueId,
    probabilityDiv,
    colorscheme.colorspectrum,
    viewerLayers,
    viewer,
    'byProbability',
  );

  // By heatmap, blue to red
  const msg = "Color gradient where reddish colors<br>" +
    "correspond to sureness and<br>" +
    "bluish colors to unsureness.";
  heatmapDiv.style.display = STATE.renderType === 'byHeatmap' ? 'block' : 'none';
  popupBody.appendChild(heatmapDiv);
  heatmapDiv.innerHTML = `<p style="color: #ffffff; background: -webkit-linear-gradient(#FF0000, #0000FF);">${msg}</p>`;

  // By threshold
  thresholdDiv.style.display = STATE.renderType === 'byThreshold' ? 'block' : 'none';
  popupBody.appendChild(thresholdDiv);

  createThresh(thresholdDiv, viewerLayers, viewer); // no cp

  return popup;
};

function createPopup(uniqueId, paletteBtn, title) {
  const widgetId = `filters${uniqueId}`;
  const rect = paletteBtn.getBoundingClientRect();
  return createDraggableDiv(widgetId, title, rect.left, rect.top);
}

function setChecked(colorscheme) {
  // colorscheme.colors: is an array of class-colors objects
  // Now, add a flag called 'checked', and set it to true for use later:
  colorscheme.colors.map(a => {
    return (a.checked = true);
  });

  // colorscheme.colorspectrum: is an array of color objects for probability
  // Add 'checked'. Add 'classid' - set value to current index in array.
  colorscheme.colorspectrum.forEach((element, index) => {
    element.checked = true;
    element.classid = index; // 'classid' also exists in colorscheme.colors.
    // We're overloading the variable, so we can have 1 checkbox handler for both.
  });
}

function getThreshColor(colorPicker) {
  let color;
  if (colorPicker) {
    color = colorToArray(colorPicker.style.backgroundColor);
    if (color.length === 3) {
      color.push(255);
    }
    return color;

  } else {
    return [126, 1, 0, 255]; // Default thresh color maroon
  }
}

function createThresh(div, layers, viewer, colorPicker, classId) {
  const val = '1'; // Initial value

  // slider value
  const number = e('input', {
    type: 'number',
    min: '0',
    max: MAX.toString(),
    step: '1',
    size: '5',
    value: val,
  });

  // slider
  const range = e('input', {
    type: 'range',
    min: '0',
    max: MAX.toString(),
    step: '1',
    value: val,
  });

  div.appendChild(e('div', {}, [number, range]));

  function createInputHandler(updateElement) {
    return function() {
      updateElement.value = this.value;
      // Layers, viewer, and threshold
      setFilter(layers, viewer, {}, { val: parseInt(this.value), rgba: getThreshColor(colorPicker), classId: classId });
    };
  }

  number.addEventListener('input', createInputHandler(range));
  range.addEventListener('input', createInputHandler(number));
}

function checkboxHandler(checkboxElement, displayColors, layers, viewer) {
  checkboxElement.addEventListener('click', () => {
    STATE.outline = false;
    // look up color by 'classid', set 'checked' to the state of the checkbox
    displayColors.find(x => x.classid === parseInt(checkboxElement.value)).checked =
      checkboxElement.checked;
    setFilter(layers, viewer);
  });
}

function createDropdown(uniqueId, divArr, allLayers, viewer) {
  const selectDiv = e('div', { style: 'display: block;' });
  const id = `select${uniqueId}`;
  selectDiv.innerHTML = `<label for="${id}">Color by:</label>&nbsp;`;

  // Array of options to be added
  const selectList = e('select');
  selectList.id = id;
  selectDiv.appendChild(selectList);

  // Append the options
  RENDER_TYPES.forEach((option, i) => {
    const element = document.createElement('option');
    element.setAttribute('value', option);
    element.text = option.startsWith('by') ? option.replace('by', '') : option;
    selectList.appendChild(element);
  });

  // An option was selected
  selectList.addEventListener('change', () => {
    // set global type
    STATE.renderType = selectList.options[selectList.selectedIndex].value;
    // no outline for you
    STATE.outline = false;

    // Shut all off...
    divArr.forEach(div => {
      div.style.display = 'none';
    });

    // ...and turn one on.
    if (STATE.renderType === 'byClass') {
      divArr[0].style.display = 'block';
    } else if (STATE.renderType === 'byProbability') {
      divArr[1].style.display = 'block';
    } else if (STATE.renderType === 'byHeatmap') {
      divArr[2].style.display = 'block';
    } else if (STATE.renderType === 'byThreshold') {
      divArr[3].style.display = 'block';
    }

    // Initial values set
    if (STATE.renderType === 'byThreshold') {
      // Layers, viewer, and threshold
      setFilter(allLayers, viewer, {}, { val: 1, rgba: [126, 1, 0, 255] });
    } else {
      setFilter(allLayers, viewer);
    }
  });

  return selectDiv;
}

// Create user interface
function createUI(uniq, div, layerColors, layers, viewer, type) {
  const table = e('table', { class: 'popupBody' });
  div.appendChild(table);
  const byProb = type === 'byProbability';
  const byClass = type === 'byClass';

  if (layerColors) {
    // Different headers
    if (byClass) {
      table.appendChild(createHeaderRow(['', 'Color', 'Label', 'Pixels with certainty >= n']));
    } else if (byProb) {
      layerColors.sort((a, b) => b.low - a.low);
      table.appendChild(createHeaderRow(['', 'Color', 'Low', 'High']));
    }

    // Create table row for each color rgba; allow user to adjust color
    layerColors.forEach((colorObject, cIdx) => {
      const checkbox = e('input', {
        type: 'checkbox',
        name: `classes${uniq}`,
        value: colorObject.classid
      });

      if (colorObject.checked) {
        checkbox.setAttribute('checked', true);
      } else {
        checkbox.removeAttribute('checked');
      }

      const colorPicker = createColorPicker(cIdx, uniq, colorObject, layers, viewer);

      let tr;
      let numLow;
      let numHigh;
      let removeBtn;

      if (byProb) {
        // adjust range (low to high)
        numLow = createNumericInput(
          `low${uniq}${cIdx}`,
          table,
          uniq,
          layers,
          colorObject,
          layerColors,
          viewer
        );

        numHigh = createNumericInput(
          `high${uniq}${cIdx}`,
          table,
          uniq,
          layers,
          colorObject,
          layerColors,
          viewer
        );

        const buttonId = `i${uniq}${cIdx}`;
        // button to add or remove a range
        removeBtn = e('i', { id: buttonId, class: 'fas fa-minus pointer' });

        tr = e('tr', {}, [
          e('td', {}, [checkbox]),
          e('td', {}, [colorPicker]),
          e('td', {}, [numLow]),
          e('td', {}, [numHigh]),
          e('td', {}, [removeBtn]),
        ]);
      } else if (byClass) {
        let d = e('div');
        createThresh(d, layers, viewer, colorPicker, colorObject.classid);
        tr = e('tr', {}, [
          e('td', {}, [checkbox]),
          e('td', {}, [colorPicker]),
          e('td', {}, [e('span', {}, [colorObject.name])]),
          e('td', {}, [d])
        ]);
      }
      table.appendChild(tr);

      checkboxHandler(checkbox, layerColors, layers, viewer);

      if (byProb) {
        // TR has been defined, now we can use it
        removeBtn.addEventListener(
          'click',
          removeColor.bind(null, removeBtn, layerColors, tr, layers, viewer),
          {
            passive: true,
          }
        );
      }
    });

    // After all that is done...
    if (byProb) {
      table.appendChild(extraRow(uniq, layerColors, layers, viewer));
    }
  } else {
    console.warn('Layer colors?', layerColors);
  }
  // Done.
}

function removeColor(el, ourRanges, tr, layers, viewer) {
  const str = el.id;
  const n = str.charAt(str.length - 1);
  ourRanges.splice(parseInt(n), 1); // remove from list
  tr.remove(); // remove table row
  setFilter(layers, viewer); // reflect changes in viewer
}

// Create sortable header row
function createHeaderRow(tableHeaders) {
  const row = e('tr');

  for (let i = 0; i < tableHeaders.length; i++) {
    const th = e('th', { class: 'pointer' });
    th.innerHTML = tableHeaders[i];
    row.appendChild(th);

    th.addEventListener('click', () => {
      const table = th.closest('table');
      Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), (this.asc = !this.asc)))
        .forEach(tr => table.appendChild(tr));
    });
  }

  return row;
}

const getCellValue = (tr, idx) => {
  const td = tr.children[idx];
  if (td.children[0]) {
    if (td.children[0].type === 'number') {
      // sort by number
      return td.children[0].value;
    }
    // sort by alpha
    return td.innerText || td.textContent;
  }
  // disable for this column
  return '';
};

const comparer = (idx, asc) => (a, b) =>
  ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2))(
  getCellValue(asc ? a : b, idx),
  getCellValue(asc ? b : a, idx)
);

// Create color picker input
function createColorPicker(cIdx, uniq, colorObject, layers, viewer) {
  let init = true;
  const m = e('mark', { id: `marker${uniq}${cIdx}` });
  const colorCode = colorObject.color;
  m.style.backgroundColor = colorCode;
  m.innerHTML = `#${rgba2hex(colorCode)}`;

  function handleColorChange(r, g, b, a) {
    if (init) {
      init = false; // Update the state
      return;
    }
    STATE.outline = false; // Shut outline off
    // console.log([r, g, b, a])
    this.source.value = this.color(r, g, b, a);
    this.source.innerHTML = this.color(r, g, b, a);
    this.source.style.backgroundColor = this.color(r, g, b, a);
    colorObject.color = `rgba(${r}, ${g}, ${b}, ${a * 255})`;
    // console.log('colorObject', colorObject)
    setFilter(layers, viewer);
  }

  const picker = new CP(m);
  picker.on('change', handleColorChange);

  return m;
}

// Our colors are in rgba - convert to hex for color picker element
function rgba2hex(orig) {
  let a;
  const arr = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
  const alpha = ((arr && arr[4]) || '').trim();
  let hex = arr
    ? (arr[1] | (1 << 8)).toString(16).slice(1)
      + (arr[2] | (1 << 8)).toString(16).slice(1)
      + (arr[3] | (1 << 8)).toString(16).slice(1)
    : orig;

  if (alpha !== '') {
    a = alpha;
  } else {
    a = 1;
  }
  a = (a | (1 << 8)).toString(16).slice(1);
  hex += a;
  return hex;
}

// Last stop before "set filter"
function numericEvent(numEl, colorObject, layers, viewer) {
  const intVal = parseInt(numEl.value);

  // If they set it to something outside 0-MAX, reset it
  if (intVal > MAX) numEl.value = MAX.toString();
  if (intVal < 0) numEl.value = '0';

  if (numEl.id.startsWith('low')) colorObject.low = intVal;
  if (numEl.id.startsWith('high')) colorObject.high = intVal;

  setFilter(layers, viewer);
}

// Create numeric input
function createNumericInput(id, table, uniq, layers, colorObject, colors, viewer) {
  let val;
  if (!colorObject.low && !colorObject.high) {
    val = '';
  } else {
    val = id.includes('low') ? colorObject.low.toString() : colorObject.high.toString();
  }

  const numEl = e('input', {
    id,
    type: 'number',
    min: '0',
    max: MAX.toString(),
    step: '1',
    size: '5',
    value: val,
  });

  // Event listeners
  // numEl.addEventListener('change', isIntersect.bind(null, table), {passive: true})
  numEl.addEventListener('input', numericEvent.bind(null, numEl, colorObject, layers, viewer), {
    passive: true
  });
  return numEl;
}

// An interval has low value and high value
// Check to see if any two intervals overlap
function isIntersect(table) {
  const arr = [];
  const cells = table.getElementsByTagName('td');
  for (const cell of cells) {
    const elem = cell.children[0];
    if (elem.type === 'number') {
      elem.style.outlineStyle = '';
      elem.style.outlineColor = '';
      if (elem.id.startsWith('low')) {
        arr.push({ low: elem, lowVal: parseInt(elem.value) });
      }
      if (elem.id.startsWith('high')) {
        const el = arr[arr.length - 1]; // get last array elem
        el.high = elem;
        el.highVal = parseInt(elem.value);
      }
    }
  }

  // Sort before validate
  arr.sort((a, b) => {
    return b.lowVal - a.lowVal;
  });
  const n = arr.length - 1;
  for (let i = 0; i < n; i++) {
    const notZeroes = arr[i].lowVal !== 0 && arr[i + 1].highVal !== 0;
    // If low <= high of next, then overlap
    if (arr[i].lowVal <= arr[i + 1].highVal && notZeroes) {
      setOutlineStyle(arr[i].low, arr[i + 1].high, 'solid', 'red');
      return true;
    }
  }

  return false;
}

// The outline around the inputs for numbers - red for error, clear for default
function setOutlineStyle(a, b, style, color) {
  // For numeric element pair
  if (isRealValue(a)) {
    a.style.outlineStyle = style;
    a.style.outlineColor = color;
  }
  if (isRealValue(b)) {
    b.style.outlineStyle = style;
    b.style.outlineColor = color;
  }
}

// The "Add color range" event
function addColor(idx, num1, num2, cpEl, chkEl, uniq, tr, colors, layers, viewer) {
  // User clicked `+` to add row
  setOutlineStyle(num1, num2, '', ''); // clear any error
  if (num1.value === '0' && num2.value === '0') {
    // indicate 0 and 0 not allowed
    setOutlineStyle(num1, num2, 'solid', 'red');
  } else {
    // Create remove button and add event listener
    const buttonId = `i${num1.id.replace('low', '')}`; // borrowing element id
    const removeBtn = e('i', { id: buttonId, class: 'fas fa-minus pointer' });
    // Get the desired <i> element
    let iconElement = tr.querySelector('td:last-child i:first-child');
    iconElement.replaceWith(removeBtn);

    removeBtn.addEventListener(
      'click',
      removeColor.bind(null, removeBtn, colors, tr, layers, viewer),
      {
        passive: true,
      }
    );

    checkboxHandler(chkEl, colors, layers, viewer);

    // add another empty row
    const table = tr.closest('table');
    table.appendChild(extraRow(uniq, colors, layers, viewer));
  }
}

// sequence
function seq(objArray) {
  const arr = objArray.map(a => a.classid);
  arr.sort();
  const [min, max] = [Math.min(...arr), Math.max(...arr)];
  return Array.from(Array(max - min), (v, i) => i + min).filter(i => !arr.includes(i));
}

// Extra row for adding color and range values
function extraRow(uniq, colors, layers, viewer) {
  // let idx;
  // const nums = seq(colors);
  // if (!nums || isEmpty(nums)) {
  //   idx = colors.length;
  // } else {
  //   idx = Array.isArray(nums) ? nums[0] : nums;
  // }

  let idx = colors.length;

  const colorObject = {
    color: 'rgba(255, 255, 255, 255)',
    low: 0,
    high: 0,
    checked: false,
    classid: idx, // overloading 'classid'
  };
  colors.push(colorObject);

  const chkEl = e('input', {
    type: 'checkbox',
    name: `classes${uniq}`,
    value: idx,
  });
  checkboxHandler(chkEl, colors, layers, viewer);

  const cpEl = createColorPicker(idx, uniq, colorObject, layers, viewer);
  const b = document.getElementById(`filters${uniq}Body`);
  const t = b.firstChild;
  const num1 = createNumericInput(`low${uniq}${idx}`, t, uniq, layers, colorObject, colors, viewer);
  const num2 = createNumericInput(
    `high${uniq}${idx}`,
    t,
    uniq,
    layers,
    colorObject,
    colors,
    viewer
  );
  const addBtn = e('i', { id: `i${uniq}${idx}`, class: 'fas fa-plus pointer' });

  const tr = e('tr', {}, [
    e('td', {}, [chkEl]),
    e('td', {}, [cpEl]),
    e('td', {}, [num1]),
    e('td', {}, [num2]),
    e('td', {}, [addBtn]),
  ]);

  addBtn.addEventListener(
    'click',
    addColor.bind(null, idx, num1, num2, cpEl, chkEl, uniq, tr, colors, layers, viewer),
    { passive: true }
  );

  return tr;
}

/** Custom color filters */

const bgTrans = function(imageData) {
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i + 1] === 0) {
      imageData[i + 3] = 0;
    }
  }
  return imageData;
};

const img2arrayWithBackgroundCorrection = imgData => {
  return imgData.data.reduce((pixel, key, index) => {
    if (index % 4 === 0) {
      pixel.push([key]);
    } else {
      pixel[pixel.length - 1].push(key);
    }

    // Apply background correction if the RGBA values for the pixel are fully populated
    if (index % 4 === 3) {
      const px = pixel[pixel.length - 1];
      if (px[1] === 0 || px[3] === 0) {
        px[0] = 0;
        px[1] = 0;
        px[2] = 0;
        px[3] = 0;
      }
    }

    return pixel;
  }, []);
};

/**********************
 CUSTOM COLOR FILTERS
 **********************/
const colorChannel = 1;
const alphaChannel = 3;
const maxPixelValue = 255;

// Outline the edge of the polygon
OpenSeadragon.Filters.OUTLINE = rgba => {
  return (context, callback) => {
    // console.time('Outline');
    const width = context.canvas.width;
    const height = context.canvas.height;

    let imgData = context.getImageData(0, 0, width, height);
    let data = img2arrayWithBackgroundCorrection(imgData);
    let flatData = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < data.length; i++) {
      let currentPixel = data[i];
      let isEdge = false;

      if (currentPixel[alphaChannel] === maxPixelValue && currentPixel[colorChannel] > 0) {
        // Index calculations
        let right = i + 1;
        let left = i - 1;
        let up = i - width;
        let down = i + width;

        if (data[right] && data[right][alphaChannel] === 0) isEdge = true;
        if (data[left] && data[left][alphaChannel] === 0) isEdge = true;
        if (data[up] && data[up][alphaChannel] === 0) isEdge = true;
        if (data[down] && data[down][alphaChannel] === 0) isEdge = true;

        if (isEdge) {
          // Set to the desired RGBA for outline
          currentPixel = rgba;
        }
      } else {
        // Set each pixel to transparent
        currentPixel = [0, 0, 0, 0];
      }

      // Flatten data as we go
      flatData.set(currentPixel, i * 4);
    }

    // Change the remaining colored pixels to transparent
    for (let i = 0; i < flatData.length; i += 4) {
      if (flatData[i + colorChannel] > 0) {
        flatData[i] = 0;
        flatData[i + 1] = 0;
        flatData[i + 2] = 0;
        flatData[i + 3] = 0;
      }
    }

    let newImage = context.createImageData(width, height);
    newImage.data.set(flatData);
    context.putImageData(newImage, 0, 0);

    // console.timeEnd('Outline');
    callback();
  };
};

// Handles 'inside' and 'outside' sliders
OpenSeadragon.Filters.PROBABILITY = (data, rgba) => {
  return (context, callback) => {
    // console.time('Probability');
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    let pixels = imgData.data;

    // Define the condition check based on the type
    let shouldColor;
    switch (data.type) {
      case 'inside':
        shouldColor = greenChannel => greenChannel > data.slideHandle1 && greenChannel <= data.slideHandle2;
        break;
      case 'outside':
        shouldColor = greenChannel => (greenChannel > 0 && greenChannel <= data.slideHandle1) || (greenChannel <= maxPixelValue && greenChannel >= data.slideHandle2);
        break;
      default:
        throw new Error(`Invalid type: ${data.type}`);
    }

    for (let i = 0; i < pixels.length; i += 4) {
      const probability = pixels[i + 1]; // green channel is "probability"

      if (shouldColor(probability)) {
        pixels[i] = rgba[0];
        pixels[i + 1] = rgba[1];
        pixels[i + 2] = rgba[2];
        pixels[i + 3] = rgba[3];
      } else {
        pixels[i + 3] = 0;
      }
    }

    context.putImageData(imgData, 0, 0);
    // console.timeEnd('Probability');
    callback();
  };
};

const getRangeColor = (channelValue, colorRanges, rgbas) => {
  for (let i = 0; i < colorRanges.length; i++) {
    if (channelValue >= colorRanges[i].low && channelValue <= colorRanges[i].high) {
      return rgbas[i];
    }
  }
  return [0, 0, 0, 0];
};

const getClassColor = (channelValue, classifications, rgbas) => {
  for (let i = 0; i < classifications.length; i++) {
    if (channelValue === classifications[i].classid) {
      return rgbas[i];
    }
  }
  return [0, 0, 0, 0];
};

const setPixelData = (data, i, rgba, greenChannel, attenuate) => {
  data[i] = rgba[0];
  data[i + 1] = rgba[1];
  data[i + 2] = rgba[2];
  data[i + 3] = attenuate ? greenChannel : rgba[3];
};

const gradient = [[0, 0, 255, 255], [1, 0, 254, 255], [2, 0, 253, 255], [3, 0, 252, 255], [4, 0, 251, 255], [5, 0, 250, 255], [6, 0, 249, 255], [7, 0, 248, 255], [8, 0, 247, 255], [9, 0, 246, 255], [10, 0, 245, 255], [11, 0, 244, 255], [12, 0, 243, 255], [13, 0, 242, 255], [14, 0, 241, 255], [15, 0, 240, 255], [16, 0, 239, 255], [17, 0, 238, 255], [18, 0, 237, 255], [19, 0, 236, 255], [20, 0, 235, 255], [21, 0, 234, 255], [22, 0, 233, 255], [23, 0, 232, 255], [24, 0, 231, 255], [25, 0, 230, 255], [26, 0, 229, 255], [27, 0, 228, 255], [28, 0, 227, 255], [29, 0, 226, 255], [30, 0, 225, 255], [31, 0, 224, 255], [32, 0, 223, 255], [33, 0, 222, 255], [34, 0, 221, 255], [35, 0, 220, 255], [36, 0, 219, 255], [37, 0, 218, 255], [38, 0, 217, 255], [39, 0, 216, 255], [40, 0, 215, 255], [41, 0, 214, 255], [42, 0, 213, 255], [43, 0, 212, 255], [44, 0, 211, 255], [45, 0, 210, 255], [46, 0, 209, 255], [47, 0, 208, 255], [48, 0, 207, 255], [49, 0, 206, 255], [50, 0, 205, 255], [51, 0, 204, 255], [52, 0, 203, 255], [53, 0, 202, 255], [54, 0, 201, 255], [55, 0, 200, 255], [56, 0, 199, 255], [57, 0, 198, 255], [58, 0, 197, 255], [59, 0, 196, 255], [60, 0, 195, 255], [61, 0, 194, 255], [62, 0, 193, 255], [63, 0, 192, 255], [64, 0, 191, 255], [65, 0, 190, 255], [66, 0, 189, 255], [67, 0, 188, 255], [68, 0, 187, 255], [69, 0, 186, 255], [70, 0, 185, 255], [71, 0, 184, 255], [72, 0, 183, 255], [73, 0, 182, 255], [74, 0, 181, 255], [75, 0, 180, 255], [76, 0, 179, 255], [77, 0, 178, 255], [78, 0, 177, 255], [79, 0, 176, 255], [80, 0, 175, 255], [81, 0, 174, 255], [82, 0, 173, 255], [83, 0, 172, 255], [84, 0, 171, 255], [85, 0, 170, 255], [86, 0, 169, 255], [87, 0, 168, 255], [88, 0, 167, 255], [89, 0, 166, 255], [90, 0, 165, 255], [91, 0, 164, 255], [92, 0, 163, 255], [93, 0, 162, 255], [94, 0, 161, 255], [95, 0, 160, 255], [96, 0, 159, 255], [97, 0, 158, 255], [98, 0, 157, 255], [99, 0, 156, 255], [100, 0, 155, 255], [101, 0, 154, 255], [102, 0, 153, 255], [103, 0, 152, 255], [104, 0, 151, 255], [105, 0, 150, 255], [106, 0, 149, 255], [107, 0, 148, 255], [108, 0, 147, 255], [109, 0, 146, 255], [110, 0, 145, 255], [111, 0, 144, 255], [112, 0, 143, 255], [113, 0, 142, 255], [114, 0, 141, 255], [115, 0, 140, 255], [116, 0, 139, 255], [117, 0, 138, 255], [118, 0, 137, 255], [119, 0, 136, 255], [120, 0, 135, 255], [121, 0, 134, 255], [122, 0, 133, 255], [123, 0, 132, 255], [124, 0, 131, 255], [125, 0, 130, 255], [126, 0, 129, 255], [127, 0, 128, 255], [128, 0, 127, 255], [129, 0, 126, 255], [130, 0, 125, 255], [131, 0, 124, 255], [132, 0, 123, 255], [133, 0, 122, 255], [134, 0, 121, 255], [135, 0, 120, 255], [136, 0, 119, 255], [137, 0, 118, 255], [138, 0, 117, 255], [139, 0, 116, 255], [140, 0, 115, 255], [141, 0, 114, 255], [142, 0, 113, 255], [143, 0, 112, 255], [144, 0, 111, 255], [145, 0, 110, 255], [146, 0, 109, 255], [147, 0, 108, 255], [148, 0, 107, 255], [149, 0, 106, 255], [150, 0, 105, 255], [151, 0, 104, 255], [152, 0, 103, 255], [153, 0, 102, 255], [154, 0, 101, 255], [155, 0, 100, 255], [156, 0, 99, 255], [157, 0, 98, 255], [158, 0, 97, 255], [159, 0, 96, 255], [160, 0, 95, 255], [161, 0, 94, 255], [162, 0, 93, 255], [163, 0, 92, 255], [164, 0, 91, 255], [165, 0, 90, 255], [166, 0, 89, 255], [167, 0, 88, 255], [168, 0, 87, 255], [169, 0, 86, 255], [170, 0, 85, 255], [171, 0, 84, 255], [172, 0, 83, 255], [173, 0, 82, 255], [174, 0, 81, 255], [175, 0, 80, 255], [176, 0, 79, 255], [177, 0, 78, 255], [178, 0, 77, 255], [179, 0, 76, 255], [180, 0, 75, 255], [181, 0, 74, 255], [182, 0, 73, 255], [183, 0, 72, 255], [184, 0, 71, 255], [185, 0, 70, 255], [186, 0, 69, 255], [187, 0, 68, 255], [188, 0, 67, 255], [189, 0, 66, 255], [190, 0, 65, 255], [191, 0, 64, 255], [192, 0, 63, 255], [193, 0, 62, 255], [194, 0, 61, 255], [195, 0, 60, 255], [196, 0, 59, 255], [197, 0, 58, 255], [198, 0, 57, 255], [199, 0, 56, 255], [200, 0, 55, 255], [201, 0, 54, 255], [202, 0, 53, 255], [203, 0, 52, 255], [204, 0, 51, 255], [205, 0, 50, 255], [206, 0, 49, 255], [207, 0, 48, 255], [208, 0, 47, 255], [209, 0, 46, 255], [210, 0, 45, 255], [211, 0, 44, 255], [212, 0, 43, 255], [213, 0, 42, 255], [214, 0, 41, 255], [215, 0, 40, 255], [216, 0, 39, 255], [217, 0, 38, 255], [218, 0, 37, 255], [219, 0, 36, 255], [220, 0, 35, 255], [221, 0, 34, 255], [222, 0, 33, 255], [223, 0, 32, 255], [224, 0, 31, 255], [225, 0, 30, 255], [226, 0, 29, 255], [227, 0, 28, 255], [228, 0, 27, 255], [229, 0, 26, 255], [230, 0, 25, 255], [231, 0, 24, 255], [232, 0, 23, 255], [233, 0, 22, 255], [234, 0, 21, 255], [235, 0, 20, 255], [236, 0, 19, 255], [237, 0, 18, 255], [238, 0, 17, 255], [239, 0, 16, 255], [240, 0, 15, 255], [241, 0, 14, 255], [242, 0, 13, 255], [243, 0, 12, 255], [244, 0, 11, 255], [245, 0, 10, 255], [246, 0, 9, 255], [247, 0, 8, 255], [248, 0, 7, 255], [249, 0, 6, 255], [250, 0, 5, 255], [251, 0, 4, 255], [252, 0, 3, 255], [253, 0, 2, 255], [254, 0, 1, 255], [255, 0, 0, 255]];

OpenSeadragon.Filters.COLORLEVELS = layerColors => {
  return (context, callback) => {
    // console.time('ColorLevels');
    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const data = bgTrans(imgData.data);
    const colorGroup = layerColors.filter(x => x.checked);
    const rgbas = colorGroup.map(element => colorToArray(element.color));

    const setPix = (myFunction, colorMap) => {
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === maxPixelValue) {
          const redChannel = data[i];
          const greenChannel = data[i + 1];
          const rgba = STATE.renderType === 'byClass' ? myFunction(redChannel, colorGroup, rgbas) :
            STATE.renderType === 'byProbability' ? myFunction(greenChannel, colorGroup, rgbas) :
              STATE.renderType === 'byHeatmap' ? colorMap[greenChannel] :
                (console.error('renderType?', STATE.renderType), [0, 0, 0, 0]);

          setPixelData(data, i, rgba, greenChannel, STATE.attenuate);
        } else {
          data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
        }
      }
    };

    setPix(
      STATE.renderType === 'byClass' ? getClassColor :
        STATE.renderType === 'byProbability' ? getRangeColor : {},
      STATE.renderType === 'byHeatmap' ? gradient : {}
    );

    context.putImageData(imgData, 0, 0);
    // console.timeEnd('ColorLevels');
    callback();
  };
};

OpenSeadragon.Filters.THRESHOLDING = thresh => {
  return (context, callback) => {
    if (typeof thresh !== 'undefined') {
      // console.time('Thresholding');
      let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
      let pixels = imgData.data;

      let color;
      if (typeof thresh.rgba !== 'undefined') {
        color = thresh.rgba;
      } else {
        color = [126, 1, 0, 255]; // #7e0100 (Maroon)
      }

      if (typeof thresh.classId !== 'undefined') {
        // console.log('classId', thresh.classId);

        // Test classId and probability value above threshold.
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] === thresh.classId && pixels[i + 1] >= thresh.val) {
            pixels[i] = color[0];
            pixels[i + 1] = color[1];
            pixels[i + 2] = color[2];
            pixels[i + 3] = color[3];
          } else {
            pixels[i + 3] = 0;
          }
        }
      } else {
        // console.log('classId undefined');
        // Test green channel (probability) value above threshold.
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 1] >= thresh.val) {
            pixels[i] = color[0];
            pixels[i + 1] = color[1];
            pixels[i + 2] = color[2];
            pixels[i + 3] = color[3];
          } else {
            pixels[i + 3] = 0;
          }
        }
      }

      context.putImageData(imgData, 0, 0);
      // console.timeEnd('Thresholding');
      callback();
    } else {
      console.warn("thresh is undefined");
    }
  };
};

/**
 * Wrapper component around OpenSeadragon viewer.
 * Set up 1 basic OSD viewer.
 */
class ImageViewer {
  /**
   * @param {object} viewerInfo - Info specific to 'this' viewer
   */
  constructor(viewerInfo, numViewers, options) {
    const layers = viewerInfo.layers;

    if (numViewers === undefined) numViewers = 1;
    if (options === undefined) options = {};

    this.checkboxes = { checkPan: true, checkZoom: true };

    if (numViewers > 1) {
      this.checkboxes.checkPan = document.getElementById(`chkPan${viewerInfo.idx}`);
      this.checkboxes.checkZoom = document.getElementById(`chkZoom${viewerInfo.idx}`);
    }

    // Array of tileSources for the viewer
    const tileSources = [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      tileSources.push({ tileSource: layer.location, opacity: layer.opacity, x: 0, y: 0 });
    }
    // console.log('tileSources', stringy(ts));

    // SET UP VIEWER
    let viewer = OpenSeadragon({
      id: viewerInfo.osdId,
      prefixUrl: CONFIG.osdImages,
      tileSources,
      crossOriginPolicy: 'Anonymous',
      blendTime: 0,
      minZoomImageRatio: 1,
      maxZoomPixelRatio: 1, // when the user zooms all the way in they are at 100%
    });
    this.viewer = viewer; // SET THIS VIEWER

    this.overlay = this.viewer.fabricjsOverlay({ scale: 1000 });
    this.canvas = this.overlay.fabricCanvas();

    if (options.toolbarOn) {
      markupTools(viewerInfo, options, viewer);
    }

    // 2.7.7
    // let anno = OpenSeadragon.Annotorious(viewer, {
    //   locale: "auto",
    //   drawOnSingleClick: true,
    //   allowEmpty: true
    // });
    // anno.setAuthInfo({
    //   id: "http://www.example.com/tdiprima",
    //   displayName: "tdiprima"
    // });
    // anno.setDrawingTool("rect");
    // anno.setDrawingEnabled(true);

    // 0.6.4
    // const button = document.getElementById(`btnAnnotate${viewerInfo.idx}`);
    // button.addEventListener("click", function() {
    //   anno.activateSelector();
    //   return false;
    // });
    // make annotatable by Annotorious library
    // anno.makeAnnotatable(viewer);

    // When an item is added to the World, grab the info
    viewer.world.addHandler('add-item', ({ item }) => {
      const itemIndex = viewer.world.getIndexOfItem(item);
      const source = viewer.world.getItemAt(itemIndex).source;

      if (isRealValue(source.hasCreateAction) && isRealValue(source.hasCreateAction.name)) layers[itemIndex].name = source.hasCreateAction.name;

      if (isRealValue(source.xResolution) && isRealValue(source.resolutionUnit) && source.resolutionUnit === 3) {
        MICRONS_PER_PIX = 10000 / source.xResolution; // Unit 3 = pixels per centimeter
        layers[itemIndex].resolutionUnit = source.resolutionUnit;
        layers[itemIndex].xResolution = source.xResolution;
      }
    });

    layerUI(document.getElementById(`layersAndColors${viewerInfo.idx}`), layers, viewer);

    function _parseHash() {
      const params = {};
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        const parts = hash.split('&');
        parts.forEach(part => {
          const subparts = part.split('=');
          const key = subparts[0];
          const value = parseFloat(subparts[1]);
          if (!key || isNaN(value)) {
            console.error('bad hash param', part);
          } else {
            params[key] = value;
          }
        });
      }

      return params;
    }

    function _useParams(params) {
      // console.log("params", typeof params, params);
      const zoom = viewer.viewport.getZoom();
      const pan = viewer.viewport.getCenter();

      // In Chrome, these fire when you pan/zoom AND tab-switch to something else (like your IDE)
      if (params.zoom !== undefined && params.zoom !== zoom) {
        viewer.viewport.zoomTo(params.zoom, null, true);
      }

      if (params.x !== undefined && params.y !== undefined && (params.x !== pan.x || params.y !== pan.y)) {
        const point = new OpenSeadragon.Point(params.x, params.y);
        viewer.viewport.panTo(point, true);
      }
    }

    // Image has been downloaded and can be modified before being drawn to the canvas.
    let drawer;
    viewer.addOnceHandler('tile-loaded', () => {
      drawer = viewer.drawer;
      drawer.imageSmoothingEnabled = false;
      drawer._imageSmoothingEnabled = false;
      // console.log('drawer', drawer)

      if (window.location.hash) {
        const params = _parseHash();
        _useParams(params);
      }
      addCustomButtons();
      setFilter(layers, viewer);
      getInfoForScalebar();
    });

    viewer.addOnceHandler("open", e => {
      // SETUP ZOOM TO MAGNIFICATION - 10x, 20x, etc.
      let minViewportZoom = viewer.viewport.getMinZoom();
      let tiledImage = viewer.world.getItemAt(0);
      let minImgZoom = tiledImage.viewportToImageZoom(minViewportZoom);

      let arr = [1, 0.5, 0.25];
      let n = 1;
      let imgZoom = [];
      do {
        imgZoom = [...imgZoom, ...arr.map(e => e / n)];
        n *= 10;
      } while (imgZoom[imgZoom.length - 1] > minImgZoom);

      while (imgZoom[imgZoom.length - 1] < minImgZoom) {
        imgZoom.pop();
      }
      imgZoom.push(minImgZoom);
      imgZoom.sort((a, b) => {
        return a - b;
      });

      let htm = "";
      let magContent = document.querySelector(".mag-content");
      if (magContent) {
        for (let i = 0; i < imgZoom.length; i++) {
          htm += `<a href="#" data-value="${imgZoom[i]}">${Number((imgZoom[i] * 40).toFixed(3))}x</a>`;
        }
        magContent.innerHTML = htm;

        for (let el of magContent.children) {
          el.addEventListener("click", () => {
            let attr = el.getAttribute("data-value");
            let imageZoom = parseFloat(attr);
            viewer.viewport.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(imageZoom));
          });
        }
      }
    });

    // BOOKMARK URL with ZOOM and X,Y
    document.getElementById(`btnShare${viewerInfo.idx}`).addEventListener('click', () => {
      const zoom = viewer.viewport.getZoom();
      const pan = viewer.viewport.getCenter();
      const url = `${location.origin}${location.pathname}#zoom=${zoom}&x=${pan.x}&y=${pan.y}`;
      const I = viewer.world.getItemAt(0);
      // console.log('image coords', I.viewportToImageCoordinates(pan));
      // console.log('url', url);

      prompt('Share this link:', url);
    });

    function timeStamp() {
      const dateString = new Date().toISOString();
      const a = dateString.slice(0, 10);
      let b = dateString.slice(10);
      b = b
        .replaceAll(':', '-')
        .replace('T', '')
        .slice(0, 8);
      return `${a}_${b}`;
    }

    /**
     * Download image snapshot
     */
    document.getElementById(`btnCam${viewerInfo.idx}`).addEventListener('click', () => {
      const parent = document.getElementById(viewerInfo.osdId);
      const children = parent.querySelectorAll('[id^="osd-overlaycanvas"]');

      for (const canvasEl of children) {
        const id = canvasEl.id;
        const num = parseInt(id.slice(-1));
        if (num % 2 === 0) {
          const ctx = viewer.drawer.context;
          ctx.drawImage(canvasEl, 0, 0);
          const osdImg = viewer.drawer.canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = osdImg;
          downloadLink.download = `img_${timeStamp()}`;
          downloadLink.click();
          break;
        }
      }
    });

    /**
     * Custom OpenSeadragon Buttons
     * Zoom in 100%
     * Zoom out 100%
     */
    function addCustomButtons() {
      // Zoom all the way in
      const zinButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 100%',
        srcRest: `${CONFIG.appImages}zin_rest.png`,
        srcGroup: `${CONFIG.appImages}zin_grouphover.png`,
        srcHover: `${CONFIG.appImages}zin_hover.png`,
        srcDown: `${CONFIG.appImages}zin_pressed.png`,
        onClick() {
          viewer.viewport.zoomTo(viewer.viewport.getMaxZoom());
          // viewer.viewport.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(1.0));
        }
      });

      // Zoom all the way out
      const zoutButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 0%',
        srcRest: `${CONFIG.appImages}zout_rest.png`,
        srcGroup: `${CONFIG.appImages}zout_grouphover.png`,
        srcHover: `${CONFIG.appImages}zout_hover.png`,
        srcDown: `${CONFIG.appImages}zout_pressed.png`,
        onClick() {
          viewer.viewport.goHome(true);
          // viewer.viewport.zoomTo(viewer.viewport.getHomeZoom());
        }
      });
      viewer.addControl(zinButton.element, { anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });
      viewer.addControl(zoutButton.element, { anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });
    }

    /**
     * Set up scale bar
     * @param ppm
     */
    const setScaleBar = ppm => {
      // console.log("ppm", typeof ppm, ppm);
      viewer.scalebar({
        type: OpenSeadragon.ScalebarType.MICROSCOPY,
        pixelsPerMeter: ppm,
        location: OpenSeadragon.ScalebarLocation.BOTTOM_LEFT,
        xOffset: 5,
        yOffset: 10,
        stayInsideImage: true,
        color: 'rgb(150, 150, 150)',
        fontColor: 'rgb(100, 100, 100)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        barThickness: 2
      });
    };

    function getInfoForScalebar() {
      // Get info for scale bar
      const item = layers[0];
      // plugin assumes that the provided pixelsPerMeter is the one of the image at index 0 in world.getItemAt
      if (isRealValue(item.xResolution) && isRealValue(item.resolutionUnit) && item.resolutionUnit === 3) {
        setScaleBar(item.xResolution * 100);
      }
    }
  }

  /**
   * @return OpenSeadragon.Viewer
   */
  getViewer() {
    return this.viewer;
  }

  getPanZoom() {
    return this.checkboxes;
  }
}

/**
 * Create 1 control panel row per layer.
 *
 * There's a column called "layersAndColors" to the right of each viewer.
 * Create an HTML table there, with each row corresponding to each layer displayed in viewer.
 *
 * @example Each layer has:
 * a draggable item: the layer
 *     naming convention: 0featXXX <- 0th feature
 * an eyeball: turn layer on & off
 * a slider: adjust transparency
 * a color palette: change colors in layer
 * a tachometer: adjust visualizations in layer
 *
 * @param {object} layersColumn - The HTML table column containing the layer gadgets
 * @param {object} images - The images to be displayed in this viewer
 * @param {object} viewer - OpenSeadragon viewer
 */
const layerUI = (layersColumn, images, viewer) => {
  createLayerElements(layersColumn, images, viewer);
  setupDragAndDrop(viewer);
};

function createLayerElements(layersColumn, layers, viewer) {
  const myEyeArray = [];

  const globalEyeball = globalEye(layersColumn);

  const divTable = e("div", {class: "divTable"});
  // const scrollDiv = e("div", {class: "divTableBody scroll"});
  const scrollDiv = e("div", {class: "divTableBody"});
  layersColumn.appendChild(divTable);
  divTable.appendChild(scrollDiv);

  const divTableRow = e("div", {class: "divTableRow"});
  scrollDiv.appendChild(divTableRow);
  divTableRow.appendChild(e("div", {class: "divTableCell"}));
  divTableRow.appendChild(e("div", {class: "divTableCell"}, [globalEyeball]));

  layers.forEach(layer => {
    addIconRow(myEyeArray, scrollDiv, layer, layers, viewer);
  });

  globalEyeEvent(globalEyeball, myEyeArray);

}

function setupDragAndDrop(viewer) {
  // Div containing viewer (Remember this is executed for each viewer.)
  const currentViewerDiv = document.getElementById(viewer.id);

  function handleDrop(evt) {
    // prevent default action (open as link for some elements)
    evt.preventDefault();
    evt.stopPropagation();

    evt.target.classList.remove('drag-over') // restore style
    const targetElement = evt.target; // canvas
    const targetDiv = targetElement.closest(".viewer"); // div container

    // Get neighboring elements
    const columnWithViewer = targetDiv.parentElement;

    // Directly find the .divTableBody within the sibling column
    const tableLayAndColor = columnWithViewer.nextSibling.querySelector('.divTableBody');
    const movedFeatId = evt.dataTransfer.getData("text");
    const movedFeature = document.getElementById(movedFeatId);
    const featureName = movedFeature.innerHTML;

    let layNum;
    let foundMatchingSlide = false;

    // Iterate table rows
    let myHTMLCollection = tableLayAndColor.children;
    for (let i = 1; i < myHTMLCollection.length; i++) {
      // Skip first row (globals)
      const [firstCell, secondCell] = myHTMLCollection[i].children;
      const lay = firstCell.firstChild;
      const eye = secondCell.firstChild;

      layNum = lay.id[0]; // 1st char is array index

      // css transition: .block, .color-fade
      if (lay.innerHTML === featureName) {
        foundMatchingSlide = true;

        // Highlight the layer
        lay.classList.remove("layer");
        lay.classList.add("block");
        lay.classList.add("color-fade");

        /** timeout to turn it back to normal **/
        setTimeout(() => {
          lay.classList.remove("color-fade");
          lay.classList.remove("block");
          lay.classList.add("layer");
        }, 2000);

        // Toggle eyeball
        eye.classList.remove("fa-eye-slash");
        eye.classList.add("fa-eye");
        break;
      }
    }

    const targetViewer = getOsdViewer(targetDiv.id);

    if (targetViewer !== null) {
      if (foundMatchingSlide) {
        targetViewer.world.getItemAt(layNum).setOpacity(1); // show
        // (And we already turned on target feature eyeball)
      } else {
        console.warn("Did not find matching slide. Feature:", featureName);
      }
    }
    return false;
  }

  // Add event listeners to current div
  currentViewerDiv.addEventListener("dragover", evt => {
    // prevent default to allow drop
    evt.preventDefault();
    return false;
  });

  currentViewerDiv.addEventListener("dragenter", function (evt) {
    // highlight potential drop target when the draggable element enters it
    evt.target.classList.add('drag-over');
  });

  currentViewerDiv.addEventListener("dragleave", function (evt) {
    // reset border of potential drop target when the draggable element leaves it
    evt.target.classList.remove('drag-over');
  });

  currentViewerDiv.addEventListener("drop", handleDrop);
}

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

function getFeatureName(layerNum, currentLayer, data) {
  // Extract featureName and return
  let sections = new URL(currentLayer.location).search.split("/");
  const elementWithTCGA = sections.find(item => item.startsWith("TCGA"));

  let featureName;
  if (elementWithTCGA) {
    const isFeature = currentLayer.location.includes("FeatureStorage");

    if (isFeature) {
      featureName = data.hasCreateAction.name
        ? data.hasCreateAction.name
        : `${sections[sections.indexOf("FeatureStorage") + 1]}-${sections[sections.indexOf("FeatureStorage") + 2]}`;
    } else {
      featureName = elementWithTCGA.split(".")[0];
    }
  } else {
    featureName = currentLayer.location.split('/').pop();
  }
  return featureName;
}

function createDraggableBtn(layerNum, currentLayer, featureName) {
  // Create and return the draggable button
  const span = e("span", {class: "button-text"}, [featureName]);
  const element = e("button", {
    id: `${layerNum}${createId(5, "feat")}`,
    class: "layer expandable-button",
    draggable: "true"
  });
  element.append(span);
  return element;
}

function handleDragStart(evt) {
  evt.target.style.opacity = "0.4";
  evt.dataTransfer.effectAllowed = "move";
  evt.dataTransfer.setData("text/plain", evt.target.id);
}

function handleDragEnd(evt) {
  evt.target.style.opacity = "1"; // this = the draggable feature
}

async function addIconRow(myEyeArray, divTable, currentLayer, allLayers, viewer) {
  const divTableRow = e("div", {class: "divTableRow"});
  divTable.appendChild(divTableRow);

  const layerNum = currentLayer.layerNum;

  try {
    // TJD
    const data = await fetchData(currentLayer.location);
    const featureName = getFeatureName(layerNum, currentLayer, data);
    // const featureName = createId2(); // testing mode

    const element = createDraggableBtn(layerNum, currentLayer, featureName);
    divTableRow.appendChild(e("div", {class: "divTableCell", style: "padding: 3px"}, [element]));

    // Attach drag & drop event listeners
    element.addEventListener("dragstart", handleDragStart);
    element.addEventListener("dragend", handleDragEnd);

    // Visibility toggle
    const faEye = layerEye(currentLayer);
    if (layerNum > 0) {
      myEyeArray.push(faEye);
    }
    divTableRow.appendChild(e("div", {class: "divTableCell"}, [faEye]));

    // Transparency slider
    const [icon, slider] = transparencySlider(currentLayer, faEye, viewer);

    // .myDIV
    const div = e("div", {class: "myDIV", title: "transparency slider"}, [icon]);

    // .hide
    div.appendChild(e("div", {class: "hide"}, [slider]));

    // Visibility
    faEye.addEventListener("click", layerEyeEvent.bind(null, faEye, slider, layerNum, viewer), false);

    divTableRow.appendChild(e("div", {class: "divTableCell"}, [div]));

    if (layerNum > 0) {
      // Color Palette
      createColorPalette(divTableRow, featureName, currentLayer, allLayers, viewer);

      // Tachometer
      const divBody = createTachometer(divTableRow, featureName);
      layerPopup(divBody, allLayers, viewer);
    } else {
      divTableRow.appendChild(e("div", {class: "divTableCell"}));
    }
  } catch (error) {
    console.error("There was a problem:", error);
  }
}

// Eyeball visibility: layer
function layerEye(currentLayer) {
  const cssClass = currentLayer.opacity === 0 ? "fas fa-eye-slash" : "fas fa-eye";
  return e("i", {
    id: createId(5, "eye"),
    class: `${cssClass} layer-icons`,
    title: "toggle visibility"
  });
}

function layerEyeEvent(icon, slider, layerNum, viewer) {
  toggleButton(icon, "fa-eye", "fa-eye-slash");
  const tiledImage = viewer.world.getItemAt(layerNum);

  if (!tiledImage) return;

  if (icon.classList.contains("fa-eye-slash")) {
    tiledImage.setOpacity(0);
  } else {
    const sliderValue = parseInt(slider.value);
    const opacity = (sliderValue === 0) ? 1 : sliderValue / 100;
    tiledImage.setOpacity(opacity);

    if (sliderValue === 0) {
      slider.value = "100";
    }
  }
}

// Eyeball visibility: global
function globalEye(layersColumn) {
  const vNum = layersColumn.id.slice(-1);
  // 'fas fa-eye-slash' : 'fas fa-eye'
  return e("i", {
    id: `eyeTog${vNum}`,
    style: "display: inline-block",
    class: "fas fa-eye layer-icons"
  });
}

function globalEyeEvent(element, arr) {

  element.addEventListener("click", function () {
    let activate;
    if (this.classList.contains("fa-eye-slash")) {
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
      activate = true;
    } else {
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
      activate = false;
    }

    arr.forEach(eye => {
      if (activate) {
        // If it's off, switch it on.
        if (eye.classList.contains("fa-eye-slash")) {
          eye.click(e);
        }
      } else {
        // Switch off
        if (!eye.classList.contains("fa-eye-slash")) {
          eye.click(e);
        }
      }
    });

  });
}

function transparencySlider(currentLayer, faEye, viewer) {
  // Icon
  const icon = document.createElement("i");
  icon.classList.add("fas");
  icon.classList.add("fa-adjust");
  icon.classList.add("layer-icons");
  icon.style.cursor = "pointer";

  // Slider element
  const element = e("input", {
    type: "range",
    class: "singleSlider",
    id: createId(5, "range"),
    min: "0",
    max: "100",
    step: "0.1",
    value: (currentLayer.opacity * 100).toString()
  });

  element.addEventListener("input", function () {
    const worldItem = viewer.world.getItemAt(currentLayer.layerNum);
    if (worldItem !== undefined) {
      worldItem.setOpacity(this.value / 100);
      if (this.value === "0") {
        faEye.classList.remove("fa-eye");
        faEye.classList.add("fa-eye-slash");
      }
      if (parseFloat(this.value) > 0) {
        faEye.classList.remove("fa-eye-slash");
        faEye.classList.add("fa-eye");
      }
    } else {
      console.warn("worldItem", worldItem);
    }
  });
  return [icon, element];
}

// Color palette
function createColorPalette(row, featureName, currentLayer, allLayers, viewer) {
  const icon = e("i", {
    id: createId(5, "palette"),
    class: "fas fa-palette pointer layer-icons",
    title: "color palette"
  });

  icon.addEventListener("click", () => {
    colorsUI.style.display = "block";
  });

  row.appendChild(e("div", {class: "divTableCell"}, [icon]));

  const colorsUI = filterPopup(
    icon,
    `${featureName} colors`,
    currentLayer.colorscheme,
    allLayers,
    viewer
  );
}

function createTachometer(row, featureName) {
  const icon = e("i", {
    id: createId(5, "tach"),
    class: "fas fa-tachometer-alt layer-icons",
    title: "settings" // call it "settings", "control panel", idk.
  });
  row.appendChild(e("div", {class: "divTableCell"}, [icon]));

  const id = createId(5, "pop");
  const rect = icon.getBoundingClientRect();
  const popup = createDraggableDiv(id, `${featureName} settings`, rect.left, rect.top);
  const divBody = document.getElementById(`${popup.id}Body`);

  icon.addEventListener("click", () => {
    popup.style.display = "block";
  });

  return divBody;
}

function getOsdViewer(divId) {
  try {
    // Get the viewer to this div id
    // return SYNCED_IMAGE_VIEWERS.find(item => item.getViewer().id === divId)?.getViewer() || null;
    let result = SYNCED_IMAGE_VIEWERS.find(item => item.getViewer().id === divId);
    if (result) {
      return result.getViewer();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Something happened...", e.message);
  }
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

/**
 * Create popup interface and handle events.
 *
 * @param {object} divBody - The body of the div, which we will fill in here.
 * @param {Array} allLayers - Array of layers displayed in this viewer
 * @param {object} viewer - OpenSeadragon viewer
 */
const layerPopup = function(divBody, allLayers, viewer) {
  function switchRenderTypeIfNecessary() {
    // If the current render type is not by probability, switch it.
    if (STATE.renderType !== 'byProbability') {
      STATE.renderType = 'byProbability';
    }
  }

  function createAttenuationBtn(allLayers, viewer) {
    // Color attenuation by probability
    const attId = createId(5, 'atten');
    const label = e('label', { for: attId });
    label.innerHTML = '&nbsp;&#58;&nbsp;color-attenuation by probability<br>';

    // Icon
    const icon = e('i', {
      id: attId,
      class: 'fas fa-broadcast-tower layer-icons',
      title: 'toggle: color-attenuation by probability'
    });

    // Event listener
    icon.addEventListener('click', () => {
      // Toggle attenuate state
      STATE.attenuate = !STATE.attenuate;
      // Ensure that either outline or attenuate is on, but not both.
      STATE.outline = false;
      switchRenderTypeIfNecessary();
      setFilter(allLayers, viewer);
    });
    return [label, icon];
  }

  // un/fill polygon
  function createOutlineBtn(allLayers, viewer) {
    const fillId = createId(5, 'fill');
    const label = e('label', { for: fillId });
    label.innerHTML = '&nbsp;&nbsp;&#58;&nbsp;un/fill polygon<br>';
    const emptyCircle = 'far';
    const filledCircle = 'fas';

    // Icon
    const icon = e('i', {
      id: fillId,
      class: `${filledCircle} fa-circle layer-icons`,
      title: 'fill un-fill'
    });

    // Event listener
    icon.addEventListener('click', () => {
      // Toggle outline state
      STATE.outline = !STATE.outline;
      // Ensure only one flag is active (either attenuate or outline; not both).
      STATE.attenuate = false;
      switchRenderTypeIfNecessary();
      toggleButton(icon, filledCircle, emptyCircle);
      setFilter(allLayers, viewer);
    });
    return [label, icon];
  }

  function createSlider(d, t, allLayers, viewer) {
    // Create range slider with two handles
    const wrapper = e('div', {
      class: d.class,
      role: 'group',
      'aria-labelledby': 'multi-lbl',
      style: `--${d.aLab}: ${d.aInit}; --${d.bLab}: ${d.bInit}; --min: ${d.min}; --max: ${d.max}`
    });

    const title = e('div', { id: 'multi-lbl' });
    title.innerHTML = t;
    wrapper.appendChild(title);

    const ARange = e('input', {
      id: d.aLab,
      type: 'range',
      min: d.min,
      max: d.max,
      value: d.aInit,
    });
    const BRange = e('input', {
      id: d.bLab,
      type: 'range',
      min: d.min,
      max: d.max,
      value: d.bInit,
    });

    const output1 = e('output', { for: d.aLab, style: `--c: var(--${d.aLab})` });
    const output2 = e('output', { for: d.bLab, style: `--c: var(--${d.bLab})` });

    wrapper.appendChild(ARange);
    wrapper.appendChild(output1);
    wrapper.appendChild(BRange);
    wrapper.appendChild(output2);

    function updateDisplay(e) {
      const input = e.target;
      const wrapper = input.parentNode;
      wrapper.style.setProperty(`--${input.id}`, +input.value);

      const slideVals = getVals([ARange, BRange]);

      // Pass layers, viewer, and range info
      setFilter(allLayers, viewer, {
        slideHandle1: slideVals[0],
        slideHandle2: slideVals[1],
        type: (d.type === 'outside') ? 'outside' : 'inside'
      });
    }

    ARange.addEventListener('input', updateDisplay);
    BRange.addEventListener('input', updateDisplay);

    return wrapper;
  }

  // Append to body
  const [label1, atten] = createAttenuationBtn(allLayers, viewer);
  const [label2, fillPoly] = createOutlineBtn(allLayers, viewer);
  divBody.appendChild(e('div', {}, [atten, label1, fillPoly, label2]));

  // todo: scale initial values
  let d = {
    aLab: 'a',
    bLab: 'b',
    aInit: 70,
    bInit: 185,
    min: 0,
    max: MAX,
    class: 'dualSlider',
    type: 'inside',
  };
  const wrapper = createSlider(d, 'In range:', allLayers, viewer);

  d = {
    aLab: 'a1',
    bLab: 'b1',
    aInit: 10,
    bInit: 245,
    min: 0,
    max: MAX,
    class: 'dualSlider1',
    type: 'outside',
  };
  const section = createSlider(d, 'Out range:', allLayers, viewer);

  const dd = e('div', {}, [section, wrapper]);
  divBody.appendChild(dd);
};

/**
 * Synchronize pan & zoom on every viewer in the given array.
 *
 * @param {Array} imageViewerArray - Array of ImageViewer objects
 */
const synchronizeViewers = function(imageViewerArray) {
  const isGood = checkData(imageViewerArray);

  if (isGood) {
    this.SYNCED_IMAGE_VIEWERS = [];
    this.activeViewerId = null;
    this.numViewers = imageViewerArray.length;

    imageViewerArray.forEach(function(imageViewer) {
      const currentViewer = imageViewer.getViewer();

      setPanZoomCurrent(currentViewer, handler);

      // set this up while we're here
      mapMarker(currentViewer, this.SYNCED_IMAGE_VIEWERS);

      function handler() {
        if (!isActive(currentViewer.id)) {
          return;
        }

        setPanZoomOthers(imageViewer);

        resetFlag();
      }

      this.SYNCED_IMAGE_VIEWERS.push(imageViewer);
    });
  }
};

function setPanZoomCurrent(currentViewer, handler) {
  currentViewer.addHandler('pan', handler);
  currentViewer.addHandler('zoom', handler);
}

function isActive(currentId) {
  init(currentId);
  return currentId === this.activeViewerId;
}

function init(currentId) {
  if (!isRealValue(this.activeViewerId)) {
    this.activeViewerId = currentId;
  }
}

function isPanOn(imageViewer) {
  const checkboxes = imageViewer.getPanZoom();

  if (typeof checkboxes.checkPan.checked !== 'undefined') {
    return checkboxes.checkPan.checked; // user decision
  }
  // If 1 div; then, nothing to synchronize.
  return this.numViewers !== 1;
}

function isZoomOn(imageViewer) {
  const checkboxes = imageViewer.getPanZoom();

  if (typeof checkboxes.checkZoom.checked !== 'undefined') {
    return checkboxes.checkZoom.checked; // user decision
  }
  // If 1 div; then, nothing to synchronize.
  return this.numViewers !== 1;
}

function setPanZoomOthers(imageViewer) {
  const currentViewer = imageViewer.getViewer();

  this.SYNCED_IMAGE_VIEWERS.forEach(syncedObject => {
    const syncedViewer = syncedObject.getViewer();

    if (syncedViewer.id === currentViewer.id) {
      return;
    }

    if (isPanOn(syncedObject) && isPanOn(imageViewer)) {
      syncedViewer.viewport.panTo(currentViewer.viewport.getCenter(false), false);
    }

    if (isZoomOn(syncedObject) && isZoomOn(imageViewer)) {
      syncedViewer.viewport.zoomTo(currentViewer.viewport.getZoom(false));
    }
  });
}

function resetFlag() {
  this.activeViewerId = null;
}

function checkData(imageViewerArray) {
  if (isEmpty(imageViewerArray)) {
    console.error('synchronizeViewers.js: Expected input argument, but received none.');
    return false;
  }

  if (!(imageViewerArray[0] instanceof Object)) {
    console.error('synchronizeViewers.js: Array elements should be ImageViewer objects.');
    return false;
  }

  return true;
}
