/**
 * Match pan, match zoom, show sliders, color options, 'draw' button, toggle marker.
 * @param div
 * @param idx
 * @param sliders
 * @param options
 * @constructor
 */
function Toolbar(div, idx, sliders, options) {
    // Create.
    let chkPan1 = new Toggle("checkbox", "chkPan" + idx, "Match Pan");
    let chkZoom1 = new Toggle("checkbox", "chkZoom" + idx, "Match Zoom");
    let btnSlide = `<button class="btn" id="btnSlide${idx}"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;&nbsp;`;

    let color = "#00f";
    if (options.paintbrushColor) {
        color = options.paintbrushColor;
    }

    let wPaint = `<mark id='mark${idx}'>${options.paintbrushColor}</mark>&nbsp;&nbsp;`;
    let btnDraw = `<button class="btn" id="btnDraw${idx}"><i class="fa fa-pencil"></i> Draw</button>&nbsp;&nbsp;`;
    let btnMapMarker = `<button class="btn" id="toggle-overlay" style="display: none"><i class="fa fa-map-marker"></i> Hide markers</button>&nbsp;&nbsp;`;
    // Draw.
    let div1 = document.createElement('div');
    div1.innerHTML = (options.multipleOn ? chkPan1.show() + chkZoom1.show() : "") + wPaint + btnDraw + (options.slidersOn ? btnSlide : "") + btnMapMarker;
    div.appendChild(div1);

    // Event listeners
    if (options.slidersOn) {
        let sld = document.getElementById("btnSlide" + idx);
        if (sld !== null) {
            sld.addEventListener('click', function () {

                let x = sliders[0];
                if (x.style.display === 'none') {
                    x.style.display = 'block';
                    sliders[1].style.display = 'block';
                    this.innerHTML = "<i class=\"fa fa-sliders\"></i> Hide sliders";
                } else {
                    x.style.display = 'none';
                    sliders[1].style.display = 'none';
                    this.innerHTML = "<i class=\"fa fa-sliders\"></i> Show sliders";
                }
            });
        }
    }

    function setMarkerStyle(b) {
        var x = document.getElementsByClassName("fa fa-map-marker");
        if (b) {
            s = 'block';
            h = "<i class=\"fa fa-map-marker\"></i> Hide markers";
        }
        else {
            s = 'none';
            h = "<i class=\"fa fa-map-marker\"></i> Show markers";
        }

        // get a HTMLCollection of elements in the page
        let collection = document.getElementsByTagName("i");

        for (item of collection) {
            console.log(item);
            item.style.display = s;
            item.innerHTML = h;
        }

    }

    let jsc = new Color(document.getElementById('mark' + idx));
}
