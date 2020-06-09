class Dropdown {
  constructor(viewerArray) {

    const cancertypes = ["blca", "brca", "cesc", "gbm", "luad", "lusc", "paad", "prad", "skcm", "ucec"];
    const maindiv = document.getElementById('selections');
    // const iiif = "https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg";
    const iiif = window.location.origin + "/iiif/?iiif=/tcgaseg";
    let cancerSelect = {};
    let imageSelect = {};
    let data = {};
    initialize();

    function initialize() {
      let getSlideData = async function () {
        return (await fetch("tcga.json")).json();
      };
      let x = getSlideData();
      x.then(function (result) {
        data = result;
        initTypes();
        initImages();
      });
    }

    function selectCancerType() {
      let val = cancerSelect.value;
      imageSelect.options.length = 0;
      let nl = data[val];
      for (let i = 0; i < nl.length; i++) {
        let option = document.createElement("option");
        option.text = nl[i].id;
        imageSelect.add(option);
      }
      console.log("You selected: " + val + " which has " + imageSelect.options.length + " images");
      selectImage();
    }

    function selectImage() {
      let cVal = cancerSelect.value;
      let iVal = imageSelect.value;
      console.log("setting viewer to image : " + iVal);
      let ti = iiif + "/tcgaimages/" + cVal + "/" + iVal + ".svs/info.json";
      let si = iiif + "/featureimages/" + cVal + "/" + iVal + "-featureimage.tif/info.json";

      viewerArray.forEach(function (elem) {
        elem.getViewer().open([ti, si]);
        // elem.setSources([ti, si], [1.0, 1.0]); // why not this?
      });
    }

    function initTypes() {
      let d = document.createDocumentFragment();
      let newDiv = document.createElement("div");
      newDiv.setAttribute("class", "foo1");
      newDiv.innerHTML = "Type&nbsp;";
      d.appendChild(newDiv);
      cancerSelect = document.createElement('select');
      cancerSelect.id = "cancertype";
      cancertypes.forEach(function (item) {
        let opt = document.createElement('option');
        opt.innerHTML = item;
        opt.value = item;
        cancerSelect.appendChild(opt);
      });
      cancerSelect.addEventListener("change", selectCancerType);
      newDiv.appendChild(cancerSelect);
      maindiv.appendChild(d);
    }

    function initImages() {
      let d = document.createDocumentFragment();
      let newDiv = document.createElement("div");
      newDiv.setAttribute("class", "foo2");
      newDiv.innerHTML = "Image&nbsp;";
      d.appendChild(newDiv);
      imageSelect = document.createElement("select");
      imageSelect.id = "imageids";
      let images = data[cancertypes[0]];
      images.forEach(function (item) {
        let opt = document.createElement('option');
        opt.innerHTML = item.id;
        opt.value = item.id;
        imageSelect.appendChild(opt);
      });
      imageSelect.addEventListener("change", selectImage);
      newDiv.appendChild(imageSelect);
      maindiv.appendChild(d);
    }
  }

}
