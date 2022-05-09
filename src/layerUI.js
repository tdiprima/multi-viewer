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
  handleDrag(images, viewer);
};

function createLayerElements(layersColumn, layers, viewer) {
  const myEyeArray = [];
  let toggle = false;
  const vNum = layersColumn.id.slice(-1);
  // 'fas fa-eye-slash' : 'fas fa-eye'
  const globalEyeToggle = e("i", {
    id: `eyeTog${vNum}`,
    style: "display: inline-block",
    class: "fas fa-eye" // 'data-tooltip': 'eye toggle'
  });

  const table = e("div", { class: "table" });
  layersColumn.appendChild(e("div", { "class": "scroll" }, [table]));

  const tr = e("div", { class: "row" });
  table.appendChild(tr);
  tr.appendChild(e("div"));
  tr.appendChild(e("div", { class: "col" }, [globalEyeToggle]));

  layers.forEach(layer => {
    addIconRow(myEyeArray, table, layer, layers, viewer);
  });

  globalEyeToggle.addEventListener("click", function() {
    // class="fas fa-eye"
    // class="fas fa-eye-slash"
    myEyeArray.forEach(eye => {
      eye.click(e);
    });

    if (toggle) {
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
    } else {
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
    }
    toggle = !toggle;
  });
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

  osdDiv.addEventListener("dragenter", function(evt) {
    // highlight potential drop target when the draggable element enters it
    evt.target.classList.add('drag-over');
  });

  osdDiv.addEventListener("dragleave", function(evt) {
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
          setTimeout(function() {
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

function addIconRow(myEyeArray, table, currentLayer, allLayers, viewer) {
  const tr = e("div", { class: "row" });
  table.appendChild(tr);

  const layerNum = currentLayer.layerNum;
  const featureName = getPreferredLabel(currentLayer);

  // FEATURE
  const feat = createDraggableBtn(layerNum, featureName);
  tr.appendChild(e("div", { class: "col", style: "padding: 3px" }, [feat]));

  // VISIBILITY TOGGLE
  const faEye = createEyeball(currentLayer);
  if (layerNum > 0) {
    myEyeArray.push(faEye);
  }

  tr.appendChild(e("div", { class: "col" }, [faEye]));

  // TRANSPARENCY SLIDER
  const [icon, slider] = createTransparencySlider(currentLayer, faEye, viewer);

  // .showDiv
  const div = e("div", { class: "showDiv", title: "transparency slider" }, [icon]);

  // .showHover
  div.appendChild(e("div", { class: "showHover" }, [slider]));

  // VISIBILITY
  faEye.addEventListener("click", handleVisibility.bind(null, faEye, slider, layerNum, viewer), false);

  tr.appendChild(e("div", { class: "col" }, [div]));

  if (layerNum > 0) {
    // COLOR PALETTE
    createColorPalette(tr, featureName, currentLayer, allLayers, viewer);

    // TACHOMETER
    const divBody = createTachometer(tr, featureName);

    layerPopup(divBody, allLayers, viewer);
  } else {
    tr.appendChild(e("div", { class: "col" }));
  }
}

function getPreferredLabel(layer) {
  let featureName;
  const loc = extractLocation(layer);
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

// Eyeball visibility toggle
function createEyeball(currentLayer) {
  const cssClass = currentLayer.opacity === 0 ? "fas fa-eye-slash" : "fas fa-eye";
  return e("i", {
    id: createId(5, "eye"),
    class: `${cssClass} hover-light`,
    title: "toggle visibility"
  });
}

function createTransparencySlider(currentLayer, faEye, viewer) {
  // Icon
  const icon = document.createElement("i");
  icon.classList.add("fas");
  icon.classList.add("fa-adjust");
  icon.classList.add("hover-light");
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

  element.addEventListener("input", function() {
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
    class: "fas fa-palette pointer hover-light",
    title: "color palette"
  });

  icon.addEventListener("click", () => {
    colorsUI.style.display = "block";
  });

  row.appendChild(e("div", { class: "col" }, [icon]));

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
    class: "fas fa-tachometer-alt hover-light",
    title: "settings" // call it "settings", "control panel", idk.
  });
  row.appendChild(e("div", { class: "col" }, [icon]));

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

// Eyeball visibility handler
function handleVisibility(icon, slider, layerNum, viewer) {
  toggleButton(icon, "fa-eye", "fa-eye-slash");
  const tiledImage = viewer.world.getItemAt(layerNum);
  if (typeof tiledImage !== "undefined") {
    if (icon.classList.contains("fa-eye-slash")) {
      tiledImage.setOpacity(0); // Turn off layer
      // slider.value = "0" // Set slider to 0
    } else {
      tiledImage.setOpacity(slider.value / 100);
      // tiledImage.setOpacity(1) // Turn on layer
      // slider.value = "100" // Set slider to (opacity * 100)
    }
  }
}
