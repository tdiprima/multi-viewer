this.viewers = [];
this.sliders = [];
this.sync = {};
let pageSetup = function () {

    let num_divs, options, prod;

    this.setup = function (num_divs1, options1, prod1) {
        num_divs = num_divs1;
        options = options1;
        prod = prod1;

        new Promise(function (resolve, reject) {

            // Create divs
            for (let idx = 1; idx <= num_divs; idx++) {
                createDivs(idx);
            }
            return resolve(1); // todo: ?

        }).then(function (result) {

            // Create viewers
            for (let i = 1; i <= num_divs; i++) {
                this.viewers.push(new nViewer("viewer" + i, options));
            }
            return result * 2;
        }).then(function (result) {
            // Viewers created; add dropdown to page
            new Dropdown(this.viewers, 'selections', './json/tcga.json');
            return result * 2;
        }).then(function (result) {
            // Pan zoom controller
            new Synchronizer(this.viewers);  // Pass array of nViewers
            return result * 2;
        }).then(function (result) {
            function test() {
                // TESTING
                let dzi = "//openseadragon.github.io/example-images/duomo/duomo.dzi";
                this.viewers.forEach(function (elem) {
                    elem.getViewer().open(dzi)
                });
            }

            function live() {``
                // Set viewer source
                const iiif = window.location.origin + "/iiif/?iiif=/tcgaseg";
                const id = "blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E";
                this.viewers.forEach(function (elem) {
                    elem.setSources([iiif + "/tcgaimages/" + id + ".svs/info.json",
                    iiif + "/featureimages/" + id + "-featureimage.tif/info.json"],
                        [1.0, 1.0]);
                });
            }

            if (prod) {
                live();
            } else {
                test();
            }
        });

    }

}


let createDivs = function (idx) {
    let name;

    let container = document.createElement('div');
    container.className = 'divSquare';
    // container.innerHTML = 'container';
    document.body.appendChild(container);


    name = 'controls';
    let controlsDiv = document.createElement("div"); // 'controls' div
    controlsDiv.id = name;
    controlsDiv.className = name;
    // controlsDiv.innerHTML = name;

    container.appendChild(controlsDiv); // add to 'container' div


    name = 'range';
    let rangeDiv = document.createElement("div"); // div containing 'sliders'
    // rangeDiv.innerHTML = name;
    rangeDiv.className = name;
    controlsDiv.append(rangeDiv);

    createSliders(rangeDiv);


    let buttonDiv = document.createElement("div"); // div containing 'buttons'
    buttonDiv.classList = 'floated buttons';
    controlsDiv.append(buttonDiv);

    createButtons(buttonDiv, idx);

    sliderEvt(idx);


    name = 'viewer';
    let viewerDiv = document.createElement("div"); // 'viewer' div
    viewerDiv.id = name + idx;
    viewerDiv.className = name;
    // viewerDiv.innerHTML = name;

    container.appendChild(viewerDiv);


    // Clear:both between rows
    if (idx % 2 === 0) {
        let div = document.createElement('div');
        div.style.clear = 'both';
        document.body.appendChild(div);
    }

}

let createSliders = function (div) {
    let d = document.createDocumentFragment();
    let len = 2;
    for (let i = 0; i < len; i++) {
        let range = document.createElement('input');
        range.type = "range";
        range.id = "sliderRange" + i;
        range.min = "0";
        range.max = "100";
        range.value = "100";
        range.setAttribute('class', "slider-square");
        range.style.display = "none"; // bc we have a btn to toggle it
        d.appendChild(range); // append div to fragment
        div.appendChild(d); // append fragment to parent
        this.sliders.push(range);
    }
}


let createButtons = function (div, idx) {

    div.innerHTML = `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
    <input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;
        <a href="#"><mark id="mark${idx}" style="background-color: rgb(0, 255, 255);">#00ffff</mark>&nbsp;
        <button id="btnDraw${idx}" class="btn"><i class="fa fa-pencil-alt"></i> Draw polygon</button>&nbsp;
        <button id="btnEdit${idx}" class="btn"><i class="fa fa-draw-polygon"></i> Edit polygon</button>&nbsp;
        <button id="btnGrid${idx}" class="btn"><i class="fa fa-border-all"></i> Draw grid</button>&nbsp;
        <button id="btnMarker${idx}" class="btn"><i class="fa fa-paint-brush"></i> Mark grid</button>&nbsp;
        <button id="btnSlide${idx}" class="btn"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;
        <button id="toggle-overlay" class="btn" style="display: none"><i class="fa fa-map-marker-alt"></i> Hide markers</button>
    </a>`;

}

let sliderEvt = function (idx) {
    // Slider button event handler
    // if (this.options.slidersOn) {
    let sld = document.getElementById("btnSlide" + idx);
    if (sld !== null) {
        sld.addEventListener('click', function () {

            let x = sliders[0];
            if (x.style.display === 'none') {
                x.style.display = 'inline';
                sliders[1].style.display = 'inline';
                this.innerHTML = "<i class=\"fa fa-sliders\"></i> Hide sliders";
            } else {
                x.style.display = 'none';
                sliders[1].style.display = 'none';
                this.innerHTML = "<i class=\"fa fa-sliders\"></i> Show sliders";
            }
        });
    } else {
        alert('slide is null')
    }
    // }
}
