/**
 * Match pan, match zoom, show sliders, color options, 'draw' button, toggle marker.
 * @param div
 * @param idx
 * @param sliders
 * @param options
 * @constructor
 */
function Toolbar(div, idx, sliders, options) {
    // Pan and Zoom checkboxes
    let chkPan1 = `<input type="checkbox" id="chkPan${idx}" checked><label for="chkPan${idx}">Match Pan</label>&nbsp;&nbsp;`
    let chkZoom1 = `<input type="checkbox" id="chkZoom${idx}" checked><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`

    // Slider button
    let btnSlide = `<button class="btn" id="btnSlide${idx}"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;&nbsp;`;

    let color = "#00f";
    if (options.paintbrushColor) {
        color = options.paintbrushColor;
    }

    // Paint/Draw buttons handled by paint.js
    let wPaint = `<mark id='mark${idx}'>${options.paintbrushColor}</mark>&nbsp;&nbsp;`;
    let btnDraw = `<button class="btn" id="btnDraw${idx}"><i class="fa fa-pencil-alt"></i> Draw</button>&nbsp;&nbsp;`;

    // Map markers handled by map-marker.js
    let btnMapMarker = `<button class="btn" id="toggle-overlay" style="display: none"><i class="fa fa-map-marker"></i> Hide markers</button>&nbsp;&nbsp;`;

    // Polygon - NEW!
    let btnPolygon = `<button class="btn" id="btnPolygon${idx}"><i class='fas fa-draw-polygon'></i> Draw Polygon</button>&nbsp;&nbsp;`;

    // Grid - NEW!
    let btnGrid = `<button class="btn" id="btnGrid${idx}">Draw Grid&nbsp;&nbsp;`;

    // Attach toolbar to viewer
    let div1 = document.createElement('div');
    div1.innerHTML = (options.multipleOn ? chkPan1 + chkZoom1 : "") + wPaint + btnDraw + (options.slidersOn ? btnSlide : "") + btnPolygon + btnGrid + btnMapMarker;
    div.appendChild(div1);

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

    document.getElementById("btnPolygon" + idx).addEventListener('click', function () {
        alert("Coming soon!");
    });

    document.getElementById('btnGrid' + idx).addEventListener('click', function () {
        alert("Coming real soon!");
    })

    // Color picker event handler
    new Color(document.getElementById('mark' + idx));
}
