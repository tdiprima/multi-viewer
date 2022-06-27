/*! multi-viewer - v1.0.0 - 2022-06-27 */
/** @file commonFunctions.js - Contains utility functions */

/**
 * Change the way the image is displayed, based on user input.
 * @param {Array} layers - Layers (images) to be displayed in viewer
 * @param {object} viewer - OpenSeadragon viewer
 * @param {object} [range]
 * @param {object} [thresh] - Thresholding
 * @param {number} [thresh.val] - From user input
 * @param {Array<number>} [thresh.rgba] - example: [126, 1, 0, 255]
 */
function setFilter(layers, viewer, range, thresh) {
  if (viewer.world) {
    // let start = performance.now();
    // let caller = setFilter.caller;
    // console.log('caller', caller);

    const itemCount = viewer.world.getItemCount();
    let filterOpts = [];

    // Because one does not simply color the affected layer.
    // No. You have to do all of them.
    for (let i = 0; i < itemCount; i++) {
      const tiledImage = viewer.world.getItemAt(i);
      // Skip base
      if (i > 0) {
        if (!isEmpty(range)) {
          // USE RANGE VALUES
          let rgba;
          if (range.type === 'inside') {
            // Color #00FFFF is cyan
            rgba = [0, 255, 255, 255];
          } else {
            // Color #4A00B4 is Purple Heart
            rgba = [74, 0, 180, 255];
          }
          filterOpts.push({
            items: tiledImage,
            processors: colorFilter.prototype.PROBABILITY(range, rgba)
          });
        } else if (STATE.outline) {
          // OUTLINE POLYS
          // NOTE: Color can not have green in it.
          // Color #0000FF is blue
          filterOpts.push({
            items: tiledImage,
            processors: colorFilter.prototype.OUTLINE([0, 0, 255, 255]),
          });
        } else if (STATE.renderType === 'byProbability') {
          // USE COLOR SPECTRUM
          filterOpts.push({
            items: tiledImage,
            processors: colorFilter.prototype.COLORLEVELS(layers[i].colorscheme.colorspectrum),
          });
        } else if (STATE.renderType === 'byClass' || STATE.renderType === 'byHeatmap') {
          let processor;
          if (thresh) {
            // USE THRESHOLD
            processor = colorFilter.prototype.THRESHOLDING(thresh);
          } else {
            // USE COLOR SCHEME
            processor = colorFilter.prototype.COLORLEVELS(layers[i].colorscheme.colors);
          }
          filterOpts.push({
            items: tiledImage,
            processors: processor,
          });
        } else if (STATE.renderType === 'byThreshold') {
          filterOpts.push({
            items: tiledImage,
            processors: colorFilter.prototype.THRESHOLDING(thresh)
          });
        }
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
 * @param {object} viewer - OpenSeadragon.Viewer
 * @param {boolean} myBool - enable/disable
 */
function setOsdTracking(viewer, myBool) {
  viewer.setMouseNavEnabled(myBool);
  viewer.outerTracker.setTracking(myBool);
  viewer.gestureSettingsMouse.clickToZoom = myBool;
}

/**
 * Toggle between class names.
 * Highlight/un-highlight button to indicate "on" or "off".
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
 * @param obj
 * @return {boolean}
 */
function isRealValue(obj) {
  return obj && obj !== 'null' && obj !== 'undefined';
}

/**
 * Check to see if an Array, a string, or an object is empty.
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
 * @param messageObject
 * @return {boolean}
 */
function alertMessage(messageObject) {
  window.alert(messageObject);
  return true;
}

/**
 * Randomize.
 * @param {number} minm
 * @param {number} maxm
 * @return {number}
 */
function getRandomInt(minm, maxm) {
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}

/**
 * Generate random ID.
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
 * Replacement for Java String.hashCode()
 * @return {number}
 */
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  let char;
  for (let i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Get items by name, when the names are non-unique.
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
 * @param input
 * @return {*}
 */
function colorToArray(input) {
  const arrStr = input.replace(/[a-z%\s()]/g, '').split(',');
  return arrStr.map(i => Number(i));
}

/**
 * Scale rgb colors to percentage
 * @param num
 * @return {number}
 */
const scaleToPct = num => {
  return (num / 255) * 100;
};

/**
 * num to rgb
 * @param num
 * @return {number}
 */
const scaleToRgb = num => {
  return (num * 255) / 100;
};

/**
 * Location of application images and osd images.
 * The following setup is for running this app on the wickett server.
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
 * @type {number}
 */
const MAX = 255;

/**
 * Microns Per Pixel (default=0.25; actual value set later)
 * @type {number}
 */
let MICRONS_PER_PIX = 0.25;

/**
 * Render Types
 * @type {string[]}
 */
const RENDER_TYPES = ['byProbability', 'byClass', 'byHeatmap', 'byThreshold'];

/**
 * State
 * @type {{attenuate: boolean, outline: boolean, renderType: string}}
 */
const STATE = {
  attenuate: false,
  outline: false,
  renderType: RENDER_TYPES[0]
};

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
  console.clear();
  /*
  When the 'images' parameter becomes an array with null elements,
  it usually means that the session timed out or is in the process of timeout.
  So log the user out and have them start again.
   */
  let viewers = []; // eslint-disable-line prefer-const
  if (!isRealValue(images) || images[0] === null) {
    // logout & redirect
    document.write(
      "<script>window.alert('Click OK to continue...');window.location=`${window.location.origin}/auth/realms/Halcyon/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;</script>",
    );
  }

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
            // Create MultiViewer object and add to array
            viewers.push(new MultiViewer(vInfo, numViewers, opts));
          }
        }

        return viewers;
      })
      .then(viewers => {
        // PAN/ZOOM CONTROLLER - accepts array of MultiViewers
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
    // annotate(evt);
    drawingOff(canvas, viewer);
  });

  canvas.on('path:created', opts => {
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
    // console.log("event", evt);
    if (canvas.isDrawingMode) {
      // let pointer = evt.absolutePointer;
      let target = evt.currentTarget;
      let text = new fabric.Textbox('Annotate...', {
        width: 250,
        cursorColor: 'blue',
        // top: pointer.y,
        // left: pointer.x,
        top: target.top + target.height + 10,
        left: target.left + target.width + 10,
        fontSize: 20,
        editable: true
      });
      canvas.add(text);
      // console.log("text", text);
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
      cornerStyle: 'square'
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
 * @param {object} multiViewerArray - Array of MultiViewers
 */
const mapMarker = (osdViewer, multiViewerArray) => {
  overrideRightClickMenu(osdViewer.element);

  handleMarkerDisplay(osdViewer, multiViewerArray);

  handleButtonShowHide();
};

function overrideRightClickMenu(viewerDiv) {
  viewerDiv.addEventListener('contextmenu', mouseEvent => {
    mouseEvent.preventDefault();
  });
}

function handleMarkerDisplay(osdViewer, multiViewerArray) {
  osdViewer.addHandler('canvas-nonprimary-press', osdEvent => {
    if (isRightClick(osdEvent)) {
      const clickPosition = osdEvent.position;
      const clickPositionViewport = osdViewer.viewport.pointFromPixel(clickPosition);

      const buttons = document.querySelectorAll('#btnMapMarker');
      buttons.forEach(item => {
        item.style.display = 'block';
      });
      displayMapMarker(clickPositionViewport, osdViewer, multiViewerArray);
    }
  });
}

function isRightClick(evt) {
  return evt.button === 2;
}

function displayMapMarker(point, osdViewer, multiViewerArray) {
  multiViewerArray.forEach(item => {
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
  let line;
  let isDown;
  let zoom;
  let mode = 'x';
  let fText;
  let fStart = {x: 0, y: 0};
  let fEnd = {x: 0, y: 0};
  let oStart;
  let oEnd;
  let fontSize = 15;

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
  fabric.Object.prototype.transparentCorners = false;

  // CLEAR
  function clear() {
    fStart.x = 0.0;
    fEnd.x = 0.0;
    fStart.y = 0.0;
    fEnd.y = 0.0;
    canvas.remove(...canvas.getItemsByName('ruler'));
  }

  // MOUSE DOWN
  function mouseDownHandler(o) {
    clear();
    zoom = viewer.viewport.getZoom(true);
    if (mode === 'draw') {
      setOsdTracking(viewer, false);
      isDown = true;

      let webPoint = new OpenSeadragon.Point(o.e.clientX, o.e.clientY);
      try {
        let viewportPoint = viewer.viewport.pointFromPixel(webPoint);
        oStart = viewer.world.getItemAt(0).viewportToImageCoordinates(viewportPoint);
      } catch (e) {
        console.error(e.message);
      }

      let pointer = canvas.getPointer(o.e);
      let points = [pointer.x, pointer.y, pointer.x, pointer.y];
      fStart.x = pointer.x;
      fStart.y = pointer.y;
      line = new fabric.Line(points, {
        strokeWidth: 2 / zoom, // adjust stroke width on zoom
        stroke: lineColor,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'ruler'
      });
      canvas.add(line);
    } else {
      setOsdTracking(viewer, true); // keep image from panning/zooming as you draw line
      canvas.forEachObject(obj => {
        obj.setCoords(); // update coordinates
      });
    }
  }

  // CALCULATE
  function difference(a, b) {
    return Math.abs(a - b);
  }

  function getHypotenuseLength(a, b, mpp) {
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

  function drawText(x, y, text) {
    fText = new fabric.Text(text, {
      left: x,
      top: y,
      fill: fontColor,
      fontFamily: "effra,Verdana,Tahoma,'DejaVu Sans',sans-serif",
      // fontSize: fontSize / zoom, // adjust font size on zoom
      fontSize: zoom >= 100 ? 0.2 : (fontSize / zoom).toFixed(2),
      textBackgroundColor: bgColor,
      selectable: false,
      evented: false,
      name: 'ruler'
    });
    canvas.add(fText);
  }

  // MOUSE MOVE
  function mouseMoveHandler(o) {
    if (!isDown) return;
    canvas.remove(fText); // remove text element before re-adding it
    canvas.renderAll();

    let webPoint = new OpenSeadragon.Point(o.e.clientX, o.e.clientY);
    let viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    oEnd = viewer.world.getItemAt(0).viewportToImageCoordinates(viewportPoint);

    let w = difference(oStart.x, oEnd.x);
    let h = difference(oStart.y, oEnd.y);
    let hypot = getHypotenuseLength(w, h, MICRONS_PER_PIX);
    let t = valueWithUnit(hypot);

    let pointer = canvas.getPointer(o.e);
    line.set({x2: pointer.x, y2: pointer.y});
    fEnd.x = pointer.x;
    fEnd.y = pointer.y;

    if (mode === 'draw') {
      // Show info while drawing line
      drawText(fEnd.x, fEnd.y, t);
    }
    canvas.renderAll();
  }

  // MOUSE UP
  function mouseUpHandler(o) {
    line.setCoords();
    canvas.remove(fText);
    isDown = false;

    // Make sure user actually drew a line
    if (fStart.x === fEnd.x || fStart.y === fEnd.y || fEnd.x === 0) {
      console.log('click');
    } else {
      console.log(`%clength: ${fText.text}`, 'color: #ccff00;');
      let pointer = canvas.getPointer(o.e);
      drawText(pointer.x, pointer.y, fText.text);
      canvas.renderAll();
    }
  }

  btnRuler.addEventListener('click', () => {
    if (mode === 'draw') {
      // Turn off
      canvas.remove(...canvas.getItemsByName('ruler'));
      mode = 'x';
      canvas.off('mouse:down', mouseDownHandler);
      canvas.off('mouse:move', mouseMoveHandler);
      canvas.off('mouse:up', mouseUpHandler);
    } else {
      // Turn on
      mode = 'draw';
      canvas.on('mouse:down', mouseDownHandler);
      canvas.on('mouse:move', mouseMoveHandler);
      canvas.on('mouse:up', mouseUpHandler);
    }
    toggleButton(btnRuler, 'btnOn', 'annotationBtn');
  });
};

/**
 * Implementation of OpenSeadragon.TiledImage.setCompositeOperation
 * [uses CanvasRenderingContext2D.globalCompositeOperation]
 * to create different visual effects when applied to the layers.
 *
 * Users can play with the different effects and see if it helps to
 * discover things from a new and different perspective.
 *
 * @param {object} blenderBtn - Clickable blender icon
 * @param {object} viewer - OpenSeadragon viewer on which to apply the effects
 */
const blender = (blenderBtn, viewer) => {
  const blendModes = [
    ['normal', 'normal'],
    [
      'difference',
      'The Difference blend mode subtracts the pixels of the base and blend layers and the result is the greater brightness value. When you subtract two pixels with the same value, the result is black.',
    ],
    [
      'multiply',
      'The Multiply mode multiplies the colors of the blending layer and the base layers, resulting in a darker color. This mode is useful for coloring shadows.',
    ],
    [
      'screen',
      'With Screen blend mode, the values of the pixels in the layers are inverted, multiplied, and then inverted again. The result is the opposite of Multiply: wherever either layer was darker than white, the composite is brighter.',
    ],
    [
      'overlay',
      'The Overlay blend mode both multiplies dark areas and screens light areas at the same time, so dark areas become darker and light areas become lighter. Anything that is 50% gray completely disappears from view.',
    ],
    [
      'darken',
      'The Darken Blending Mode looks at the luminance values in each of the RGB channels and selects the color of whichever layer is darkest.',
    ],
    [
      'lighten',
      'The Lighten Blending Mode takes a look at color of the layers, and keeps whichever one is lightest.',
    ],
    [
      'color-dodge',
      'The Color Dodge blend mode divides the bottom layer by the inverted top layer.',
    ],
    [
      'color-burn',
      'The Color Burn Blending Mode gives you a darker result than Multiply by increasing the contrast between the base and the blend colors resulting in more highly saturated mid-tones and reduced highlights.',
    ],
    [
      'hard-light',
      'Hard Light combines the Multiply and Screen Blending Modes using the brightness values of the Blend layer to make its calculations. The results with Hard Light tend to be intense.',
    ],
    [
      'soft-light',
      'With the Soft Light blending mode, every color that is lighter than 50% grey will get even lighter, like it would if you shine a soft spotlight to it. In the same way, every color darker than 50% grey will get even darker.',
    ],
    [
      'exclusion',
      'Exclusion is very similar to Difference. Blending with white inverts the base color values, while blending with black produces no change. However, Blending with 50% gray produces 50% gray.',
    ],
    [
      'hue',
      'The Hue Blending Mode preserves the luminosity and saturation of the base pixels while adopting the hue of the blend pixels.',
    ],
    [
      'saturation',
      'The Saturation Blending Mode preserves the luminosity and hue of the base layer while adopting the saturation of the blend layer.',
    ],
    [
      'color',
      'The Color blend mode is a combination of Hue and Saturation. Only the color (the hues and their saturation values) from the layer is blended in with the layer or layers below it.',
    ],
    [
      'luminosity',
      'The Luminosity blend mode preserves the hue and chroma of the bottom layers, while adopting the luma of the top layer.',
    ]
  ];
  // let uiCreated = false;

  // Set up user interface
  function _createBlendModesUI(div, viewer) {
    const table = e('table');
    div.appendChild(table);

    blendModes.forEach(item => {
      const name = item[0];
      const def = item[1];
      const blendBtn = e('button', {
        type: 'button',
        id: name.replace('-', '_'),
        value: name,
        class: 'annotationBtn css-tooltip',
        style: 'width: 120px',
        'data-tooltip': def
      });
      blendBtn.innerHTML = name;

      const row = e('tr', {}, [e('td', {class: 'tooltip'}, [blendBtn, e('br')])]);
      table.appendChild(row);

      // User interface event handler
      blendBtn.addEventListener('click', () => {
        try {
          const count = viewer.world.getItemCount();
          const topImage = viewer.world.getItemAt(count - 1); // Blend all
          topImage.setCompositeOperation(blendBtn.value);
        } catch (e) {
          console.error(e.message);
        }
      });
    });
  }

  // onClick handler for blender icon
  blenderBtn.addEventListener('click', () => {
    // if (uiCreated) {
    //   // Turn off
    //   uiCreated = false;
    // } else {
    // Turn on
    const id = createId(5, 'modes');
    const rect = blenderBtn.getBoundingClientRect();
    const div = createDraggableDiv(id, 'Blend Modes', rect.left, rect.top);
    div.style.display = 'block';
    _createBlendModesUI(document.getElementById(`${id}Body`), viewer);
    // uiCreated = true;
    // }
    // toggleButton(blenderBtn, 'btnOn', 'annotationBtn');
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

  blender(document.getElementById(`btnBlender${idx}`), viewer);

  const canvas = overlay.fabricCanvas();
  canvas.on('after:render', () => {
    canvas.calcOffset();
  });

  /**
   * Save user settings and markup.
   * TODO: post object to server
   *
   * @param {object} canvas - Our osd fabric.js canvas object
   * @param {object} options
   * @param {string} options.paintbrushColor - example: "#0ff"
   * @param {boolean} options.toolbarOn - example: true
   */
  function saveSettings(canvas, options) {
    const jsonObject = {
      theme: document.body.className,
      canvas: canvas.toJSON(),
      state: STATE,
      options,
    };
    console.log('settings', jsonObject);
  }

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
  const popupBody = popup.lastChild; // known
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
  // const title = `${title} color levels`;
  // return createDraggableDiv(widgetId, title, rect.left, rect.top);
  return createDraggableDiv(widgetId, title, rect.left, rect.top);
}

function setChecked(colorscheme) {
  // colorscheme.colors: is an array of class-colors objects
  // Now, add a flag called 'checked', and set it to true for use later:
  colorscheme.colors.map(a => {
    // eslint-disable-next-line no-return-assign
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

function createThresh(div, layers, viewer, colorPicker, classId) {
  const val = '1'; // 128
  let color;
  if (colorPicker) {
    color = colorToArray(colorPicker.style.backgroundColor);
    if (color.length === 3) {
      color.push(255);
    }
  } else {
    color = [126, 1, 0, 255];
  }

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
  number.addEventListener('input', function() {
    range.value = this.value;
    setFilter(layers, viewer, {}, { val: parseInt(this.value), rgba: color, classId: classId });
    // console.log('number input');
  });

  range.addEventListener('input', function() {
    number.value = this.value;
    setFilter(layers, viewer, {}, { val: parseInt(this.value), rgba: color, classId: classId });
    // console.log('range input');
  });
}

function checkboxHandler(checkboxElement, displayColors, layers, viewer) {
  checkboxElement.addEventListener('click', () => {
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
      setFilter(allLayers, viewer, {}, { val: 1, rgba: [126, 1, 0, 255] }); // 128
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
  setOutlineStyle(num1, num2, '', ''); // clear any error
  if (num1.value === '0' && num2.value === '0') {
    // indicate 0 and 0 not allowed
    setOutlineStyle(num1, num2, 'solid', 'red');
  } else {
    // Now replace + with - in UI
    const buttonId = `i${num1.id.replace('low', '')}`; // borrowing element id
    const removeBtn = e('i', { id: buttonId, class: 'fas fa-minus pointer' });
    tr.lastChild.firstChild.remove(); // last element in row is modifier
    tr.lastChild.appendChild(removeBtn); // replace old modifier with new one
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
  let idx;
  const nums = seq(colors); // Use 'const'.
  if (!nums || isEmpty(nums)) {
    idx = colors.length;
  } else {
    idx = Array.isArray(nums) ? nums[0] : nums;
  }

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

const img2array = imgData => {
  return imgData.data.reduce((pixel, key, index) => {
    return (index % 4 === 0 ? pixel.push([key]) : pixel[pixel.length - 1].push(key)) && pixel;
  }, []);
};

const bgTrans = function (imageData) {
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i + 1] === 0) {
      imageData[i + 3] = 0
    }
  }
  return imageData
}

const backgroundCorrection = data => {
  data.forEach(px => {
    if (px[1] === 0 || px[3] === 0) {
      px[0] = 0;
      px[1] = 0;
      px[2] = 0;
      px[3] = 0;
    }
  });
  return data;
};

// Array.flat() polyfill
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth) {
    // If no depth is specified, default to 1
    if (depth === undefined) {
      depth = 1;
    }

    // Recursively reduce sub-arrays to the specified depth
    let flatten = function(arr, depth) {
      // If depth is 0, return the array as-is
      if (depth < 1) {
        return arr.slice();
      }

      // Otherwise, concatenate into the parent array
      return arr.reduce((acc, val) => {
        return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val);
      }, []);
    };

    return flatten(this, depth);
  };
}

/**********************
 CUSTOM COLOR FILTERS
 **********************/
const colorFilter = OpenSeadragon.Filters.GREYSCALE;
const colorChannel = 1;
const alphaChannel = 3;

// Outline the edge of the polygon
colorFilter.prototype.OUTLINE = rgba => {
  return (context, callback) => {
    // console.log('outline')
    const width = context.canvas.width;
    const height = context.canvas.height;
    const imgData = context.getImageData(0, 0, width, height);
    let data = backgroundCorrection(img2array(imgData));

    for (let i = 0; i < data.length; i++) {
      if (data[i][alphaChannel] === 255 && data[i][colorChannel] > 0) {
        // right
        try {
          if (data[i + 1][alphaChannel] === 0) {
            data[i][0] = rgba[0];
            data[i][1] = rgba[1];
            data[i][2] = rgba[2];
            data[i][3] = rgba[3];
          }
        } catch (e) {
          // It's okay.
        }

        // left
        try {
          if (data[i - 1][alphaChannel] === 0) {
            data[i][0] = rgba[0];
            data[i][1] = rgba[1];
            data[i][2] = rgba[2];
            data[i][3] = rgba[3];
          }
        } catch (e) {
          // These things happen.
        }

        try {
          // up
          if (data[i - width][alphaChannel] === 0) {
            data[i][0] = rgba[0];
            data[i][1] = rgba[1];
            data[i][2] = rgba[2];
            data[i][3] = rgba[3];
          }
        } catch (e) {}

        try {
          // down
          if (data[i + width][alphaChannel] === 0) {
            data[i][0] = rgba[0];
            data[i][1] = rgba[1];
            data[i][2] = rgba[2];
            data[i][3] = rgba[3];
          }
        } catch (e) {}
      } else {
        // Set each pixel
        data[i][0] = 0;
        data[i][1] = 0;
        data[i][2] = 0;
        data[i][3] = 0;
      }
    }

    // Change the remaining green pixels (middle of polygon) to transparent
    data.forEach(px => {
      // Use greater than
      if (px[colorChannel] > 0) {
        // Set each pixel
        px[0] = 0;
        px[1] = 0;
        px[2] = 0;
        px[3] = 0;
      }
    });

    let newImage = context.createImageData(width, height);
    newImage.data.set(data.flat());
    context.putImageData(newImage, 0, 0);
    callback();
  };
};

// Handles 'inside' and 'outside' sliders
colorFilter.prototype.PROBABILITY = (data, rgba) => {
  return (context, callback) => {
    // console.log('probability')
    const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    let pixels = imgData.data;

    if (data.type === 'inside') {
      for (let i = 0; i < pixels.length; i += 4) {
        const probability = pixels[i + 1];
        // has to be gt zero (not >=)
        if (probability > data.min && probability <= data.max) {
          pixels[i] = rgba[0];
          pixels[i + 1] = rgba[1];
          pixels[i + 2] = rgba[2];
          pixels[i + 3] = rgba[3];
        } else {
          pixels[i + 3] = 0;
        }
      }
    } else if (data.type === 'outside') {
      for (let i = 0; i < pixels.length; i += 4) {
        const probability = pixels[i + 1];
        // Has to be > zero; not >=.
        if (
          (probability > 0 && probability <= data.min) ||
          (probability <= 255 && probability >= data.max)
        ) {
          pixels[i] = rgba[0];
          pixels[i + 1] = rgba[1];
          pixels[i + 2] = rgba[2];
          pixels[i + 3] = rgba[3];
        } else {
          pixels[i + 3] = 0;
        }
      }
    }

    context.putImageData(imgData, 0, 0);
    callback();
  };
};

colorFilter.prototype.COLORLEVELS = layerColors => {
  return (context, callback) => {
    // console.log('colorlevels')
    const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const data = bgTrans(imgData.data);

    const colorGroup = layerColors.filter(x => x.checked === true);
    const rgbas = colorGroup.map(element => {
      return colorToArray(element.color); // Save the [r, g, b, a]'s for access later
    });

    const getRangeColor = (channelValue, colorRanges, rgbas1) => {
      for (let i = 0; i < colorRanges.length; i++) {
        if (channelValue >= colorRanges[i].low && channelValue <= colorRanges[i].high) {
          return rgbas1[i]; // return color
        }
      }
      return 0;
    };

    const getClassColor = (channelValue, classifications, rgbas2) => {
      for (let i = 0; i < classifications.length; i++) {
        if (channelValue === classifications[i].classid) {
          return rgbas2[i];
        }
      }
      return 0;
    };

    function setPix(myFunction, colorMap) {
      for (let i = 0; i < data.length; i += 4) {
        // Alpha 255 means that nuclear material exists here
        if (data[i + 3] === 255) {
          const redChannel = data[i]; // red channel = class
          const greenChannel = data[i + 1]; // green channel = probability
          let rgba;
          if (STATE.renderType === 'byClass') {
            rgba = myFunction(redChannel, colorGroup, rgbas);
          } else if (STATE.renderType === 'byProbability') {
            rgba = myFunction(greenChannel, colorGroup, rgbas);
          } else if (STATE.renderType === 'byHeatmap') {
            rgba = colorMap[greenChannel];
          } else {
            console.error('renderType?', STATE.renderType);
            return;
          }
          // Set
          data[i] = rgba[0]
          data[i + 1] = rgba[1]
          data[i + 2] = rgba[2]
          data[i + 3] = rgba[3]

          if (rgba[3] > 0) {
            // If attenuation is on,
            // then use green channel value for the alpha value
            data[i + 3] = STATE.attenuate ? greenChannel : 255
          }
        } else {
          // No nuclear material
          data[i] = 0
          data[i + 1] = 0
          data[i + 2] = 0
          data[i + 3] = 0
        }
      }
    }

    if (STATE.renderType === 'byClass') {
      setPix(getClassColor);
    }

    if (STATE.renderType === 'byProbability') {
      setPix(getRangeColor);
    }

    if (STATE.renderType === 'byHeatmap') {
      // blue to red gradient; 256 colors
      setPix({}, [[0, 0, 255, 255], [1, 0, 254, 255], [2, 0, 253, 255], [3, 0, 252, 255], [4, 0, 251, 255], [5, 0, 250, 255], [6, 0, 249, 255], [7, 0, 248, 255], [8, 0, 247, 255], [9, 0, 246, 255], [10, 0, 245, 255], [11, 0, 244, 255], [12, 0, 243, 255], [13, 0, 242, 255], [14, 0, 241, 255], [15, 0, 240, 255], [16, 0, 239, 255], [17, 0, 238, 255], [18, 0, 237, 255], [19, 0, 236, 255], [20, 0, 235, 255], [21, 0, 234, 255], [22, 0, 233, 255], [23, 0, 232, 255], [24, 0, 231, 255], [25, 0, 230, 255], [26, 0, 229, 255], [27, 0, 228, 255], [28, 0, 227, 255], [29, 0, 226, 255], [30, 0, 225, 255], [31, 0, 224, 255], [32, 0, 223, 255], [33, 0, 222, 255], [34, 0, 221, 255], [35, 0, 220, 255], [36, 0, 219, 255], [37, 0, 218, 255], [38, 0, 217, 255], [39, 0, 216, 255], [40, 0, 215, 255], [41, 0, 214, 255], [42, 0, 213, 255], [43, 0, 212, 255], [44, 0, 211, 255], [45, 0, 210, 255], [46, 0, 209, 255], [47, 0, 208, 255], [48, 0, 207, 255], [49, 0, 206, 255], [50, 0, 205, 255], [51, 0, 204, 255], [52, 0, 203, 255], [53, 0, 202, 255], [54, 0, 201, 255], [55, 0, 200, 255], [56, 0, 199, 255], [57, 0, 198, 255], [58, 0, 197, 255], [59, 0, 196, 255], [60, 0, 195, 255], [61, 0, 194, 255], [62, 0, 193, 255], [63, 0, 192, 255], [64, 0, 191, 255], [65, 0, 190, 255], [66, 0, 189, 255], [67, 0, 188, 255], [68, 0, 187, 255], [69, 0, 186, 255], [70, 0, 185, 255], [71, 0, 184, 255], [72, 0, 183, 255], [73, 0, 182, 255], [74, 0, 181, 255], [75, 0, 180, 255], [76, 0, 179, 255], [77, 0, 178, 255], [78, 0, 177, 255], [79, 0, 176, 255], [80, 0, 175, 255], [81, 0, 174, 255], [82, 0, 173, 255], [83, 0, 172, 255], [84, 0, 171, 255], [85, 0, 170, 255], [86, 0, 169, 255], [87, 0, 168, 255], [88, 0, 167, 255], [89, 0, 166, 255], [90, 0, 165, 255], [91, 0, 164, 255], [92, 0, 163, 255], [93, 0, 162, 255], [94, 0, 161, 255], [95, 0, 160, 255], [96, 0, 159, 255], [97, 0, 158, 255], [98, 0, 157, 255], [99, 0, 156, 255], [100, 0, 155, 255], [101, 0, 154, 255], [102, 0, 153, 255], [103, 0, 152, 255], [104, 0, 151, 255], [105, 0, 150, 255], [106, 0, 149, 255], [107, 0, 148, 255], [108, 0, 147, 255], [109, 0, 146, 255], [110, 0, 145, 255], [111, 0, 144, 255], [112, 0, 143, 255], [113, 0, 142, 255], [114, 0, 141, 255], [115, 0, 140, 255], [116, 0, 139, 255], [117, 0, 138, 255], [118, 0, 137, 255], [119, 0, 136, 255], [120, 0, 135, 255], [121, 0, 134, 255], [122, 0, 133, 255], [123, 0, 132, 255], [124, 0, 131, 255], [125, 0, 130, 255], [126, 0, 129, 255], [127, 0, 128, 255], [128, 0, 127, 255], [129, 0, 126, 255], [130, 0, 125, 255], [131, 0, 124, 255], [132, 0, 123, 255], [133, 0, 122, 255], [134, 0, 121, 255], [135, 0, 120, 255], [136, 0, 119, 255], [137, 0, 118, 255], [138, 0, 117, 255], [139, 0, 116, 255], [140, 0, 115, 255], [141, 0, 114, 255], [142, 0, 113, 255], [143, 0, 112, 255], [144, 0, 111, 255], [145, 0, 110, 255], [146, 0, 109, 255], [147, 0, 108, 255], [148, 0, 107, 255], [149, 0, 106, 255], [150, 0, 105, 255], [151, 0, 104, 255], [152, 0, 103, 255], [153, 0, 102, 255], [154, 0, 101, 255], [155, 0, 100, 255], [156, 0, 99, 255], [157, 0, 98, 255], [158, 0, 97, 255], [159, 0, 96, 255], [160, 0, 95, 255], [161, 0, 94, 255], [162, 0, 93, 255], [163, 0, 92, 255], [164, 0, 91, 255], [165, 0, 90, 255], [166, 0, 89, 255], [167, 0, 88, 255], [168, 0, 87, 255], [169, 0, 86, 255], [170, 0, 85, 255], [171, 0, 84, 255], [172, 0, 83, 255], [173, 0, 82, 255], [174, 0, 81, 255], [175, 0, 80, 255], [176, 0, 79, 255], [177, 0, 78, 255], [178, 0, 77, 255], [179, 0, 76, 255], [180, 0, 75, 255], [181, 0, 74, 255], [182, 0, 73, 255], [183, 0, 72, 255], [184, 0, 71, 255], [185, 0, 70, 255], [186, 0, 69, 255], [187, 0, 68, 255], [188, 0, 67, 255], [189, 0, 66, 255], [190, 0, 65, 255], [191, 0, 64, 255], [192, 0, 63, 255], [193, 0, 62, 255], [194, 0, 61, 255], [195, 0, 60, 255], [196, 0, 59, 255], [197, 0, 58, 255], [198, 0, 57, 255], [199, 0, 56, 255], [200, 0, 55, 255], [201, 0, 54, 255], [202, 0, 53, 255], [203, 0, 52, 255], [204, 0, 51, 255], [205, 0, 50, 255], [206, 0, 49, 255], [207, 0, 48, 255], [208, 0, 47, 255], [209, 0, 46, 255], [210, 0, 45, 255], [211, 0, 44, 255], [212, 0, 43, 255], [213, 0, 42, 255], [214, 0, 41, 255], [215, 0, 40, 255], [216, 0, 39, 255], [217, 0, 38, 255], [218, 0, 37, 255], [219, 0, 36, 255], [220, 0, 35, 255], [221, 0, 34, 255], [222, 0, 33, 255], [223, 0, 32, 255], [224, 0, 31, 255], [225, 0, 30, 255], [226, 0, 29, 255], [227, 0, 28, 255], [228, 0, 27, 255], [229, 0, 26, 255], [230, 0, 25, 255], [231, 0, 24, 255], [232, 0, 23, 255], [233, 0, 22, 255], [234, 0, 21, 255], [235, 0, 20, 255], [236, 0, 19, 255], [237, 0, 18, 255], [238, 0, 17, 255], [239, 0, 16, 255], [240, 0, 15, 255], [241, 0, 14, 255], [242, 0, 13, 255], [243, 0, 12, 255], [244, 0, 11, 255], [245, 0, 10, 255], [246, 0, 9, 255], [247, 0, 8, 255], [248, 0, 7, 255], [249, 0, 6, 255], [250, 0, 5, 255], [251, 0, 4, 255], [252, 0, 3, 255], [253, 0, 2, 255], [254, 0, 1, 255], [255, 0, 0, 255]])
    }

    context.putImageData(imgData, 0, 0);
    callback();
  };
};

colorFilter.prototype.THRESHOLDING = (thresh) => {
  return (context, callback) => {

    if (typeof thresh !== 'undefined') {
      // console.log('thresh', thresh)
      let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
      let pixels = imgData.data;

      let color;
      if (typeof thresh.rgba !== 'undefined') {
        color = thresh.rgba;
      } else {
        color = [126, 1, 0, 255]; // #7e0100
      }

      if (typeof thresh.classId !== 'undefined') {

        let classId = parseInt(thresh.classId)
        // console.log('classId', classId)

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
        // console.log('classId undefined')
        for (let i = 0; i < pixels.length; i += 4) {
          // Test green channel value above threshold.
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
      callback();
    } else {
      console.warn("thresh is undefined")
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
  constructor(viewerInfo) {
    const layers = viewerInfo.layers;

    // Array of tileSources for the viewer
    const tileSources = [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      tileSources.push({ tileSource: layer.location, opacity: layer.opacity, x: 0, y: 0 });
    }
    // console.log('tileSources', JSON.stringify(ts))

    // SET UP VIEWER
    let viewer;
    try {
      viewer = OpenSeadragon({
        id: viewerInfo.osdId,
        crossOriginPolicy: 'Anonymous',
        blendTime: 0,
        prefixUrl: CONFIG.osdImages,
        minZoomImageRatio: 1,
        maxZoomPixelRatio: 1, // when the user zooms all the way in they are at 100%
        tileSources,
      });
    } catch (e) {
      console.error(e.message);
    }

    let drawer;

    function addInfo(item) {
      try {
        const itemIndex = viewer.world.getIndexOfItem(item);
        const source = viewer.world.getItemAt(itemIndex).source;

        if (typeof source.prefLabel !== 'undefined') layers[itemIndex].prefLabel = source.prefLabel;
        if (typeof source.resolutionUnit !== 'undefined') layers[itemIndex].resolutionUnit = source.resolutionUnit;
        if (typeof source.xResolution !== 'undefined') layers[itemIndex].xResolution = source.xResolution;
      } catch (e) {
        console.log(`%c${e.message}`, 'color: #ff6a5a;');
      }
    }

    // When an item is added to the World, grab the info
    viewer.world.addHandler('add-item', ({ item }) => {
      addInfo(item);
    });

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
      console.log("params", typeof params, params);
      const zoom = viewer.viewport.getZoom();
      const pan = viewer.viewport.getCenter();

      // In Chrome, these fire when you pan/zoom AND tab-switch to something else (like your IDE)
      if (params.zoom !== undefined && params.zoom !== zoom) {
        viewer.viewport.zoomTo(params.zoom, null, true);
      }

      if (
        params.x !== undefined
        && params.y !== undefined
        && (params.x !== pan.x || params.y !== pan.y)
      ) {
        const point = new OpenSeadragon.Point(params.x, params.y);
        viewer.viewport.panTo(point, true);
      }
    }

    // Image has been downloaded and can be modified before being drawn to the canvas.
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
      let minImgZoom = viewer.viewport.viewportToImageZoom(viewer.viewport.getMinZoom());
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
            viewer.viewport.zoomTo(viewer.world.getItemAt(0)
              .imageToViewportZoom(imageZoom));
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
        srcRest: `${CONFIG.osdImages}zin_rest.png`,
        srcGroup: `${CONFIG.osdImages}zin_grouphover.png`,
        srcHover: `${CONFIG.osdImages}zin_hover.png`,
        srcDown: `${CONFIG.osdImages}zin_pressed.png`,
        onClick() {
          viewer.viewport.zoomTo(viewer.viewport.getMaxZoom());
          // viewer.viewport.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(1.0));
        }
      });

      // Zoom all the way out
      const zoutButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 0%',
        srcRest: `${CONFIG.osdImages}zout_rest.png`,
        srcGroup: `${CONFIG.osdImages}zout_grouphover.png`,
        srcHover: `${CONFIG.osdImages}zout_hover.png`,
        srcDown: `${CONFIG.osdImages}zout_pressed.png`,
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
      console.log("ppm", typeof ppm, ppm);
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
      if (isRealValue(item.resolutionUnit)) {
        if (item.resolutionUnit === 3) {
          const pixPerCm = item.xResolution;
          setScaleBar(pixPerCm * 100);
          MICRONS_PER_PIX = 10000 / pixPerCm;
        } else {
          console.warn('resolutionUnit <> 3', item.resolutionUnit);
        }
      }
    }

    this.viewer = viewer; // SET THIS VIEWER
    this.overlay = this.viewer.fabricjsOverlay({ scale: 1000 });
    this.canvas = this.overlay.fabricCanvas();
    this.vInfo = viewerInfo;
  }

  /**
   * @return OpenSeadragon.Viewer
   */
  getViewer() {
    return this.viewer;
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
  handleDrag(images, viewer);
};

function createLayerElements(layersColumn, layers, viewer) {
  const myEyeArray = [];

  const globalEyeball = globalEye(layersColumn)

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

// VIEWER'S DRAGGABLE LAYERS
function handleDrag(layers, viewer) {
  // Div containing viewer (Remember this is executed for each viewer.)
  const osdDiv = document.getElementById(viewer.id);

  // The features/layers to the right of the viewer
  const features = document.querySelectorAll(".layer");
  features.forEach(feature => {
    feature.addEventListener("dragstart", handleDragStart);
    feature.addEventListener("dragend", handleDragEnd);
  });

  /* events fired on the draggable target */

  function handleDragStart(evt) {
    evt.target.style.opacity = "0.4";
    sourceViewer = viewer; // eslint-disable-line no-undef
    draggedFeature = this; // eslint-disable-line no-undef
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("text/plain", evt.target.id);
  }

  function handleDragEnd(evt) {
    evt.target.style.opacity = "1"; // this = the draggable feature
    osdDiv.classList.remove("drag-over");
  }

  /* events fired on the drop targets */

  osdDiv.addEventListener("dragover", evt => {
    // prevent default to allow drop
    evt.preventDefault();
    return false;
  });

  osdDiv.addEventListener("dragenter", function (evt) {
    // highlight potential drop target when the draggable element enters it
    evt.target.classList.add('drag-over');
  });

  osdDiv.addEventListener("dragleave", function (evt) {
    // reset border of potential drop target when the draggable element leaves it
    evt.target.classList.remove('drag-over')
  });

  osdDiv.addEventListener("drop", handleDrop);

  function handleDrop(evt) {
    // prevent default action (open as link for some elements)
    evt.preventDefault();
    evt.stopPropagation();

    evt.target.classList.remove('drag-over') // restore style
    const targetElement = evt.target;
    const viewerDiv = targetElement.closest(".viewer"); // where they dropped the feature

    if (!viewerDiv) {
      console.error("!viewerDiv");
      return false;
    }

    // Find neighboring layersColumn
    const columnWithViewer = viewerDiv.parentElement;
    const columnLayAndCol = columnWithViewer.nextSibling; // Target viewer's layersAndColors column

    // Find the neighboring table (we will add this feature here)
    const divClassScroll = columnLayAndCol.firstChild;
    const tableLayAndColor = divClassScroll.firstChild;

    const movedFeatId = evt.dataTransfer.getData("text");
    const movedFeature = document.getElementById(movedFeatId);
    const featureName = movedFeature.innerHTML;

    let row;
    let cells;
    let lay;
    let layNum;
    let eye;
    let foundMatchingSlide = false;

    // Iterate table rows
    let myHTMLCollection = tableLayAndColor.children
    for (let i = 0; i < myHTMLCollection.length; i++) {
      // Skip first row (globals)
      if (i > 0) {
        row = myHTMLCollection[i];
        cells = row.children
        lay = cells[0].firstChild;
        layNum = lay.id[0]; // 1st char is array index
        eye = cells[1].children[0];

        // css transition: .block, .color-fade
        if (lay.innerHTML === featureName) {
          foundMatchingSlide = true;

          // Highlight the layer
          lay.classList.remove("layer");
          lay.classList.add("block");
          lay.classList.add("color-fade");

          /** timeout to turn it back to normal **/
          setTimeout(function () {
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
    }

    const targetViewer = getOsdViewer(evt, viewerDiv);
    if (targetViewer !== null) {
      if (foundMatchingSlide) {
        console.log("Found matching slide");
        try {
          targetViewer.world.getItemAt(layNum).setOpacity(1); // show
          // We already turned on target feature eyeball

          // TODO: Uncomment if we want "move" instead of "copy":
          // sourceViewer.world.getItemAt(layNum).setOpacity(0) // hide
          // let eye1 = draggedFeature.parentNode.nextSibling.firstChild
          // Toggle eyeball on source feature
          // eye1.classList.remove('fa-eye');
          // eye1.classList.add('fa-eye-slash');
        } catch (e) {
          // It may get here if the handler executes twice on one drop
          console.warn(e.message);
        }
      } else {
        let location;
        try {
          location = sourceViewer.tileSources[layNum].tileSource;
        } catch (e) {
          console.error("oops.", e.message);
        }
        console.error("Did not find matching slide\nLocation:", location);
      }
    }
    return false;
  }
}

function addIconRow(myEyeArray, divTable, currentLayer, allLayers, viewer) {
  const divTableRow = e("div", {class: "divTableRow"});
  divTable.appendChild(divTableRow);

  const layerNum = currentLayer.layerNum;
  const featureName = getPreferredLabel(currentLayer);

  // FEATURE
  const feat = createDraggableBtn(layerNum, featureName);
  divTableRow.appendChild(e("div", {class: "divTableCell", style: "padding: 3px"}, [feat]));

  // VISIBILITY TOGGLE
  const faEye = layerEye(currentLayer);
  if (layerNum > 0) {
    myEyeArray.push(faEye);
  }

  divTableRow.appendChild(e("div", {class: "divTableCell"}, [faEye]));

  // TRANSPARENCY SLIDER
  const [icon, slider] = transparencySlider(currentLayer, faEye, viewer);

  // .myDIV
  const div = e("div", {class: "myDIV", title: "transparency slider"}, [icon]);

  // .hide
  div.appendChild(e("div", {class: "hide"}, [slider]));

  // VISIBILITY
  // faEye.addEventListener('click', () => { layerEyeEvent(faEye, slider, layerNum, viewer) });
  faEye.addEventListener("click", layerEyeEvent.bind(null, faEye, slider, layerNum, viewer), false);

  divTableRow.appendChild(e("div", {class: "divTableCell"}, [div]));

  if (layerNum > 0) {
    // COLOR PALETTE
    createColorPalette(divTableRow, featureName, currentLayer, allLayers, viewer);

    // TACHOMETER
    const divBody = createTachometer(divTableRow, featureName);

    layerPopup(divBody, allLayers, viewer);
  } else {
    divTableRow.appendChild(e("div", {class: "divTableCell"}));
  }
}

function _extractLocation(layer) {
  let loc;
  if (typeof layer.location === 'string') {
    loc = layer.location;
  } else if (typeof layer.location === 'object') {
    loc = layer.location.url;
  } else {
    throw new TypeError(`Unidentified URL type... ${layer.location}`);
  }
  return loc;
}

function getPreferredLabel(layer) {
  let featureName;
  const loc = _extractLocation(layer);
  const sections = loc.split("/");
  const re = /^(?:[a-z]+:)?\b/gm;

  if (loc.match(re)) {
    // Absolute URL
    featureName = sections[sections.length - 2];
  } else {
    // Relative URL
    featureName = sections[sections.length - 1];
  }

  if (featureName.includes(".")) {
    featureName = featureName.substring(0, featureName.indexOf("."));
  }

  return featureName;
}

// Feature (draggable)
function createDraggableBtn(layerNum, featureName) {
  const element = e("button", {
    id: `${layerNum}${createId(5, "feat")}`,
    class: "layer",
    style: "display: inline-block",
    draggable: "true",
    title: featureName
  });
  element.innerHTML = featureName;
  return element;
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

  if (typeof tiledImage !== "undefined") {
    if (icon.classList.contains("fa-eye-slash")) {
      // Turn off layer
      tiledImage.setOpacity(0);
      // slider.value = "0" // Set slider to 0
    } else {
      // Turn on layer
      let opacity;
      if (parseInt(slider.value) === 0) {
        opacity = 1;
        slider.value = "100";
      } else {
        opacity = slider.value / 100
      }
      tiledImage.setOpacity(opacity);
      // tiledImage.setOpacity(1) // Turn on layer
      // slider.value = "100" // Set slider to (opacity * 100)
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
  const divBody = popup.lastChild;

  icon.addEventListener("click", () => {
    popup.style.display = "block";
  });

  return divBody;
}

function getOsdViewer(evt, sourceViewerDiv) {
  const targetElement = evt.target;
  const tagName = targetElement.tagName.toLowerCase();

  if (tagName === "canvas") {
    try {
      let retVal;
      try {
        for (const sync of SYNCED_IMAGE_VIEWERS) {
          if (sync.getViewer().id === sourceViewerDiv.id) {
            retVal = sync.getViewer();
            break;
          }
        }
      } catch (e) {
        console.error("message:", e.message);
      }
      return retVal;
    } catch (e) {
      console.error(e.message)
    }
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

/**
 * Create popup interface and handle events.
 *
 * @param {object} divBody - The body of the div, which we will fill in here.
 * @param {Array} allLayers - Array of layers displayed in this viewer
 * @param {object} viewer - OpenSeadragon viewer
 */
const layerPopup = function(divBody, allLayers, viewer) {
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
      STATE.attenuate = !STATE.attenuate;
      // Either outline is on or attenuate is on; not both. #attenuate
      STATE.outline = false;
      // Attenuate on prob, class, or heatmap, for now.
      // PTF: Switch to something else if it's by threshold.
      if (STATE.renderType === 'byThreshold') {
        STATE.renderType = 'byProbability';
      }
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
      STATE.outline = !STATE.outline;
      // Either outline is on or attenuate is on; not both. #outline
      STATE.attenuate = false;
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

      if (d.type === 'outside') {
        setFilter(allLayers, viewer, { min: slideVals[0], max: slideVals[1], type: 'outside' });
      } else {
        setFilter(allLayers, viewer, { min: slideVals[0], max: slideVals[1], type: 'inside' });
      }
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
 * Wrapper component around OpenSeadragon viewer.
 * Set up OSD viewer to allow for multiple viewer control.
 * @extends ImageViewer
 */
class MultiViewer extends ImageViewer {
  /**
   * @param {object} viewerInfo - Info specific to 'this' viewer
   * @param {number} numViewers - Total number of viewers.
   * @param {object} options - Filters, paintbrush, etc.
   */
  constructor(viewerInfo, numViewers, options) {
    super(viewerInfo);

    if (typeof options === 'undefined') {
      options = {};
    }

    this.checkboxes = {
      checkPan: true,
      checkZoom: true
    };

    if (numViewers > 1) {
      this.checkboxes.checkPan = document.getElementById(`chkPan${viewerInfo.idx}`);
      this.checkboxes.checkZoom = document.getElementById(`chkZoom${viewerInfo.idx}`);
    }

    if (options.toolbarOn) {
      markupTools(viewerInfo, options, super.getViewer());
    }

    layerUI(
      document.getElementById(`layersAndColors${viewerInfo.idx}`),
      viewerInfo.layers,
      super.getViewer(),
    );
  }

  /**
   * @return {OpenSeadragon.Viewer}
   */
  getViewer() {
    return super.getViewer();
  }

  /**
   * @return {object} {checkPan: boolean, checkZoom: boolean}
   */
  getPanZoom() {
    return this.checkboxes;
  }
}

/**
 * Synchronize pan & zoom on every viewer in the given array.
 *
 * @param {Array} multiViewerArray - Array of MultiViewer objects
 */
const synchronizeViewers = function(multiViewerArray) {
  const isGood = checkData(multiViewerArray);

  if (isGood) {
    this.SYNCED_IMAGE_VIEWERS = [];
    this.activeViewerId = null;
    this.numViewers = multiViewerArray.length;

    multiViewerArray.forEach(function(imageViewer) {
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

function checkData(multiViewerArray) {
  if (isEmpty(multiViewerArray)) {
    console.error('synchronizeViewers.js: Expected input argument, but received none.');
    return false;
  }

  if (!(multiViewerArray[0] instanceof Object)) {
    console.error('synchronizeViewers.js: Array elements should be MultiViewer objects.');
    return false;
  }

  return true;
}
