count = 0;
num_divs = 0;
viewers = [];
let pageSetup = function () {

    let options, prod;

    this.setup = function (num_divs1, prod1, sourceImages, options1) {
        
        document.addEventListener('DOMContentLoaded', (event) => {
            num_divs = num_divs1;
            prod = prod1;

            if (isRealValue(options1)) {
                options = options1;
            } else {
                // default
                options = {
                    filterOn: true,
                    slidersOn: true,
                    toolbarOn: true,
                    paintbrushColor: "#0ff",
                    viewerOpts: {
                        showFullPageControl: false,
                        showHomeControl: true,
                        showZoomControl: false
                    }
                }

                // default if single viewer
                if (num_divs === 1) {
                    options = {
                        filterOn: true,
                        slidersOn: true,
                        toolbarOn: false,
                        paintbrushColor: "#0ff",
                        viewerOpts: {
                            showFullPageControl: true,
                            showHomeControl: true,
                            showZoomControl: true
                        }
                    }
                }
            }

            new Promise(function (resolve, reject) {

                // Create divs
                for (let idx = 1; idx <= this.num_divs; idx++) {
                    createDivs(idx, options);
                }
                return resolve(this.viewers);

            }).then(function (v) {

                // Viewers created; add dropdown to page
                new Dropdown(v, 'selections', './json/tcga.json');
                return v

            }).then(function (v) {

                // Pan zoom controller
                new Synchronizer(v);  // Pass array of nViewers
                return v;

            }).then(function (v) {

                function test() {
                    // TESTING
                    v.forEach(function (elem) {
                        elem.getViewer().open(sourceImages[0]) // <- open()
                    });
                }

                function live() {
                    // Set viewer source
                    v.forEach(function (elem) {
                        elem.setSources(sourceImages, [1.0, 1.0]); // <- setSources()
                    });
                }

                if (prod) {
                    live();
                } else {
                    test();
                }

            });
        });
    }

}

let createDivs = function (idx, options) {

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

    // 2 sliders
    let sliders;
    if (options.slidersOn) {
        sliders = createSliders(idx, rangeDiv, 2, options);
    }


    if (options.toolbarOn) {
        let buttonDiv = document.createElement("div"); // div containing 'buttons'
        buttonDiv.classList.add('floated');
        buttonDiv.classList.add('buttons');
        controlsDiv.append(buttonDiv);

        // Create buttons
        createButtons(idx, buttonDiv, options);

        // Color picker event handler
        new Color(document.getElementById('mark' + idx));
    }

    // Slider button event handler
    if (options.slidersOn && options.toolbarOn) {
        sliderBtnEvt(idx, sliders);
    }


    name = 'viewer';
    let viewerDiv = document.createElement("div"); // 'viewer' div
    viewerDiv.id = name + idx;
    viewerDiv.className = name;
    // viewerDiv.innerHTML = name;

    container.appendChild(viewerDiv);


    this.viewers.push(new nViewer("viewer" + idx, sliders, options));


    // Clear:both between rows
    if (idx % 2 === 0) {
        let div = document.createElement('div');
        div.style.clear = 'both';
        document.body.appendChild(div);
    }

}


let createButtons = function (idx, div, options) {

    let color;
    if (isRealValue(options.paintbrushColor)) {
        color = options.paintbrushColor;
    } else {
        color = "#00f";
    }

    let htm = `<input type="checkbox" id="chkPan${idx}" checked=""><label for="chkPan${idx}">Match Pan</label>&nbsp;
    <input type="checkbox" id="chkZoom${idx}" checked=""><label for="chkZoom${idx}">Match Zoom</label>&nbsp;`;

    if (num_divs <= 1) {
        htm = '';
    }
    div.innerHTML = htm + `<mark id="mark${idx}">${color}</mark>&nbsp;
        <button id="btnDraw${idx}" class="btn"><i class="fa fa-pencil-alt"></i> Draw polygon</button>&nbsp;
        <button id="btnEdit${idx}" class="btn"><i class="fa fa-draw-polygon"></i> Edit polygon</button>&nbsp;
        <button id="btnGrid${idx}" class="btn"><i class="fa fa-border-all"></i> Draw grid</button>&nbsp;
        <button id="btnMarker${idx}" class="btn"><i class="fa fa-paint-brush"></i> Mark grid</button>&nbsp;
        <button id="btnSlide${idx}" class="btn"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;
        <button id="toggle-overlay" class="btn" style="display: none"><i class="fa fa-map-marker-alt"></i> Hide markers</button>
    </a>`;

}


let createSliders = function (idx, div, num, options) {

    let sliders = [];
    let d = document.createDocumentFragment();

    for (let i = 0; i < num; i++) {

        let range = document.createElement('input');
        range.type = "range";
        this.count += 1;
        range.id = "sliderRange" + this.count;
        range.min = "0";
        range.max = "100";
        range.value = "100";
        range.setAttribute('class', "slider-square");
        if (options.toolbarOn) {
            range.style.display = 'none';
        } else {
            range.style.display = 'inline'; // bc we have a btn to toggle it
        }

        d.appendChild(range); // append div to fragment
        div.appendChild(d); // append fragment to parent
        sliders.push(range);
    }
    return sliders;
}


let sliderBtnEvt = function (idx, sliders) {

    // Slider button event handler
    let btnSlide = document.getElementById("btnSlide" + idx);
    if (isRealValue(btnSlide)) {
        btnSlide.addEventListener('click', function () {

            // (2) sliders.
            if (sliders[0].style.display === 'none') { // no need to check both; just the one.

                // Show the sliders
                sliders[0].style.display = 'inline';
                sliders[1].style.display = 'inline';

                // Style the button
                this.innerHTML = "<i class=\"fa fa-sliders\"></i> Hide sliders";

            } else {
                // Hide the sliders
                sliders[0].style.display = 'none';
                sliders[1].style.display = 'none';

                // Style the button
                this.innerHTML = "<i class=\"fa fa-sliders\"></i> Show sliders";
            }
            toggleBtn(btnSlide);
        });
    } else {
        console.log('slide is null');
    }

    function toggleBtn(btn) {
        let isOn = btn.classList.contains('btnOn');
        let classList = btn.classList;
        while (classList.length > 0) {
            classList.remove(classList.item(0));
        }
        if (isOn) {
            btn.classList.add('btn');
        } else {
            btn.classList.add('btnOn');
        }
    }

}

function clearClassList(element) {
    let classList = element.classList;
    while (classList.length > 0) {
        classList.remove(classList.item(0));
    }
}

function toggleButton(btn) {
    let isOn = btn.classList.contains('btnOn');
    clearClassList(btn);
    if (isOn) {
        btn.classList.add('btn');
    } else {
        btn.classList.add('btnOn');
    }
}
