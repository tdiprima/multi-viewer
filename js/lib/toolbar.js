/**
 * FreeDrawing and Grid handled by markupTools.js
 * Edit polygon handled by editPolygon.js
 * Map markers handled by locationPin.js
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


    /**
     * Fold-out menu
     */
    this.menu = function name() {
        innerHtml += `<a data-page="fold${idx}" href="#"><i class="fa fa-list-alt" aria-hidden="true"></i> Menu</a>
        <div class="fold scrollmenu" id="fold${idx}" style="max-width:400px;margin:0 auto;">
        <a href="#"><mark id="mark${idx}">${options.paintbrushColor}</mark></a>
        <a id="btnDraw${idx}" class="btn" href="#"><i class="fa fa-draw-polygon"></i> Draw polygon</a>
        <a id="btnEdit${idx}" class="btn" href="#"><i class="fa fa-pencil-alt"></i> Edit polygon</button>
        <a id="btnGrid${idx}" class="btn" href="#"><i class="fa fa-border-all"></i> Draw grid</a>
        <a id="btnMarker${idx}" class="btn" href="#"><i class="fa fa-paint-brush"></i> Mark grid</a>
        <a id="btnSlide${idx}" class="btn" href="#"><i class="fa fa-sliders"></i> Show sliders</a>
        <a id="toggle-overlay" style="display: none" href="#"><i class="fa fa-map-marker-alt"></i> Hide markers</a>
    </div>`;


        div1.innerHTML = innerHtml;
        div.appendChild(div1); // Attach toolbar


        // Menu animation
        $("a").on('click', function () {
            let page = $(this).data("page");
            if (typeof page === "undefined") return;
            let ind = page.trim(-1).replace("fold", "");

            if (ind === idx) {
                if ($('div:animated').id !== page) {
                    let active = $(".fold.active"); // if there is visible fold element on page (user already clicked at least once on link)

                    if (active.length) {
                        // Close it
                        active.animate({
                            width: "0"
                        }, 200).animate({
                            height: "0"
                        }, 100, function () {
                            // this happens after above animations are complete
                            $(this).removeClass("active");
                        });
                    } else {
                        // Open it
                        $("#" + page).addClass("active").animate({
                            height: "75px"
                        }, 100, 'linear').animate({
                            width: "500px"
                        }, 100, 'linear');
                    }
                }
            }
        });

        sliderEvt(); // Slider

        colorDrawEvt(); // Color & paint
    };



    /**
     * Buttons
     */
    this.buttons = function () {
        innerHtml += `<div>
        <mark id="mark${idx}">${options.paintbrushColor}</mark></button>&nbsp;&nbsp;
        <button id="btnDraw${idx}" class="btn"><i class="fa fa-pencil-alt"></i> Draw polygon</button>&nbsp;&nbsp;
        <button id="btnEdit${idx}" class="btn"><i class="fa fa-draw-polygon"></i> Edit polygon</button>&nbsp;&nbsp;
        <button id="btnGrid${idx}" class="btn"><i class="fa fa-border-all"></i> Draw grid</button>&nbsp;&nbsp;
        <button id="btnMarker${idx}" class="btn"><i class="fa fa-paint-brush"></i> Mark grid</button>&nbsp;&nbsp;
        <button id="btnSlide${idx}" class="btn"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;&nbsp;
        <button id="toggle-overlay" class="btn" style="display: none"><i class="fa fa-map-marker-alt"></i> Hide markers</button>
    </div>`;


        /*
        // Slider button
        let btnSlide = `<button class="btn" id="btnSlide${idx}"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;&nbsp;`;
             // FreeDrawing buttons handled by markupTools.js
        let wPaint = `<mark id='mark${idx}'>${options.paintbrushColor}</mark>&nbsp;&nbsp;`;
        let btnDraw = `<button class="btn" id="btnDraw${idx}"><i class="fa fa-pencil-alt"></i> Draw</button>&nbsp;&nbsp;`;
             // Map markers handled by locationPin.js
        // TODO: A toggle for each. (This one does everything.)  Or not!
        let btnMapMarker = `<button class="btn" id="toggle-overlay" style="display: none"><i class="fa fa-map-marker"></i> Hide markers</button>&nbsp;&nbsp;`;
             // Grid
        let btnGrid = `<button class="btn" id="btnGrid${idx}">Draw Grid&nbsp;&nbsp;`;
         */

        // Attach toolbar
        // div1.innerHTML = innerHtml + wPaint + btnDraw + (options.slidersOn ? btnSlide : "") + btnGrid + btnMapMarker;


        div1.innerHTML = innerHtml;
        div.appendChild(div1); // Attach toolbar

        sliderEvt(); // Slider

        colorDrawEvt(); // Drawing tools
    };


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
