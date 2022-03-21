// eslint-disable-next-line prefer-const
let CONFIG = {
  osdImages: '/multi-viewer/vendor/openseadragon/images/',
  appImages: '/multi-viewer/images/'
};
// let CONFIG = {
//   osdImages: 'vendor/openseadragon/images/',
//   appImages: 'images/'
// }

function setFilter(layers, viewer, range, thresh) {
  if (viewer.world) {
    const itemCount = viewer.world.getItemCount();
    const filterOpts = [];

    // Because one does not simply color the affected layer.
    // No. You have to do all of them.
    for (let i = 0; i < itemCount; i++) {
      if (i > 0) {
        // comment here
        if (!isEmpty(range)) {
          // USE RANGE VALUES
          let r;
          let g;
          let b;
          if (range.type === 'inside') {
            // Color #00FFFF is cyan
            r = 0;
            g = 255;
            b = 255;
          } else {
            // Color #4A00B4 is Purple Heart
            r = 74;
            g = 0;
            b = 180;
          }
          filterOpts.push({
            items: viewer.world.getItemAt(i),
            processors: [colorFilter.prototype.PROBABILITY(range, r, g, b)]
          });
        } else if (STATE.outline) {
          // OUTLINE POLYS
          // NOTE: Color can not have green in it.
          // Color #0000FF is blue
          filterOpts.push({
            items: viewer.world.getItemAt(i),
            processors: [colorFilter.prototype.OUTLINE(0, 0, 255)],
          });
        } else if (STATE.renderType === 'byProbability') {
          // USE COLOR SPECTRUM
          filterOpts.push({
            items: viewer.world.getItemAt(i),
            processors: [colorFilter.prototype.COLORLEVELS(layers[i].colorscheme.colorspectrum)],
          });
        } else if (STATE.renderType === 'byClass' || STATE.renderType === 'byHeatmap') {
          // USE COLOR SCHEME
          filterOpts.push({
            items: viewer.world.getItemAt(i),
            processors: [
              colorFilter.prototype.COLORLEVELS(layers[i].colorscheme.colors),
              // colorFilter.prototype.SMILEY(0, 0, 255) // uncomment here
            ],
          });
        }
        // todo
        else if (STATE.renderType === 'byThreshold') {
          filterOpts.push({
            items: viewer.world.getItemAt(i),
            processors: colorFilter.prototype.THRESHOLDING(thresh),
            // processors: OpenSeadragon.Filters.THRESHOLDING(thresh)
          });
        }
      } // comment here
    }
    // Set all layers at once (required)
    viewer.setFilterOptions({
      filters: filterOpts,
      loadMode: 'sync'
    });
  } else {
    console.log('No viewer.world');
  }
}

function setOsdMove(viewer, myBool) {
  viewer.setMouseNavEnabled(myBool);
  viewer.outerTracker.setTracking(myBool);
  viewer.gestureSettingsMouse.clickToZoom = myBool;
}

function toggleButton(element, class0, class1) {
  element.classList.toggle(class0);
  element.classList.toggle(class1);
}

function isRealValue(obj) {
  return obj && obj !== 'null' && obj !== 'undefined';
}

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

function alertMessage(messageObject) {
  window.alert(messageObject);
  return true;
}

function getRandomInt(minm, maxm) {
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}

function makeId(length, prefix) {
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

// Standard replacement for Java's String.hashCode()
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

// Item name is non-unique
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

// Element creation abstraction
const e = (name, properties = {}, children = []) => {
  // Create the element
  const element = document.createElement(name);

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

// github scijs/almost-equal
const abs = Math.abs;
const min = Math.min;

function almostEqual(a, b, absoluteError, relativeError) {
  const d = abs(a - b);
  if (absoluteError == null) absoluteError = almostEqual.DBL_EPSILON;
  if (relativeError == null) relativeError = absoluteError;
  if (d <= absoluteError) {
    return true;
  }
  if (d <= relativeError * min(abs(a), abs(b))) {
    return true;
  }
  return a === b;
}

almostEqual.DBL_EPSILON = 2.2204460492503131e-16;

function colorToArray(input) {
  const arrStr = input.replace(/[a-z%\s()]/g, '').split(',');
  return arrStr.map(i => Number(i));
}

function parseHash() {
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

function saveSettings(canvas, options) {
  const jsonObject = {
    theme: document.body.className,
    canvas: canvas.toJSON(),
    state: STATE,
    options,
  };
  console.log('settings', jsonObject);
  // todo: post object to server
}

function getViewers() {
  const result = [];
  for (let i = 0; i < SYNCED_IMAGE_VIEWERS.length; i++) {
    const info = SYNCED_IMAGE_VIEWERS[i].vInfo;
    const viewerObject = {
      type: 'MultiViewer Viewer',
      index: info.idx,
      osdId: info.osdId
    };
    const layers = info.layers;
    const newLayers = [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      newLayers.push({
        type: 'Layer',
        layerNum: layer.layerNum,
        colors: layer.colorscheme.colors,
        colorspectrum: layer.colorscheme.colorspectrum
      });
    }
    viewerObject.layers = newLayers;
    result.push(viewerObject);
  }

  return result;
}

function extractLocation(layer) {
  let loc;
  if (typeof layer.location === 'string') {
    loc = layer.location;
  } else if (typeof layer.location === 'object') {
    loc = layer.location.url;
  } else {
    throw new TypeError('Unidentified URL type...', layer.location);
  }
  return loc;
}

function isValidURL(string) {
  let result;
  let url;
  try {
    url = new URL(string);
    result = true;
  } catch (e) {
    result = false;
    console.log(`%c${e.message}`, 'color: #ff6a5a;', url);
    console.log('%cscript:', 'color: #ff6a5a;', `${e.fileName}:${e.lineNumber}`);
  }
  return result;
}

const scaleToPct = num => {
  return (num / 255) * 100;
};

const scaleToRgb = num => {
  return (num * 255) / 100;
};

const MAX = 255;
// eslint-disable-next-line prefer-const
let MICRONS_PER_PIX = 0.25; // default; actual value set later
// todo
// const RENDER_TYPES = ['byProbability', 'byClass', 'byHeatmap']
const RENDER_TYPES = ['byProbability', 'byClass', 'byHeatmap', 'byThreshold'];
const STATE = {
  attenuate: false,
  outline: false,
  renderType: RENDER_TYPES[0]
};
