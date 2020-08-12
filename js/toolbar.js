/**
 * Match pan, match zoom, show sliders, color options, 'draw' button, toggle marker.
 * @param div
 * @param idx
 * @param sliders
 * @param options
 * @constructor
 */
function Toolbar(div, idx, sliders, options) {
    let div1 = document.createElement('div');
    let innerHtml;
    let color = "#00f";

    if (options.paintbrushColor) {
        color = options.paintbrushColor;
    }

    // Pan and Zoom checkboxes
    if (options.multipleOn) {
        innerHtml = `<input type="checkbox" id="chkPan${idx}" checked><label for="chkPan${idx}">Match Pan</label>&nbsp;&nbsp;
    <input type="checkbox" id="chkZoom${idx}" checked><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`;
    } else {
        innerHtml = '';
    }

    innerHtml += `<a data-page="fold${idx}" href="#"><i class="fa fa-list-alt" aria-hidden="true"></i> Menu</a>`

    /**
     * Fold-out menu
     */
    this.menu = function name() {
        innerHtml += `<div class="fold scrollmenu" id="fold${idx}" style="max-width:400px;margin:0 auto;">
        <a href="#"><mark id="mark${idx}" style="background-color: rgb(0, 255, 255);">#00ffff</mark></a>
        <a id="btnDraw${idx}" class="btn" href="#"><i class="fa fa-pencil-alt"></i> Draw</a>
        <a id="btnPolygon${idx}" class="btn" href="#"><i class="fa fa-draw-polygon"></i> Draw polygon</a>
        <a id="btnGrid${idx}" class="btn" href="#"><i class="fa fa-draw"></i> Draw grid</a>
        <a id="btnMarker${idx}" class="btn" href="#"><i class="fa fa-draw"></i> Activate marker</a>
        <a id="btnSlide${idx}" class="btn" href="#"><i class="fa fa-sliders"></i> Show sliders</a>
        <a id="toggle-overlay" style="display: none" href="#"><i class="fa fa-map-marker-alt"></i> Hide markers</a>
    </div>`;

        // Attach toolbar
        div1.innerHTML = innerHtml;
        div.appendChild(div1);

        // let blah = document.getElementById('blah' + idx);
        // blah.addEventListener('click', function () {
        //     alert('blah!');
        //     // return false;
        // });

        // Menu animation
        $("a").on('click', function () {
            let page = $(this).data("page");
            if (typeof page === "undefined")
                return;

            let ind = page.trim(-1).replace("fold", "");

            if (ind === idx) {
                if ($('div:animated').id !== page) {

                    let active = $(".fold.active");
                    // if there is visible fold element on page (user already clicked at least once on link)
                    if (active.length) {

                        // Close it
                        active.animate({
                            width: "0"
                        }, 200)
                            .animate({
                                height: "0"
                            }, 100, function () {
                                // this happens after above animations are complete
                                $(this).removeClass("active");

                            })

                    } else {
                        // Open it
                        $("#" + page)
                            .addClass("active")
                            .animate({
                                height: "75px"
                            }, 100, 'linear')
                            .animate({
                                width: "500px"
                            }, 100, 'linear')
                    }
                }
            }
        });

        // Slider
        sliderEvt();

        // Color & paint
        colorDrawEvt();

        // temp();

    }

    /**
     * Buttons
     */
    this.buttons = function () {

        // Slider button
        let btnSlide = `<button class="btn" id="btnSlide${idx}"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;&nbsp;`;

        // FreeDrawing buttons handled by draw.js
        let wPaint = `<mark id='mark${idx}'>${options.paintbrushColor}</mark>&nbsp;&nbsp;`;
        let btnDraw = `<button class="btn" id="btnDraw${idx}"><i class="fa fa-pencil-alt"></i> Draw</button>&nbsp;&nbsp;`;

        // Map markers handled by map-marker.js
        // TODO: A toggle for each. (This one does everything.)  Or not!
        let btnMapMarker = `<button class="btn" id="toggle-overlay" style="display: none"><i class="fa fa-map-marker"></i> Hide markers</button>&nbsp;&nbsp;`;

        // Polygon - NEW!
        let btnPolygon = `<button class="btn" id="btnPolygon${idx}"><i class='fas fa-draw-polygon'></i> Draw Polygon</button>&nbsp;&nbsp;`;

        // Grid - NEW!
        let btnGrid = `<button class="btn" id="btnGrid${idx}">Draw Grid&nbsp;&nbsp;`;

        // Attach toolbar to viewer
        div1.innerHTML = innerHtml + wPaint + btnDraw + (options.slidersOn ? btnSlide : "") + btnPolygon + btnGrid + btnMapMarker;
        div.appendChild(div1);

        // Slider
        sliderEvt();

        // Drawing tools
        colorDrawEvt();

        // temp();
    }


    function temp() {
        // TODO:
        document.getElementById("btnPolygon" + idx).addEventListener('click', function () {
            alert("Coming real soon!");
        });
        document.getElementById('btnGrid' + idx).addEventListener('click', function () {
            alert("Coming real soon!");
        })
    }

    function colorDrawEvt() {
        // Color picker event handler
        new Color(document.getElementById('mark' + idx));
    }

    function sliderEvt() {
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
}
