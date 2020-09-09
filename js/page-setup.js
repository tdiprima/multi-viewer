function setup(num, options) {

}

let createDivs = async function (num) {
    // Make 'num' divs.
    // for (let idx = 1; idx <= num; idx++) {
    //     create(idx);
    // }
    for (let idx = 1; idx <= num; idx++) {
        create(idx);
    }
    return "done";
};

function create(idx) {
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
    // buttonDiv.innerHTML =
    controlsDiv.append(buttonDiv);

    createButtons(5, buttonDiv, idx);


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

function createSliders(div) {
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
        // sliders.push(range); // todo: are
    }
}


function createButtons(len, div, idx) {

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

    // Create 5 buttons
    // for (let i = 1; i <= len; i++) {
    //     let btn = document.createElement("BUTTON");
    //     btn.innerHTML = 'button ' + i.toString();
    //     div.append(btn);
    // }
}

function sliderEvt(sliders, options, idx) {
    // Slider button event handler
    if (options.slidersOn) {
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
        }
    }
}

let createViewers = async function (num_viewers, options) {
    let arr = [];
    for (let i = 1; i <= num_viewers; i++) {
        arr.push(new nViewer("viewer" + i, options));
    }
    return arr;
}
