function setup(num, options) {

}

let createDivs = async function (num) {
    // Make 'num' divs.
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
    buttonDiv.innerHTML = ;
    controlsDiv.append(buttonDiv);

    createButtons(5, buttonDiv);


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

    // Sliders
    let len = 2;
    for (let i = 0; i < len; i++) {
        let range = document.createElement('input');
        range.type = "range";
        range.id = "sliderRange" + i;
        range.min = "0";
        range.max = "100";
        range.value = "100";
        range.setAttribute('class', "slider-square");
        d.appendChild(range); // append div to fragment
        div.appendChild(d); // append fragment to parent
        // sliders.push(range);
    }
}

function createButtons(len, div) {

    // Create 5 buttons
    for (let i = 1; i <= len; i++) {
        let btn = document.createElement("BUTTON");
        btn.innerHTML = 'button ' + i.toString();
        div.append(btn);
    }
}

let createViewers = async function(num_viewers, options) {
    let arr = [];
    for (let i = 1; i <= num_viewers; i++) {
        arr.push(new nViewer("viewer" + i, options));
    }
    return arr;
}
