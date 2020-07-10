function Toolbar(div, idx, sliders, options) {
    // Create.
    let chkPan1 = new Toggle("checkbox", "chkPan" + idx, "Match Pan");
    let chkZoom1 = new Toggle("checkbox", "chkZoom" + idx, "Match Zoom");
    let btnSlide = `<button class="btn" id="btnSlide${idx}">Sliders</button>&nbsp;`;
    let wPaint = `<mark id='mark${idx}'>#0f0</mark>&nbsp;&nbsp;`;
    let btnDraw = `<button class="btn" id="btnDraw${idx}">Draw</button>&nbsp;`;

    // Draw.
    let div1 = document.createElement('div');
    div1.innerHTML = (options.multipleOn ? chkPan1.show() + chkZoom1.show() : "") + wPaint + btnDraw + (options.slidersOn ? btnSlide : "");
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
                } else {
                    x.style.display = 'none';
                    sliders[1].style.display = 'none';
                }
            });
        }
    }

    let jsc = new Color(document.getElementById('mark' + idx));
    // let p = new Paint(document.getElementById('btnDraw' + idx));
}
