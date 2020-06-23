function ControlPanel(div, idx, sliders) {
    // Create.
    let chkPan1 = new Toggle("checkbox", "chkPan" + idx, "Match Pan");
    let chkZoom1 = new Toggle("checkbox", "chkZoom" + idx, "Match Zoom");
    let wCog = new Widget("fa fa-cog", "cog" + idx, "#0575fb");
    let wPaint = `<mark id='mark${idx}'>#0f0</mark>&nbsp;&nbsp;`;
    let btnDraw = `<button id="btnDraw${idx}">Draw</button>&nbsp;`;
    //fa fa-paint-brush

    // Draw.
    let div1 = document.createElement('div');
    div1.innerHTML = chkPan1.show() + chkZoom1.show() + wPaint + btnDraw + wCog.show();
    div.appendChild(div1);

    // Event listeners
    let cog = document.getElementById("cog" + idx);
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
    let jsc = new Color(document.getElementById('mark' + idx));
    // let p = new Paint(document.getElementById('btnDraw' + idx), viewer);
}
