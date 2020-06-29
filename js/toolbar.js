function Toolbar(div, idx, sliders, options) {
    // Create.
    let chkPan1 = new Toggle("checkbox", "chkPan" + idx, "Match Pan");
    let chkZoom1 = new Toggle("checkbox", "chkZoom" + idx, "Match Zoom");
    let wCog = new Widget("fa fa-cog", "cog" + idx, "#0575fb");
    let wPaint;
    // wPaint = `<span id='mark${idx}'>#0f0</span>&nbsp;&nbsp;`;
    wPaint = `<mark id='mark${idx}'>#0f0</mark>&nbsp;&nbsp;`;
    // wPaint = `<input type="text" id='mark${idx}' value="#0f0" maxlen="8" maxsize="8">&nbsp;&nbsp;`
    let btnDraw = `<button id="btnDraw${idx}">Draw</button>&nbsp;`;
    //fa fa-paint-brush

    // Draw.
    let div1 = document.createElement('div');
    div1.innerHTML = (options.multipleOn ? chkPan1.show() + chkZoom1.show() : "") + wPaint + btnDraw + wCog.show();
    div.appendChild(div1);

    // Event listeners
    if (options.slidersOn) {
        let cog = document.getElementById("cog" + idx);
        if (cog !== null) {
            cog.addEventListener('click', function () {
                let x = sliders[0];
                if (x.style.display === 'none') {
                    x.style.display = 'block';
                    sliders[1].style.display = 'block';
                } else {
                    x.style.display = 'none';
                    sliders[1].style.display = 'none';
                }
            });
        } else {
            console.log('whoa! cog is null.')
        }

    }

    let jsc = new Color(document.getElementById('mark' + idx));
    // let p = new Paint(document.getElementById('btnDraw' + idx));
}
