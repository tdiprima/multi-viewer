/**
 * Attach dropdowns to div
 * Select cancer type and slide
 */
class Dropdown {
    constructor(viewerArray, divId, dataSource) {

        const cancertypes = ["blca", "brca", "cesc", "gbm", "luad", "lusc", "paad", "prad", "skcm", "ucec"];
        const maindiv = document.getElementById(divId);
        // const iiif = "https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg";
        const iiif = window.location.origin + "/iiif/?iiif=/tcgaseg";
        let cancerSelect = {};
        let imageSelect = {};
        let data = {};
        initialize();

        // Speed up calls to hasOwnProperty
        let hasOwnProperty = Object.prototype.hasOwnProperty;

        function isEmpty(obj) {

            // null and undefined are "empty"
            if (obj == null) return true;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;

            // If it isn't an object at this point
            // it is empty, but it can't be anything *but* empty
            // Is it empty?  Depends on your application.
            if (typeof obj !== "object") return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        }

        function initialize() {
            let getSlideData = async function () {
                return (await fetch(dataSource)).json();
            };
            let x = getSlideData();
            x.then(function (result) {
                data = result;
                if (!isEmpty(data)) {
                    initTypes();
                    initImages();
                }
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

        function imageExists(image_url) {

            let http = new XMLHttpRequest();
            http.open('HEAD', image_url, false);
            http.send();
            return http.status !== 404;

        }

        function selectImage() {
            let cVal = cancerSelect.value;
            let iVal = imageSelect.value;
            console.log("setting viewer to image : " + iVal);
            let ti = iiif + "/tcgaimages/" + cVal + "/" + iVal + ".svs/info.json";
            let si = iiif + "/featureimages/" + cVal + "/" + iVal + "-featureimage.tif/info.json";

            if (imageExists(ti)) {
                // Do something now that you know the image exists.
                viewerArray.forEach(function (elem) {
                    elem.getViewer().open([ti, si]);
                });
            } else {
                // Image doesn't exist - do something else.
                alert('Image does not exist\n' + ti);
                return false;
            }

        }

        function initTypes() {
            let d = document.createDocumentFragment();
            let newDiv = document.createElement("div");
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

            let images = data[cancertypes[0]];
            if (typeof images !== 'undefined') {
                let d = document.createDocumentFragment();
                let newDiv = document.createElement("div");
                newDiv.innerHTML = "Image&nbsp;";
                d.appendChild(newDiv);
                imageSelect = document.createElement("select");
                imageSelect.id = "imageids";

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
}
