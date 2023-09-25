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

// VIEWER'S DRAGGABLE LAYERS
function handleDrag(layers, viewer) {
  // Wrap everything related to drag and drop inside an IIFE
  (function (viewer) {
    // These variables are now specific to this viewer
    let sourceViewer;
    let draggedFeature;

    // Div containing viewer (Remember this is executed for each viewer.)
    const osdDiv = document.getElementById(viewer.id);

    function handleDragStart(evt) {
      evt.target.style.opacity = "0.4";
      sourceViewer = viewer;
      draggedFeature = this;
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("text/plain", evt.target.id);
    }

    function handleDragEnd(evt) {
      evt.target.style.opacity = "1"; // this = the draggable feature
      osdDiv.classList.remove("drag-over");
    }

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

      // Get neighboring elements
      const columnWithViewer = viewerDiv.parentElement;

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

      const targetViewer = getOsdViewer(evt, viewerDiv);

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

    // Attach the event listeners
    const features = document.querySelectorAll(".layer");
    features.forEach(feature => {
      feature.addEventListener("dragstart", handleDragStart);
      feature.addEventListener("dragend", handleDragEnd);
    });

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
      evt.target.classList.remove('drag-over');
    });

    osdDiv.addEventListener("drop", handleDrop);

  })(viewer); // Pass the viewer into the IIFE
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

async function addIconRow(myEyeArray, divTable, currentLayer, allLayers, viewer) {
  const divTableRow = e("div", {class: "divTableRow"});
  divTable.appendChild(divTableRow);

  const layerNum = currentLayer.layerNum;

  try {
    const data = await fetchData(currentLayer.location);
    const featureName = getFeatureName(layerNum, currentLayer, data);
    const element = createDraggableBtn(layerNum, currentLayer, featureName);

    divTableRow.appendChild(e("div", {class: "divTableCell", style: "padding: 3px"}, [element]));

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
  const divBody = document.getElementById(`${popup.id}Body`);

  icon.addEventListener("click", () => {
    popup.style.display = "block";
  });

  return divBody;
}

function getOsdViewer(evt, sourceViewerDiv) {
  // Verify the event target is a canvas (versus a button)
  if (evt.target.tagName.toLowerCase() === "canvas") {
    try {
      // Try to find and return a viewer from the list that has the same ID as sourceViewerDiv.id
      return SYNCED_IMAGE_VIEWERS.find(
        sync => sync.getViewer().id === sourceViewerDiv.id
      )?.getViewer() || null;
    } catch (e) {
      console.error("Something happened...", e.message);
    }
  }
  // If the target is not a <canvas> or if no matching viewer is found, return null.
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
